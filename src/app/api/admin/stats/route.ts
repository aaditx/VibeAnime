import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMongoClient } from "@/lib/mongodb";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  if (!ADMIN_EMAIL || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await getMongoClient();
  const db = client.db("vibeanime");

  const [users, watchlistCount, progressCount] = await Promise.all([
    db
      .collection("users")
      .find({}, { projection: { _id: 0, passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray(),
    db.collection("watchlist").countDocuments(),
    db.collection("watchProgress").countDocuments(),
  ]);

  return NextResponse.json({
    totalUsers: users.length,
    totalWatchlistEntries: watchlistCount,
    totalWatchProgressEntries: progressCount,
    users,
  });
}
