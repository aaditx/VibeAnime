import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWatchProgress, upsertWatchProgress, type WatchProgressEntry } from "@/lib/userDb";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await getWatchProgress(session.user.id);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body: WatchProgressEntry = await req.json();
  if (!body.animeId) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  await upsertWatchProgress(session.user.id, body);
  return NextResponse.json({ success: true });
}
