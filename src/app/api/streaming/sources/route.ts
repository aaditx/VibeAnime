import { NextRequest, NextResponse } from "next/server";
import { fetchEpisodeSources } from "@/lib/streaming";
import { fetchFallbackIframe } from "@/lib/fallback";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * GET /api/streaming/sources
 *
 * Query params:
 *   episodeId  — HiAnime episode ID, e.g. "one-piece-100?ep=2142"
 *   server     — "hd-1" (VidStreaming, default) | "hd-2" (VidCloud)
 *   category   — "sub" (default) | "dub" | "raw"
 *
 * Returns:
 *   { sources, subtitles, headers, megaplayUrl, fallbackIframe? }
 *
 * `megaplayUrl` is always present (non-null) — guaranteed fallback.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const episodeId = searchParams.get("episodeId");
  const server = (searchParams.get("server") ?? "hd-1") as "hd-1" | "hd-2";
  const category = (searchParams.get("category") ?? "sub") as "sub" | "dub" | "raw";

  if (!episodeId) {
    return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
  }

  try {
    const data = await fetchEpisodeSources(episodeId, server, category);

    let mergedSubtitles = data.subtitles || [];

    // If dub, fetch the "sub" category in parallel to extract its subtitles
    if (category === "dub") {
      try {
        const subData = await fetchEpisodeSources(episodeId, server, "sub");
        if (subData?.subtitles?.length) {
          // Merge subtitles, avoiding duplicates by language just in case
          const existingLangs = new Set(mergedSubtitles.map(s => s.lang));
          const newSubs = subData.subtitles.filter(s => !existingLangs.has(s.lang));
          mergedSubtitles = [...mergedSubtitles, ...newSubs];
        }
      } catch (e) {
        // Silently fail the sub fetch, we still want to return the dub stream
        console.error("[/api/streaming/sources] Failed fetching sub subtitles for dub stream", e);
      }
    }

    const responseData = {
      ...data,
      subtitles: mergedSubtitles,
    };

    // data.megaplayUrl is always set inside fetchEpisodeSources.
    // If HLS sources are also empty, additionally attach a freshly-fetched iframe.
    if (!responseData.sources || responseData.sources.length === 0) {
      // fetchFallbackIframe now always returns non-null
      const fallbackIframe = await fetchFallbackIframe(episodeId, server, category);
      return NextResponse.json(
        { ...responseData, fallbackIframe },
        { headers: { ...CORS, "Cache-Control": "private, max-age=1800" } }
      );
    }

    return NextResponse.json(responseData, {
      headers: { ...CORS, "Cache-Control": "private, max-age=1800" },
    });
  } catch (err) {
    console.error("[/api/streaming/sources]", err);
    // Even if everything throws, build an iframe from the ep ID
    const fallbackIframe = await fetchFallbackIframe(episodeId, server, category).catch(() => null);
    // Build megaplay URL from the numeric ep ID in episodeId
    const epNumericId = episodeId.match(/ep=(\d+)/)?.[1];
    const megaplayUrl = epNumericId
      ? `/embed-proxy/stream/s-2/${epNumericId}/${category === "dub" ? "dub" : "sub"}`
      : fallbackIframe?.replace("https://megaplay.buzz", "/embed-proxy") ?? "";
    return NextResponse.json(
      { sources: [], subtitles: [], headers: {}, megaplayUrl, fallbackIframe: fallbackIframe ?? megaplayUrl },
      { status: 200, headers: CORS }
    );
  }
}
