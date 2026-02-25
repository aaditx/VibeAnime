/**
 * Streaming helper library — Self-hosted with multi-server fallback
 *
 * PRIMARY:   Uses the `aniwatch` npm package (HiAnime scraper) directly.
 *              Tries hd-1 first, then hd-2 automatically.
 * SECONDARY: Falls back to the public aniwatch-api REST instance
 *              (override via HIANIME_API_URL env var for self-hosted).
 * TERTIARY:  Always surfaces a megaplay.buzz embed URL so the player
 *              has something to show even when HLS extraction fails entirely.
 */

import { HiAnime } from "aniwatch";
import { unstable_cache } from "next/cache";
import { extractHiAnimeEpId, buildMegaplayUrl } from "@/lib/streaming-utils";
export { extractHiAnimeEpId, buildMegaplayUrl };

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
  /** Always non-null — megaplay.buzz embed URL as a guaranteed last resort */
  megaplayUrl: string;
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
const MANUAL_MAPPING: Record<string, string> = {
  // Map missing OVAs to "null" to fallback to megaplay instead of streaming the WRONG anime series
  "the seven deadly sins ova": "null",
  "nanatsu no taizai ova": "null",

  // --------------------------------------------------------------------------
  // HOTFIX MAPPINGS FOR POPULAR ANIME WHERE ANILIST AND HIANIME DISAGREE
  // --------------------------------------------------------------------------

  // Jujutsu Kaisen
  "jujutsu kaisen season 3: the culling game part 1": "jujutsu-kaisen-the-culling-game-part-1-20401",
  "jujutsu kaisen season 3": "jujutsu-kaisen-the-culling-game-part-1-20401",
  "jujutsu kaisen: the culling game": "jujutsu-kaisen-the-culling-game-part-1-20401",
  "jujutsu kaisen: the culling game part 1": "jujutsu-kaisen-the-culling-game-part-1-20401",
  "jujutsu kaisen 3rd season": "jujutsu-kaisen-the-culling-game-part-1-20401",
  "jujutsu kaisen 2nd season": "jujutsu-kaisen-2nd-season-18413",
  "jujutsu kaisen season 2": "jujutsu-kaisen-2nd-season-18413",

  // Attack on Titan
  "attack on titan final season the final chapters special 1": "attack-on-titan-the-final-season-part-3-18329",
  "attack on titan final season the final chapters special 2": "attack-on-titan-the-final-season-part-4-18501",
  "attack on titan: the final season - the final chapters special 1": "attack-on-titan-the-final-season-part-3-18329",
  "attack on titan: the final season - the final chapters special 2": "attack-on-titan-the-final-season-part-4-18501",

  // Demon Slayer
  "demon slayer: kimetsu no yaiba hashira training arc": "demon-slayer-kimetsu-no-yaiba-hashira-training-arc-19107",
  "demon slayer: kimetsu no yaiba swordsmith village arc": "demon-slayer-kimetsu-no-yaiba-swordsmith-village-arc-18056",
  "demon slayer: kimetsu no yaiba entertainment district arc": "demon-slayer-kimetsu-no-yaiba-entertainment-district-arc-17688",
  "demon slayer: kimetsu no yaiba mugen train arc": "demon-slayer-kimetsu-no-yaiba-mugen-train-arc-17687",

  // My Hero Academia
  "my hero academia season 7": "my-hero-academia-season-7-19146",
  "my hero academia season 6": "my-hero-academia-season-6-18151",

  // Bleach
  "bleach: thousand-year blood war": "bleach-thousandyear-blood-war-18231",
  "bleach: thousand-year blood war - the separation": "bleach-thousandyear-blood-war-the-separation-18448",
  "bleach: thousand-year blood war - the conflict": "bleach-thousand-year-blood-war-part-3-the-conflict-19277",

  // Mushoku Tensei
  "mushoku tensei: jobless reincarnation season 2": "mushoku-tensei-jobless-reincarnation-season-2-18428",
  "mushoku tensei: jobless reincarnation season 2 part 2": "mushoku-tensei-jobless-reincarnation-season-2-part-2-18868",

  // Tokyo Revengers
  "tokyo revengers: christmas showdown": "tokyo-revengers-christmas-showdown-18239",
  "tokyo revengers: tenjiku arc": "tokyo-revengers-tenjiku-arc-18512",

  // Spy x Family
  "spy x family season 2": "spy-x-family-season-2-18507",
  "spy x family part 2": "spy-x-family-part-2-18195",

  // One Punch Man
  "one punch man season 2": "one-punch-man-2-86",

  // Kaguya-sama
  "kaguya-sama: love is war -ultra romantic-": "kaguyasama-love-is-war-ultra-romantic-18029",
  "kaguya-sama: love is war -the first kiss that never ends-": "kaguyasama-love-is-war-the-first-kiss-that-never-ends-18290",
};

