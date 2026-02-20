/**
 * Streaming helper library
 *
 * Episodes → HiAnime REST API (aniwatch-api.vercel.app)
 * Video    → megaplay.buzz / vidwish.live (HiAnime-compatible embed wrappers)
 *            These use the numeric episode ID from HiAnime (e.g. 2142 from "?ep=2142")
 *            and serve the video natively without X-Frame-Options or CDN blocking.
 *
 * Technique sourced from: github.com/devxoshakya/anveshna
 */

const HIANIME_API = "https://aniwatch-api.vercel.app";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnimeEpisode {
  /** HiAnime episode ID, e.g. "one-piece-100?ep=2142" */
  id: string;
  number: number;
  title: string | null;
  image?: string | null;
  isFiller: boolean;
}

// ─── Embed URL helpers ───────────────────────────────────────────────────────

/**
 * Extracts the numeric episode ID from a HiAnime episode ID string.
 * e.g. "one-piece-100?ep=2142" → "2142"
 */
export function extractHiAnimeEpId(hianimeEpisodeId: string): string | null {
  const match = hianimeEpisodeId.match(/ep=(\d+)/);
  return match ? match[1] : null;
}

/**
 * Build a megaplay.buzz embed URL (primary source — sub or dub).
 * Format: https://megaplay.buzz/stream/s-2/{epId}/{sub|dub}
 * Used by anveshna.devshakya.xyz and compatible with HiAnime episode IDs.
 */
export function buildMegaplayUrl(epId: string, isDub = false): string {
  return `https://megaplay.buzz/stream/s-2/${epId}/${isDub ? "dub" : "sub"}`;
}

/**
 * Build a vidwish.live embed URL (alternate source).
 * Format: https://vidwish.live/stream/s-2/{epId}/{sub|dub}
 */
export function buildVidwishUrl(epId: string, isDub = false): string {
  return `https://vidwish.live/stream/s-2/${epId}/${isDub ? "dub" : "sub"}`;
}

/** @deprecated Use buildMegaplayUrl instead */
export function toGogoSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── HiAnime REST API ─────────────────────────────────────────────────────────

interface HiAnimeSearchResult {
  id: string;
  name: string;
  jname: string;
  type: string;
}

/**
 * Search HiAnime for an anime by title.
 * Returns the best-matching HiAnime anime ID (e.g. "one-piece-100").
 */
export async function searchHiAnimeId(title: string): Promise<string | null> {
  try {
    const url = `${HIANIME_API}/api/v2/hianime/search?q=${encodeURIComponent(title)}&page=1`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 1 day
    if (!res.ok) return null;

    const json = await res.json();
    const animes: HiAnimeSearchResult[] = json?.data?.animes ?? [];
    if (animes.length === 0) return null;

    // Prefer exact English title match, then exact Japanese, then first result
    const titleLower = title.toLowerCase();
    const exact = animes.find((a) => a.name.toLowerCase() === titleLower);
    if (exact) return exact.id;

    // Fuzzy: TV series only (ignore movies/specials)
    const tvMatch = animes.find((a) => a.type === "TV");
    return (tvMatch ?? animes[0]).id;
  } catch {
    return null;
  }
}

interface HiAnimeEpisodeRaw {
  title: string;
  episodeId: string;
  number: number;
  isFiller: boolean;
}

/**
 * Fetch the episode list for a HiAnime anime ID.
 */
export async function fetchHiAnimeEpisodes(hianimeId: string): Promise<AnimeEpisode[]> {
  try {
    const url = `${HIANIME_API}/api/v2/hianime/anime/${encodeURIComponent(hianimeId)}/episodes`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hr
    if (!res.ok) return [];

    const json = await res.json();
    const episodes: HiAnimeEpisodeRaw[] = json?.data?.episodes ?? [];

    return episodes.map((ep) => ({
      id: ep.episodeId,
      number: ep.number,
      title: ep.title || null,
      isFiller: ep.isFiller ?? false,
    }));
  } catch {
    return [];
  }
}

/**
 * Combined: search by title and fetch episodes.
 * Returns { hianimeId, episodes } where episodes is empty if search fails.
 */
export async function fetchEpisodesForAnime(title: string): Promise<{
  hianimeId: string | null;
  episodes: AnimeEpisode[];
}> {
  const hianimeId = await searchHiAnimeId(title);
  if (!hianimeId) return { hianimeId: null, episodes: [] };

  const episodes = await fetchHiAnimeEpisodes(hianimeId);
  return { hianimeId, episodes };
}
