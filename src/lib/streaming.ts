/**
 * Streaming helper library — Self-hosted with fallback
 *
 * PRIMARY: Uses the `aniwatch` npm package (HiAnime scraper) directly.
 *   - Zero external dependencies when deployed on a server with access to hianime.to
 *   - Works in production (vibeanime.app / Vercel) out of the box
 *
 * FALLBACK: If the in-process scraper returns empty results (e.g. hianime.to is
 *   blocked by the local ISP in development), automatically falls back to the
 *   public aniwatch-api instance. Override via HIANIME_API_URL env var to point
 *   at your own self-hosted instance.
 *
 * Video → megaplay.buzz / vidwish.live embed wrappers (iframe fallback)
 *       → OR direct HLS via getEpisodeSources (primary)
 */

import { HiAnime } from "aniwatch";
import { unstable_cache } from "next/cache";

// Singleton scraper — in-process HiAnime scraper
const hianime = new HiAnime.Scraper();

// Fallback REST API base URL (can be overridden with your own self-hosted instance)
const HIANIME_API =
  process.env.HIANIME_API_URL ?? "https://aniwatch-api.vercel.app";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnimeEpisode {
  /** HiAnime episode ID, e.g. "one-piece-100?ep=2142" */
  id: string;
  number: number;
  title: string | null;
  isFiller: boolean;
}

export interface EpisodeSource {
  url: string;
  quality?: string;
  isM3U8?: boolean;
}

export interface EpisodeSubtitle {
  url: string;
  lang: string;
}

export interface EpisodeSources {
  sources: EpisodeSource[];
  subtitles: EpisodeSubtitle[];
  headers: Record<string, string>;
}

// ─── HiAnime search ───────────────────────────────────────────────────────────

/**
 * Search for an anime by title. Tries in-process scraper first; if it returns
 * no results (e.g. hianime.to blocked locally), falls back to REST API.
 * Cached 24 hours — title ↔ animeId mapping rarely changes.
 * 
 * @param title  The anime title to search
 * @param format The Anilist format (e.g., "TV", "MOVIE", "OVA", "SPECIAL") used to improve matching accuracy.
 */
export const searchHiAnimeId = unstable_cache(
  async (title: string, format: string | null = null): Promise<string | null> => {

    // Map Anilist format to HiAnime Type
    let hianimeType: string | null = null;
    if (format === "TV" || format === "TV_SHORT") hianimeType = "TV";
    else if (format === "MOVIE") hianimeType = "Movie";
    else if (format === "SPECIAL") hianimeType = "Special";
    else if (format === "OVA") hianimeType = "OVA";
    else if (format === "ONA") hianimeType = "ONA";

    // Helper function to pick the best match
    const pickBestMatch = (animes: { id: string; name: string; type: string }[]) => {
      if (animes.length === 0) return null;
      const titleLower = title.toLowerCase();
      const exact = animes.find((a) => a.name?.toLowerCase() === titleLower);
      if (exact?.id) return exact.id;

      let formatMatch = null;
      if (hianimeType) {
        formatMatch = animes.find((a) => a.type?.toLowerCase() === hianimeType?.toLowerCase());
        if (formatMatch?.id) return formatMatch.id;
      }

      const tvMatch = animes.find((a) => a.type === "TV");
      return (tvMatch ?? animes[0]).id ?? null;
    };

    // ── Primary: in-process scraper ──
    try {
      const result = await hianime.search(title, 1);
      const animes = result.animes ?? [];
      const bestMatch = pickBestMatch(animes as any);
      if (bestMatch) return bestMatch;
    } catch {
      // scraper blocked or failed — fall through to API
    }

    // ── Fallback: REST API ──
    try {
      const res = await fetch(
        `${HIANIME_API}/api/v2/hianime/search?q=${encodeURIComponent(title)}&page=1`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) return null;
      const json = await res.json();
      const animes: { id: string; name: string; type: string }[] =
        json?.data?.animes ?? [];

      return pickBestMatch(animes);
    } catch {
      return null;
    }
  },
  ["hianime-search-id-v2"],
  { revalidate: 86400, tags: ["hianime", "search"] }
);

// ─── HiAnime episode list ─────────────────────────────────────────────────────

/**
 * Fetch episodes for a HiAnime anime ID. Tries in-process scraper first; if
 * episodes come back empty, falls back to REST API. Cached 1 hour.
 */
