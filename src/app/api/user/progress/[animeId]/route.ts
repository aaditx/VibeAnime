import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteWatchProgress } from "@/lib/userDb";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ animeId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { animeId } = await params;
  await deleteWatchProgress(session.user.id, Number(animeId));
  return NextResponse.json({ success: true });
}
