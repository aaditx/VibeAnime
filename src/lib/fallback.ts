const FALLBACK_DOMAINS = [
    "hianime.to",
    "hianimez.to",
    "hianime.nz",
    "hianime.sx",
    "aniwatch.to"
];

export async function fetchFallbackIframe(episodeId: string, server: "hd-1" | "hd-2", category: "sub" | "dub" | "raw"): Promise<string | null> {
    try {
        // 1. Try to get the iframe link utilizing the stable public API
        // The API already manages Cloudflare bypasses and IP rotation which manual fetch lacks on Vercel
        const apiRes = await fetch(`https://aniwatch-api.vercel.app/api/v2/hianime/episode/sources?animeEpisodeId=${episodeId}&server=${server}&category=${category}`);
        if (apiRes.ok) {
            const apiJson = await apiRes.json();
            // Sometimes the API returns a direct iframe link instead of sources
            if (apiJson.success && apiJson.data?.iframe) {
                return apiJson.data.iframe;
            }
        }
    } catch (e) {
        console.error("Failed to fetch iframe from aniwatch API", e);
    }

    // We cannot reliably scrape hianime/hianimez directly on Vercel anymore due to strict IP bans
    // returning UND_ERR_CONNECT_TIMEOUT consistently.
    return null;
}