export const searchHiAnimeId = unstable_cache(
  async (title: string, format: string | null = null): Promise<string | null> => {
    // ── Pre-check: Manual overrides ──
    const titleLowerStr = title.toLowerCase();
    if (MANUAL_MAPPING[titleLowerStr] !== undefined) {
      const mapped = MANUAL_MAPPING[titleLowerStr];
      return mapped === "null" ? null : mapped;
    }


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

      // If we were looking for a specific non-TV format and didn't find it,
      // it's better to fail (and try fallback) than return a completely wrong TV show.
      if (hianimeType && hianimeType !== "TV" && hianimeType !== "ONA") {
        const anyMatch = animes.find((a) => a.name?.toLowerCase().includes(titleLower));
        if (anyMatch?.id) return anyMatch.id;
        return null;
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
 * Internal helper: try the aniwatch in-process scraper for a given server/category.
 * Returns null on failure or empty results.
 */
async function tryScraperSources(
  episodeId: string,
  server: "hd-1" | "hd-2",
  category: "sub" | "dub" | "raw"
): Promise<Omit<EpisodeSources, "megaplayUrl"> | null> {
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
  return null;
}

/**
 * Internal helper: try the REST API fallback for a given server/category.
 * Returns null on failure or empty results.
 */
async function tryApiSources(
  episodeId: string,
  server: "hd-1" | "hd-2",
  category: "sub" | "dub" | "raw"
): Promise<Omit<EpisodeSources, "megaplayUrl"> | null> {
  try {
    const params = new URLSearchParams({ animeEpisodeId: episodeId, server, category });
    const res = await fetch(`${HIANIME_API}/api/v2/hianime/episode/sources?${params}`);
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? {};
    const sources = (data.sources ?? []).map((s: { url: string; quality?: string; isM3U8?: boolean }) => ({
      url: s.url,
      quality: s.quality,
      isM3U8: s.isM3U8 ?? s.url.includes(".m3u8"),
    }));
    if (sources.length > 0) {
      return {
        sources,
        subtitles: (data.subtitles ?? [])
          .filter((s: { lang: string }) => s.lang !== "Thumbnails")
          .map((s: { url: string; lang: string }) => ({ url: s.url, lang: s.lang })),
        headers: (data.headers as Record<string, string>) ?? {},
      };
    }
  } catch {
    // fall through
  }
  return null;
}

/**
 * Fetch real HLS streaming sources for an episode.
 *
 * Resolution order for hd-1 / hd-2:
 *   1. In-process scraper, hd-1
 *   2. In-process scraper, hd-2
 *   3. REST API, hd-1
 *   4. REST API, hd-2
 *   5. Guaranteed megaplay.buzz iframe URL (always set)
 *
 * NOT cached — video URLs are signed and expire within hours.
 *
 * @param episodeId  Full HiAnime episode ID, e.g. "one-piece-100?ep=2142"
 * @param server     "hd-1" (VidStreaming) | "hd-2" (VidCloud) | "anikai-1" | "anikai-2"
 * @param category   "sub" | "dub" | "raw"
 */
export async function fetchEpisodeSources(
  episodeId: string,
  server: "hd-1" | "hd-2" | "anikai-1" | "anikai-2" = "hd-1",
  category: "sub" | "dub" | "raw" = "sub"
): Promise<EpisodeSources> {
  // Build the guaranteed megaplay fallback URL from the numeric ep ID
  const epNumericId = extractHiAnimeEpId(episodeId);
  const megaplayUrl = epNumericId
    ? buildMegaplayUrl(epNumericId, category === "dub")
    : buildMegaplayUrl("0", false); // non-null placeholder

  // ── AnimeKai servers (scraper not available in production) ──
  if (server === "anikai-1" || server === "anikai-2") {
    return { sources: [], subtitles: [], headers: {}, megaplayUrl };
  }

  // ── Primary server requested by caller ──
  const primaryServer: "hd-1" | "hd-2" = server === "hd-2" ? "hd-2" : "hd-1";
  const secondaryServer: "hd-1" | "hd-2" = primaryServer === "hd-1" ? "hd-2" : "hd-1";

  // 1. Try in-process scraper — primary server
  const scraperPrimary = await tryScraperSources(episodeId, primaryServer, category);
  if (scraperPrimary) return { ...scraperPrimary, megaplayUrl };

  // 2. Try in-process scraper — secondary server (automatic cascade)
  const scraperSecondary = await tryScraperSources(episodeId, secondaryServer, category);
  if (scraperSecondary) return { ...scraperSecondary, megaplayUrl };

  // 3. Try REST API — primary server
  const apiPrimary = await tryApiSources(episodeId, primaryServer, category);
  if (apiPrimary) return { ...apiPrimary, megaplayUrl };

  // 4. Try REST API — secondary server
  const apiSecondary = await tryApiSources(episodeId, secondaryServer, category);
  if (apiSecondary) return { ...apiSecondary, megaplayUrl };

  // 5. All HLS paths failed — return empty sources but valid megaplay URL
  console.warn(`[streaming] All HLS sources failed for ${episodeId} (${server}/${category}). Using megaplay fallback.`);
  return { sources: [], subtitles: [], headers: {}, megaplayUrl };
}

// Pure utilities are exported from @/lib/streaming-utils (client-safe, no Node deps)
