import * as cheerio from "cheerio";

/**
 * Scrape streaming sources from anikai.to for a given anime episode URL.
 * @param episodeUrl Full URL to the episode page on anikai.to
 * @returns Array of streaming source URLs (m3u8 or mp4)
 */
export async function scrapeAnikaiSources(episodeUrl: string): Promise<string[]> {
  const res = await fetch(episodeUrl);
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);

  // Example: Find all <iframe> or <video> tags, or script blocks with sources
  const sources: string[] = [];

  // Look for iframes (common for streaming embeds)
  $("iframe").each((_, el) => {
    const src = $(el).attr("src");
    if (src && (src.includes(".m3u8") || src.includes(".mp4") || src.startsWith("http"))) {
      sources.push(src);
    }
  });

  // Look for <video> tags
  $("video source").each((_, el) => {
    const src = $(el).attr("src");
    if (src && (src.includes(".m3u8") || src.includes(".mp4"))) {
      sources.push(src);
    }
  });

  // TODO: Add more scraping logic if needed (e.g., parse scripts for dynamic sources)

  return sources;
}
