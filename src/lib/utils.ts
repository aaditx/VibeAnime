import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number | null): string {
  if (!score) return "N/A";
  return (score / 10).toFixed(1);
}

export function formatStatus(status: string | null): string {
  if (!status) return "Unknown";
  const map: Record<string, string> = {
    RELEASING: "Airing",
    FINISHED: "Finished",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
    HIATUS: "On Hiatus",
  };
  return map[status] ?? status;
}

export function formatSeason(season: string | null, year: number | null): string {
  if (!season && !year) return "Unknown";
  const s = season
    ? season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()
    : "";
  return [s, year].filter(Boolean).join(" ");
}

export function formatFormat(format: string | null): string {
  if (!format) return "?";
  const map: Record<string, string> = {
    TV: "TV",
    TV_SHORT: "TV Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
    MANGA: "Manga",
    NOVEL: "Novel",
    ONE_SHOT: "One Shot",
  };
  return map[format] ?? format;
}

export function stripHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export function getEpisodeList(totalEpisodes: number | null, nextAiring?: { episode: number } | null): number[] {
  const total = totalEpisodes ?? (nextAiring ? nextAiring.episode - 1 : 12);
  return Array.from({ length: Math.max(total, 1) }, (_, i) => i + 1);
}

export function timeUntilAiring(airingAt: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = airingAt - now;
  if (diff <= 0) return "Aired";
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export function getAnimeTitle(title: { romaji: string; english: string | null; native: string }): string {
  return title.english ?? title.romaji ?? title.native;
}
