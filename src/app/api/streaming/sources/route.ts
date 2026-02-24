import { NextRequest, NextResponse } from "next/server";
import { fetchEpisodeSources } from "@/lib/streaming";
import { fetchFallbackIframe } from "@/lib/fallback";

export const dynamic = "force-dynamic";

/**
 * GET /api/streaming/sources
 *
 * Query params:
 *   episodeId  — HiAnime episode ID, e.g. "one-piece-100?ep=2142"
 *   server     — "hd-1" (VidStreaming, default) | "hd-2" (VidCloud)
 *   category   — "sub" (default) | "dub" | "raw"
 *
 * Returns:
 *   { sources: [{ url, quality, isM3U8 }], subtitles: [{ url, lang }], headers, fallbackIframe?: string }
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

    // If HLS extraction fails or returns nothing, proactively fetch iframe
    if (!data.sources || data.sources.length === 0) {
      const fallbackUrl = await fetchFallbackIframe(episodeId, server, category);
      return NextResponse.json({ ...data, fallbackIframe: fallbackUrl }, {
        headers: { "Cache-Control": "private, max-age=1800" },
      });
    }

    return NextResponse.json(data, {
      headers: {
        // Short cache: signed URLs expire within a few hours
        "Cache-Control": "private, max-age=1800",
      },
    });
  } catch (err) {
    console.error("[/api/streaming/sources]", err);
    // Even if it throws, try fetching the iframe
    const fallbackUrl = await fetchFallbackIframe(episodeId, server, category);
    return NextResponse.json(
      { sources: [], subtitles: [], headers: {}, fallbackIframe: fallbackUrl },
      { status: 200 }
    );
  }
}
