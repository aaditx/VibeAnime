import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/anilist";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || undefined;
  const genre = searchParams.get("genre") || undefined;
  const format = searchParams.get("format") || undefined;
  const status = searchParams.get("status") || undefined;
  const season = searchParams.get("season") || undefined;
  const yearStr = searchParams.get("year");
  const year = yearStr ? parseInt(yearStr) : undefined;
  const sortStr = searchParams.get("sort");
  const sort = sortStr ? sortStr.split(",") : ["TRENDING_DESC"];
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = parseInt(searchParams.get("perPage") ?? "24");

  try {
    const result = await searchAnime({
      search,
      genre,
      format: format as never,
      status: status as never,
      season: season as never,
      year,
      sort: sort as never,
      page,
      perPage,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ media: [], pageInfo: {} }, { status: 500 });
  }
}
