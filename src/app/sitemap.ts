import type { MetadataRoute } from "next";
import {
    getTrendingAnime,
    getPopularAnime,
    getTopRatedAnime,
} from "@/lib/anilist";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://vibeanime.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // ── Static routes ──────────────────────────────────────────────────────────
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
        { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
        { url: `${BASE}/search?sort=TRENDING_DESC`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
        { url: `${BASE}/search?sort=POPULARITY_DESC`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
        { url: `${BASE}/search?sort=SCORE_DESC`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ];

    // ── Anime pages ────────────────────────────────────────────────────────────
    let animeIds: number[] = [];
    try {
        // Each function returns data.Page = { pageInfo, media: Anime[] }
        const [trending, popular, topRated] = await Promise.all([
            getTrendingAnime(1),
            getPopularAnime(1),
            getTopRatedAnime(1),
        ]);
        const all = [
            ...(trending?.media ?? []),
            ...(popular?.media ?? []),
            ...(topRated?.media ?? []),
        ];
        const seen = new Set<number>();
        for (const a of all) {
            if (a?.id && !seen.has(a.id)) {
                seen.add(a.id);
                animeIds.push(a.id);
            }
        }
    } catch {
        // silently skip — sitemap still works without anime entries
    }

    const animeRoutes: MetadataRoute.Sitemap = animeIds.flatMap((id) => [
        {
            url: `${BASE}/anime/${id}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        },
        {
            url: `${BASE}/anime/${id}/watch/1`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.85,
        },
    ]);

    return [...staticRoutes, ...animeRoutes];
}
