// ─── Badge & Points System ────────────────────────────────────────────────────
// Points are driven by:
//   1. Milestone badge rewards (cumulative, awarded once per tier)
//   2. Passive bonus: +10 pts per unique anime, +2 pts per episode tracked
//
// "Unique anime" = each anime counted once (repeats ignored).
// The watchProgress collection naturally deduplicates by (userId, animeId).

export interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
    threshold: number;   // unique anime needed to earn
    points: number;      // milestone reward points
    color: string;       // CSS colour for glow/border
}

export const BADGE_TIERS: Badge[] = [
    {
        id: "wanderer",
        name: "Wanderer",
        icon: "🌱",
        description: "Took your first step into the world of anime.",
        threshold: 1,
        points: 50,
        color: "#4ade80",
    },
    {
        id: "curious_soul",
        name: "Curious Soul",
        icon: "👀",
        description: "Explored a handful of different series.",
        threshold: 3,
        points: 75,
        color: "#60a5fa",
    },
    {
        id: "casual_viewer",
        name: "Casual Viewer",
        icon: "🎬",
        description: "A regular at the anime screening room.",
        threshold: 5,
        points: 100,
        color: "#a78bfa",
    },
    {
        id: "binge_watcher",
        name: "Binge Watcher",
        icon: "📺",
        description: "You've binged 10 series — no regrets.",
        threshold: 10,
        points: 150,
        color: "#f472b6",
    },
    {
        id: "anime_rookie",
        name: "Anime Rookie",
        icon: "🎯",
        description: "Getting serious — 15 anime under your belt.",
        threshold: 15,
        points: 200,
        color: "#fb923c",
    },
    {
        id: "fan",
        name: "Fan",
        icon: "⭐",
        description: "A genuine anime fan with taste.",
        threshold: 25,
        points: 300,
        color: "#fbbf24",
    },
    {
        id: "enthusiast",
        name: "Enthusiast",
        icon: "🔥",
        description: "Anime isn't just a hobby — it's a lifestyle.",
        threshold: 40,
        points: 400,
        color: "#f97316",
    },
    {
        id: "otaku",
        name: "Otaku",
        icon: "⚡",
        description: "Officially otaku. Your friends are concerned.",
        threshold: 60,
        points: 500,
        color: "#e8002d",
    },
    {
        id: "devotee",
        name: "Devotee",
        icon: "💎",
        description: "85 series — you've seen things others haven't.",
        threshold: 85,
        points: 650,
        color: "#67e8f9",
    },
    {
        id: "connoisseur",
        name: "Connoisseur",
        icon: "🎭",
        description: "100 anime. A true connoisseur of the craft.",
        threshold: 100,
        points: 750,
        color: "#c084fc",
    },
    {
        id: "veteran",
        name: "Veteran",
        icon: "🛡️",
        description: "150 series — battle-hardened anime veteran.",
        threshold: 150,
        points: 1000,
        color: "#94a3b8",
    },
    {
        id: "legend",
        name: "Legend",
        icon: "👑",
        description: "200 anime. Your recommendations are gospel.",
        threshold: 200,
        points: 1500,
        color: "#fcd34d",
    },
    {
        id: "sage",
        name: "Sage",
        icon: "🧠",
        description: "300 series — a sage of infinite anime wisdom.",
        threshold: 300,
        points: 2000,
        color: "#6ee7b7",
    },
    {
        id: "master",
        name: "Master",
        icon: "🏆",
        description: "500 anime. Mastery achieved. What comes next?",
        threshold: 500,
        points: 3000,
        color: "#fb923c",
    },
    {
        id: "anime_god",
        name: "Anime God",
        icon: "⚜️",
        description: "1000 anime. Mortal words cannot describe you.",
        threshold: 1000,
        points: 5000,
        color: "#e8002d",
    },
];

// ─── Point Bonus Constants ────────────────────────────────────────────────────
export const POINTS_PER_UNIQUE_ANIME = 10;
export const POINTS_PER_EPISODE = 2;

// ─── Compute Results ──────────────────────────────────────────────────────────

export interface EarnedBadge extends Badge {
    earnedAt: "earned" | "locked";
}

export interface BadgeComputeResult {
    earnedBadges: EarnedBadge[];
    allBadges: EarnedBadge[];
    points: number;
    uniqueAnimeWatched: number;
    totalEpisodesWatched: number;
    nextBadge: (Badge & { progress: number }) | null;
    highestBadge: Badge | null;
}

export function computeBadges(
    uniqueAnimeWatched: number,
    totalEpisodesWatched: number
): BadgeComputeResult {
    const earned = BADGE_TIERS.filter((b) => uniqueAnimeWatched >= b.threshold);
    const locked = BADGE_TIERS.filter((b) => uniqueAnimeWatched < b.threshold);

    // Milestone reward points (sum of all earned badge point values)
    const milestonePoints = earned.reduce((acc, b) => acc + b.points, 0);
    // Passive bonus points
    const passivePoints =
        uniqueAnimeWatched * POINTS_PER_UNIQUE_ANIME +
        totalEpisodesWatched * POINTS_PER_EPISODE;

    const points = milestonePoints + passivePoints;

    const allBadges: EarnedBadge[] = BADGE_TIERS.map((b) => ({
        ...b,
        earnedAt: uniqueAnimeWatched >= b.threshold ? "earned" : "locked",
    }));

    const nextBadge = locked.length > 0
        ? { ...locked[0], progress: uniqueAnimeWatched }
        : null;

    const highestBadge = earned.length > 0 ? earned[earned.length - 1] : null;

    return {
        earnedBadges: allBadges.filter((b) => b.earnedAt === "earned"),
        allBadges,
        points,
        uniqueAnimeWatched,
        totalEpisodesWatched,
        nextBadge,
        highestBadge,
    };
}
