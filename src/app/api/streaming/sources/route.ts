import { NextRequest, NextResponse } from "next/server";
import { fetchEpisodeSources } from "@/lib/streaming";

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
 *   { sources: [{ url, quality, isM3U8 }], subtitles: [{ url, lang }], headers }
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
    return NextResponse.json(data, {
      headers: {
        // Short cache: signed URLs expire within a few hours
        "Cache-Control": "private, max-age=1800",
      },
    });
  } catch (err) {
    console.error("[/api/streaming/sources]", err);
    return NextResponse.json(
      { sources: [], subtitles: [], headers: {} },
      { status: 200 }
    );
  }
}
