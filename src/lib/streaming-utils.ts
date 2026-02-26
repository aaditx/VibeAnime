/**
 * Pure streaming utilities — safe to import in both server and client components.
 * No external dependencies, no Node.js built-ins.
 */

/**
 * Extracts the numeric episode ID from a HiAnime episode ID string.
 * e.g. "one-piece-100?ep=2142" → "2142"
 */
export function extractHiAnimeEpId(hianimeEpisodeId: string): string | null {
    const match = hianimeEpisodeId.match(/ep=(\d+)/);
    return match ? match[1] : null;
}

/**
 * Build a megaplay.buzz embed URL — fallback iframe when HLS is unavailable.
 */
export function buildMegaplayUrl(epId: string, isDub = false): string {
    return `/embed-proxy/stream/s-2/${epId}/${isDub ? "dub" : "sub"}`;
}
