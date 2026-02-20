import { NextRequest, NextResponse } from "next/server";

// Sources endpoint is deprecated — streaming now uses GogoAnime iframe embeds.
// Kept to avoid 404s if any client still calls this endpoint.
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { sources: [], subtitles: [], headers: {}, message: "Use iframe embeds instead" },
    { status: 200 }
  );
}
