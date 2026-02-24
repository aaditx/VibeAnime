import { NextRequest, NextResponse } from "next/server";
import { fetchEpisodesForAnime } from "@/lib/streaming";
import { getAnimeDetail } from "@/lib/anilist";
import { getAnimeTitle } from "@/lib/utils";

export const revalidate = 3600;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const anilistId = Number(id);

  if (isNaN(anilistId)) {
    return NextResponse.json({ error: "Invalid anime ID" }, { status: 400 });
  }

  try {
    const anime = await getAnimeDetail(anilistId);
    const title = getAnimeTitle(anime.title);
    const { hianimeId, episodes } = await fetchEpisodesForAnime(title);
    return NextResponse.json({ episodes, hianimeId }, { headers: CORS });
  } catch (err) {
    console.error("[/api/streaming/episodes]", err);
    return NextResponse.json({ episodes: [], hianimeId: null }, { status: 200, headers: CORS });
  }
}
