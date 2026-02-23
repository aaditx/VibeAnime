import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://vibeanime.app";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // Don't index API routes, auth pages, or user-specific data
                disallow: ["/api/", "/auth/", "/watchlist"],
            },
        ],
        sitemap: `${BASE}/sitemap.xml`,
        host: BASE,
    };
}
