import { auth } from "@/auth";
import { getUserWatchStats, getUserProfile } from "@/lib/userDb";
import { computeBadges } from "@/lib/badges";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [stats, profile] = await Promise.all([
        getUserWatchStats(session.user.id),
        getUserProfile(session.user.id)
    ]);

    const result = computeBadges(stats.uniqueAnimeWatched, stats.totalEpisodesWatched);

    return NextResponse.json({ ...result, avatarId: profile.avatarId });
}
