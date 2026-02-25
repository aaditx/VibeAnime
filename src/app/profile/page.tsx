import { auth } from "@/auth";
import { getUserWatchStats } from "@/lib/userDb";
import { computeBadges, BADGE_TIERS } from "@/lib/badges";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const metadata = { title: "Profile | VibeAnime" };

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { uniqueAnimeWatched, totalEpisodesWatched } = await getUserWatchStats(
        session.user.id!
    );

    const result = computeBadges(uniqueAnimeWatched, totalEpisodesWatched);

    return (
        <ProfileClient
            user={{ name: session.user.name!, email: session.user.email! }}
            stats={result}
            totalTiers={BADGE_TIERS.length}
        />
    );
}
