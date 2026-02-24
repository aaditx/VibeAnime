import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ─── SSRF allowlist ───────────────────────────────────────────────────────────
// Only proxy domains that are known streaming CDNs.
const ALLOWED_HOSTS = new Set([
  "megacloud.tv",
  "s3.megacloud.tv",
  "megacloud.blog",
  "b-cdn.net",
  "megaplay.buzz",
  "vidmoly.to",
  "vidstreaming.io",
  "vidwish.live",
  "rapid-cloud.co",
  "hianime.to",
  "hianimez.to",
  "hianime.nz",
  "hianime.sx",
  "aniwatch.to",
  "cache.hianimez.to",
  "netmagcdn.com",      // HLS CDN observed in production
]);

function isAllowedHost(hostname: string): boolean {
  // Allow exact matches or subdomain matches (e.g. "s3.megacloud.tv")
  for (const allowed of ALLOWED_HOSTS) {
    if (hostname === allowed || hostname.endsWith(`.${allowed}`)) return true;
  }
  return false;
}

// ─── Simple LRU-capped cookie store ──────────────────────────────────────────
// Keeps the most recent MAX_ENTRIES sessions. Much simpler than Redis for
// Vercel (stateless) — bump this only if you run a persistent server.
const MAX_COOKIE_ENTRIES = 500;
const cookieStore = new Map<string, string>();

function setCookieEntry(key: string, value: string) {
  if (cookieStore.size >= MAX_COOKIE_ENTRIES) {
    // Delete the oldest entry (Map preserves insertion order)
    const firstKey = cookieStore.keys().next().value;
    if (firstKey !== undefined) cookieStore.delete(firstKey);
  }
  cookieStore.set(key, value);
}

// ─── Session key ──────────────────────────────────────────────────────────────

function getSessionKey(req: NextRequest, targetUrl: URL): string {
  const epMatch = targetUrl.searchParams.get("ep") || targetUrl.pathname.match(/ep=(\d+)/)?.[1];
  if (epMatch) return `ep_${epMatch}`;
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  return `ip_${ip}`;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  const referer = req.nextUrl.searchParams.get("referer") ?? "https://hianime.to/";

  if (!rawUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid url parameter", { status: 400 });
  }

  // ── SSRF protection ──
  if (!isAllowedHost(targetUrl.hostname)) {
    console.warn(`[HLS Proxy] Blocked SSRF attempt to: ${targetUrl.hostname}`);
    return new NextResponse("Forbidden: target host not allowed", { status: 403 });
  }

  const sessionKey = getSessionKey(req, targetUrl);
  const existingCookie = cookieStore.get(sessionKey);

  try {
    const fetchHeaders: HeadersInit = {
      Referer: referer,
      Origin: new URL(referer).origin,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
    };

    if (existingCookie) {
      fetchHeaders.Cookie = existingCookie;
    }

    // Retry up to 3 times on non-OK upstream
    let upstream: Response | undefined;
    let lastError: unknown = null;
    for (let attempts = 0; attempts < 3; attempts++) {
      try {
        upstream = await fetch(targetUrl.toString(), { headers: fetchHeaders });
        if (upstream.ok) break;
        lastError = `Upstream ${upstream.status} for ${targetUrl.toString()}`;
        upstream = undefined;
      } catch (err) {
        lastError = err;
      }
    }

    if (!upstream || !upstream.ok) {
      console.error(`[HLS Proxy] Failed after 3 attempts: ${lastError}`);
      return new NextResponse(`Streaming error: ${lastError}`, {
        status: upstream?.status || 502,
      });
    }

    // Persist any Set-Cookie from the CDN
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) {
      const cookieValue = setCookie.split(";")[0];
      setCookieEntry(sessionKey, cookieValue);
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    const isM3U8 =
      contentType.includes("mpegurl") ||
      contentType.includes("x-mpegurl") ||
      targetUrl.pathname.endsWith(".m3u8") ||
      targetUrl.pathname.endsWith(".m3u");

    if (isM3U8) {
      // Rewrite all URIs in the playlist to go through this proxy
      const text = await upstream.text();
      const base = new URL(".", targetUrl).toString();
      const appBase = req.nextUrl.origin;

      const proxyUrl = (rawSrc: string) => {
        const abs =
          rawSrc.startsWith("http://") || rawSrc.startsWith("https://")
            ? rawSrc
            : new URL(rawSrc, base).toString();
        return `${appBase}/api/streaming/proxy?url=${encodeURIComponent(abs)}&referer=${encodeURIComponent(referer)}`;
      };

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return line;
          if (!trimmed.startsWith("#")) {
            return proxyUrl(trimmed);
          }
          if (trimmed.startsWith("#EXT-X-MAP:") || trimmed.startsWith("#EXT-X-KEY:")) {
            return line.replace(/URI="([^"]+)"/, (_, uri) => `URI="${proxyUrl(uri)}"`);
          }
          return line;
        })
        .join("\n");

      const responseHeaders: Record<string, string> = {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      };
      if (setCookie) {
        responseHeaders["Set-Cookie"] = `megacloud_session=${cookieStore.get(sessionKey)}; Path=/; SameSite=Lax; Max-Age=86400`;
      }

      return new NextResponse(rewritten, { headers: responseHeaders });
    }

    // Binary segment (.ts, .aac, etc.) — stream directly
    const buffer = await upstream.arrayBuffer();

    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType || "video/mp2t",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    };
    if (setCookie) {
      responseHeaders["Set-Cookie"] = `megacloud_session=${cookieStore.get(sessionKey)}; Path=/; SameSite=Lax; Max-Age=86400`;
    }

    return new NextResponse(buffer, { headers: responseHeaders });
  } catch (err) {
    console.error("[HLS Proxy]", err);
    return new NextResponse("Proxy error", { status: 500 });
  }
}