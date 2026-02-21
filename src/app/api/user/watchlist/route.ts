import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWatchlist, upsertWatchlistItem, type WatchlistEntry } from "@/lib/userDb";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await getWatchlist(session.user.id);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body: WatchlistEntry = await req.json();
  if (!body.id) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  await upsertWatchlistItem(session.user.id, body);
  return NextResponse.json({ success: true });
}
