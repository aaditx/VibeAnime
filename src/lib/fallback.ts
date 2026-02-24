const HIANIME_API =
    process.env.HIANIME_API_URL ?? "https://aniwatch-api.vercel.app";

/**
 * Build a guaranteed fallback iframe URL for an episode.
 *
 * Resolution order:
 *  1. Ask the aniwatch REST API for an iframe link (rare but possible)
 *  2. Always return a megaplay.buzz embed URL as the final guarantee
 *
 * Returns non-null — the player always has something to render.
 */
export async function fetchFallbackIframe(
    episodeId: string,
    server: "hd-1" | "hd-2",
    category: "sub" | "dub" | "raw"
): Promise<string> {
    // 1. Try the public aniwatch API for a ready-made iframe link
    try {
        const params = new URLSearchParams({ animeEpisodeId: episodeId, server, category });
        const apiRes = await fetch(
            `${HIANIME_API}/api/v2/hianime/episode/sources?${params}`
        );
        if (apiRes.ok) {
            const apiJson = await apiRes.json();
            if (apiJson.success && apiJson.data?.iframe) {
                return apiJson.data.iframe;
            }
        }
    } catch (e) {
        console.error("[fallback] aniwatch API iframe fetch failed", e);
    }

    // 2. Build a megaplay.buzz embed from the numeric episode ID — always works
    const epNumericId = episodeId.match(/ep=(\d+)/)?.[1];
    if (epNumericId) {
        return `https://megaplay.buzz/stream/s-2/${epNumericId}/${category === "dub" ? "dub" : "sub"}`;
    }

    // 3. Generic megaplay embed using the slug directly (last resort)
    const slug = episodeId.split("?")[0];
    return `https://megaplay.buzz/stream/s-2/${slug}/sub`;
}
