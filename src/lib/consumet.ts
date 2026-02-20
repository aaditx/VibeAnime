/**
 * Consumet API helper library
 * https://github.com/consumet/api.consumet.org
 *
 * Used for real anime episode lists and streaming sources via gogoanime provider.
 */

const CONSUMET_BASE = (process.env.CONSUMET_API_URL ?? "https://consumet-api.vercel.app").replace(/\/$/, "");

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConsumetEpisode {
  id: string;          // gogoanime episode ID e.g. "naruto-episode-1"
  number: number;
  title: string | null;
  image: string | null;
  description: string | null;
  airDate: string | null;
}

export interface StreamingSource {
  url: string;
  quality: string;     // "1080p" | "720p" | "480p" | "360p" | "backup" | "default"
  isM3U8: boolean;
}

export interface StreamingSubtitle {
  url: string;
  lang: string;
}

export interface StreamingResult {
  sources: StreamingSource[];
  subtitles: StreamingSubtitle[];
  headers: Record<string, string>;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

// ─── Fetch Helpers ───────────────────────────────────────────────────────────

async function consumetFetch<T>(path: string): Promise<T> {
  const url = `${CONSUMET_BASE}${path}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Consumet API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

// ─── Episode List ─────────────────────────────────────────────────────────────

interface EpisodesResponse {
  episodes?: ConsumetEpisode[];
  // some providers wrap differently
  results?: ConsumetEpisode[];
}

/**
 * Fetch the episode list for an AniList anime ID using gogoanime provider.
 * Falls back to zoro if gogoanime returns nothing.
 */
export async function fetchEpisodes(anilistId: number, dub = false): Promise<ConsumetEpisode[]> {
  const dubParam = dub ? "&dub=true" : "";
  try {
    const data = await consumetFetch<EpisodesResponse>(
      `/meta/anilist/episodes/${anilistId}?provider=gogoanime${dubParam}`
    );
    const eps = data.episodes ?? data.results ?? [];
    if (eps.length > 0) return eps;
  } catch {
    // fall through to zoro
  }

  // Fallback: zoro provider
  try {
    const data = await consumetFetch<EpisodesResponse>(
      `/meta/anilist/episodes/${anilistId}?provider=zoro${dubParam}`
    );
    return data.episodes ?? data.results ?? [];
  } catch {
    return [];
  }
}

// ─── Streaming Sources ────────────────────────────────────────────────────────

interface GogoanimeWatchResponse {
  sources?: StreamingSource[];
  subtitles?: StreamingSubtitle[];
  headers?: Record<string, string>;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

/**
 * Fetch streaming sources for a gogoanime episode ID.
 * Returns HLS (.m3u8) sources sorted by quality (highest first).
 */
export async function fetchStreamingSources(episodeId: string): Promise<StreamingResult> {
  const encoded = encodeURIComponent(episodeId);
  const data = await consumetFetch<GogoanimeWatchResponse>(
    `/anime/gogoanime/watch/${encoded}`
  );

  const sources = (data.sources ?? []).sort((a, b) => {
    const order = ["1080p", "720p", "480p", "360p", "default", "backup"];
    return order.indexOf(a.quality) - order.indexOf(b.quality);
  });

  return {
    sources,
    subtitles: data.subtitles ?? [],
    headers: data.headers ?? {},
    intro: data.intro,
    outro: data.outro,
  };
}
