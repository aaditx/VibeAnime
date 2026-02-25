import { auth } from "@/auth";
import { getLeaderboard } from "@/lib/userDb";
import { BADGE_TIERS } from "@/lib/badges";
import { redirect } from "next/navigation";
import LeaderboardClient from "./LeaderboardClient";

export const metadata = { title: "Global Leaderboard | VibeAnime" };
export const revalidate = 300; // revalidate every 5 minutes

export default async function LeaderboardPage() {
    const session = await auth();

    let currentUserId: string | null = null;
    if (session?.user?.id) {
        currentUserId = session.user.id;
    }

    const entries = await getLeaderboard(50);

    return (
        <LeaderboardClient
            entries={entries}
            currentUserId={currentUserId}
            badgeTiers={BADGE_TIERS}
        />
    );
}