export const fetchHiAnimeEpisodes = unstable_cache(
  async (hianimeId: string): Promise<AnimeEpisode[]> => {
    // ── Primary: in-process scraper ──
    try {
      const result = await hianime.getEpisodes(hianimeId);
      const episodes = result.episodes ?? [];
      // Only accept if we got real episodeIds (scraper succeeded)
      const valid = episodes.filter((ep) => !!ep.episodeId);
      if (valid.length > 0) {
        return valid.map((ep) => ({
          id: ep.episodeId!,
          number: ep.number,
          title: ep.title ?? null,
          isFiller: ep.isFiller ?? false,
        }));
      }
    } catch {
      // fall through
    }

    // ── Fallback: REST API ──
    try {
      const res = await fetch(
        `${HIANIME_API}/api/v2/hianime/anime/${encodeURIComponent(hianimeId)}/episodes`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) return [];
      const json = await res.json();
      const episodes: { episodeId: string; number: number; title: string; isFiller: boolean }[] =
        json?.data?.episodes ?? [];
      return episodes.map((ep) => ({
        id: ep.episodeId,
        number: ep.number,
        title: ep.title || null,
        isFiller: ep.isFiller ?? false,
      }));
    } catch {
      return [];
    }
  },
  ["hianime-episodes-v2"],
  { revalidate: 3600, tags: ["hianime", "episodes"] }
);

// ─── Combined: search + episodes ─────────────────────────────────────────────

export const fetchEpisodesForAnime = unstable_cache(
  async (
    title: string,
    format: string | null = null
  ): Promise<{ hianimeId: string | null; episodes: AnimeEpisode[] }> => {
    const hianimeId = await searchHiAnimeId(title, format);
    if (!hianimeId) return { hianimeId: null, episodes: [] };
    const episodes = await fetchHiAnimeEpisodes(hianimeId);
    return { hianimeId, episodes };
  },
  ["hianime-episodes-for-anime-v2-with-format"],
  { revalidate: 21600, tags: ["hianime", "episodes"] }
);

// ─── Episode sources (HLS) ────────────────────────────────────────────────────

/**
 * Fetch real HLS streaming sources for an episode.
 * Tries in-process scraper first; falls back to REST API.
 * NOT cached — video URLs are signed and expire within hours.
 *
 * @param episodeId  Full HiAnime episode ID, e.g. "one-piece-100?ep=2142"
 * @param server     "hd-1" (VidStreaming) | "hd-2" (VidCloud)
 * @param category   "sub" | "dub" | "raw"
 */
export async function fetchEpisodeSources(
  episodeId: string,
  server: "hd-1" | "hd-2" = "hd-1",
  category: "sub" | "dub" | "raw" = "sub"
): Promise<EpisodeSources> {
  // ── Primary: in-process scraper ──
  try {
    const result = await hianime.getEpisodeSources(episodeId, server, category);
    const sources = (result.sources ?? []).map((s) => ({
      url: s.url,
      quality: s.quality,
      isM3U8: s.isM3U8 ?? s.url.includes(".m3u8"),
    }));
    if (sources.length > 0) {
      return {
        sources,
        subtitles: (result.subtitles ?? [])
          .filter((s) => s.lang !== "Thumbnails")
          .map((s) => ({ url: s.url, lang: s.lang })),
        headers: (result.headers as Record<string, string>) ?? {},
      };
    }
  } catch {
    // fall through
  }

  // ── Fallback: REST API ──
  try {
    const params = new URLSearchParams({
      animeEpisodeId: episodeId,
      server,
      category,
    });
    const res = await fetch(`${HIANIME_API}/api/v2/hianime/episode/sources?${params}`);
    if (!res.ok) return { sources: [], subtitles: [], headers: {} };
    const json = await res.json();
    const data = json?.data ?? {};
    return {
      sources: (data.sources ?? []).map((s: { url: string; quality?: string; isM3U8?: boolean }) => ({
        url: s.url,
        quality: s.quality,
        isM3U8: s.isM3U8 ?? s.url.includes(".m3u8"),
      })),
      subtitles: (data.subtitles ?? [])
        .filter((s: { lang: string }) => s.lang !== "Thumbnails")
        .map((s: { url: string; lang: string }) => ({ url: s.url, lang: s.lang })),
      headers: (data.headers as Record<string, string>) ?? {},
    };
  } catch {
    return { sources: [], subtitles: [], headers: {} };
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

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
  return `https://megaplay.buzz/stream/s-2/${epId}/${isDub ? "dub" : "sub"}`;
}
