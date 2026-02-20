import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * HLS Proxy - fetches .m3u8 playlists and .ts segments server-side,
 * injecting the correct Referer header so hotlink protection is bypassed.
 *
 * Usage:
 *   /api/streaming/proxy?url=<encoded-url>&referer=<encoded-referer>
 *
 * For .m3u8 files: rewrites all relative/absolute URIs in the playlist
 *   to point back through this proxy so segment requests also get the
 *   correct Referer.
 */
export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  const referer = req.nextUrl.searchParams.get("referer") ?? "https://gogoanime.tel/";

  if (!rawUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid url parameter", { status: 400 });
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        Referer: referer,
        Origin: new URL(referer).origin,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "*/*",
      },
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    const isM3U8 =
      contentType.includes("mpegurl") ||
      contentType.includes("x-mpegurl") ||
      targetUrl.pathname.endsWith(".m3u8") ||
      targetUrl.pathname.endsWith(".m3u");

    if (isM3U8) {
      // Rewrite playlist so all URIs are routed through this proxy
      const text = await upstream.text();
      const base = new URL(".", targetUrl).toString();
      const appBase = req.nextUrl.origin;

      /**
       * Rewrites a URL (absolute or relative) to route through this proxy.
       */
      const proxyUrl = (rawSrc: string) => {
        const abs = rawSrc.startsWith("http://") || rawSrc.startsWith("https://")
          ? rawSrc
          : new URL(rawSrc, base).toString();
        return `${appBase}/api/streaming/proxy?url=${encodeURIComponent(abs)}&referer=${encodeURIComponent(referer)}`;
      };

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return line;

          // Plain segment URI (not a tag line)
          if (!trimmed.startsWith("#")) {
            return proxyUrl(trimmed);
          }

          // #EXT-X-MAP:URI="..." — initialization segment must be proxied
          // #EXT-X-KEY:URI="..." — AES-128 key fetch must be proxied
          if (trimmed.startsWith("#EXT-X-MAP:") || trimmed.startsWith("#EXT-X-KEY:")) {
            return line.replace(/URI="([^"]+)"/, (_, uri) => `URI="${proxyUrl(uri)}"`);
          }

          // All other tag/comment lines pass through unchanged
          return line;
        })
        .join("\n");

      return new NextResponse(rewritten, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Binary segment (.ts, .aac, etc.) — stream through directly
    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType || "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[HLS Proxy]", err);
    return new NextResponse("Proxy error", { status: 500 });
  }
}
