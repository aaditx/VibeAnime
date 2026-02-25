import { auth } from "@/auth";
import { getUserWatchStats, getUserProfile, updateUserStreak, saveTotalPoints } from "@/lib/userDb";
import { computeBadges } from "@/lib/badges";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [stats, profile, { loginStreak }] = await Promise.all([
        getUserWatchStats(session.user.id),
        getUserProfile(session.user.id),
        updateUserStreak(session.user.id), // idempotent per day
    ]);

    const result = computeBadges(stats.uniqueAnimeWatched, stats.totalEpisodesWatched, loginStreak);

    // Persist the updated total points so the leaderboard query stays fast
    await saveTotalPoints(session.user.id, result.points);

    return NextResponse.json({ ...result, avatarId: profile.avatarId });
}

