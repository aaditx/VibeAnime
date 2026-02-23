"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";
import { Maximize2, Film, RefreshCw, MonitorPlay, Loader2 } from "lucide-react";
import { extractHiAnimeEpId, buildMegaplayUrl } from "@/lib/streaming";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  /** Full HiAnime episode ID, e.g. "one-piece-100?ep=2142" */
  hianimeEpisodeId: string | null;
  episodeNumber: number;
  animeTitle: string;
  coverImage?: string;
}

type Server = "hd-1" | "hd-2";
type Category = "sub" | "dub";

interface StreamSources {
  sources: { url: string; quality?: string; isM3U8?: boolean }[];
  subtitles: { url: string; lang: string }[];
  headers: Record<string, string>;
}

const SERVER_LABELS: Record<Server, string> = {
  "hd-1": "VidStreaming",
  "hd-2": "VidCloud",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function VideoPlayer({
  hianimeEpisodeId,
  episodeNumber,
  animeTitle,
  coverImage,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [server, setServer] = useState<Server>("hd-1");
  const [category, setCategory] = useState<Category>("sub");
  const [streamData, setStreamData] = useState<StreamSources | null>(null);
  const [loading, setLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // ── Source fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hianimeEpisodeId) return;

    let cancelled = false;
    setLoading(true);
    setStreamData(null);
    setUseFallback(false);

    const url =
      `/api/streaming/sources` +
      `?episodeId=${encodeURIComponent(hianimeEpisodeId)}` +
      `&server=${server}` +
      `&category=${category}`;

    fetch(url)
      .then((r) => r.json())
      .then((data: StreamSources) => {
        if (cancelled) return;
        if (data.sources?.length > 0) {
          setStreamData(data);
        } else {
          // No HLS sources from this server/category — fall back to iframe
          setUseFallback(true);
        }
      })
      .catch(() => {
        if (!cancelled) setUseFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hianimeEpisodeId, server, category, reloadKey]);

  // ── HLS setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamData || useFallback) return;

    // Destroy any previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Pick the best M3U8 source
    const m3u8 =
      streamData.sources.find((s) => s.isM3U8) ?? streamData.sources[0];
    if (!m3u8) {
      setUseFallback(true);
      return;
    }

    // Route through our own proxy to handle Referer + CORS for .ts segments
    const proxied =
      `/api/streaming/proxy` +
      `?url=${encodeURIComponent(m3u8.url)}` +
      `&referer=${encodeURIComponent("https://hianime.to/")}`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        backBufferLength: 90,
        maxBufferLength: 60,
        progressive: false,
      });
      hlsRef.current = hls;
      hls.loadSource(proxied);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {/* autoplay blocked — user must click play */ });
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) setUseFallback(true);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari — native HLS support
      video.src = proxied;
      video.load();
    } else {
      setUseFallback(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamData, useFallback]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFullscreen = useCallback(() => {
    const el = videoRef.current;
    if (el?.requestFullscreen) el.requestFullscreen();
  }, []);

  const handleReload = useCallback(() => {
    setUseFallback(false);
    setStreamData(null);
    setReloadKey((k) => k + 1);
  }, []);

  const switchServer = useCallback(
    (s: Server) => {
      if (s === server) return;
      setServer(s);
    },
    [server]
  );

  const switchCategory = useCallback(
    (c: Category) => {
      if (c === category) return;
      setCategory(c);
    },
    [category]
  );

  // ── Fallback iframe ────────────────────────────────────────────────────────
  const epId = hianimeEpisodeId ? extractHiAnimeEpId(hianimeEpisodeId) : null;
  const fallbackUrl = epId
    ? buildMegaplayUrl(epId, category === "dub")
    : null;

  const hasSource = !!hianimeEpisodeId;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="border border-[#1e1e1e] bg-black shadow-2xl">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111] border-b border-[#1e1e1e] flex-wrap gap-y-1.5">
        <MonitorPlay className="w-3.5 h-3.5 text-[#e8002d] flex-none" />

        {/* Server selector */}
        <span className="text-[10px] text-[#555] font-black uppercase tracking-widest mr-0.5">
          Server:
        </span>
        {(["hd-1", "hd-2"] as Server[]).map((s) => (
          <button
            key={s}
            onClick={() => switchServer(s)}
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 transition-colors ${server === s
                ? "bg-[#e8002d] text-white"
                : "bg-[#1a1a1a] border border-[#222] text-[#555] hover:text-white hover:border-[#e8002d]"
              }`}
          >
            {SERVER_LABELS[s]}
          </button>
        ))}

        <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />

        {/* Sub / Dub selector */}
        <span className="text-[10px] text-[#555] font-black uppercase tracking-widest mr-0.5">
          Lang:
        </span>
        {(["sub", "dub"] as Category[]).map((c) => (
          <button
            key={c}
            onClick={() => switchCategory(c)}
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 transition-colors ${category === c
                ? "bg-[#e8002d] text-white"
                : "bg-[#1a1a1a] border border-[#222] text-[#555] hover:text-white hover:border-[#e8002d]"
              }`}
          >
            {c}
          </button>
        ))}

        <div className="flex-1" />

        {/* Fallback badge */}
        {useFallback && (
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/30 px-2 py-0.5">
            Fallback
          </span>
        )}

        <button
          onClick={handleReload}
          title="Reload player"
          className="text-[#555] hover:text-white p-1 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleFullscreen}
          title="Fullscreen"
          className="text-[#555] hover:text-white p-1 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Player area ── */}
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        {/* No episode ID at all — indexing placeholder */}
        {!hasSource && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0f]"
            style={
              coverImage
                ? {
                  backgroundImage: `url(${coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
                : {}
            }
          >
            <div className="absolute inset-0 bg-black/75" />
            <div className="relative flex flex-col items-center gap-3 text-center px-6 max-w-sm">
              <Film className="w-10 h-10 text-white/30" />
              <p className="text-white font-semibold text-base">{animeTitle}</p>
              <p className="text-white/60 text-sm">Episode {episodeNumber}</p>
              <p className="text-white/40 text-xs leading-relaxed">
                This episode hasn&apos;t been indexed yet. Try reloading or
                check back in a moment.
              </p>
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {hasSource && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0f] z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#e8002d] animate-spin" />
              <p className="text-[#555] text-xs font-black uppercase tracking-widest">
                Loading stream…
              </p>
            </div>
          </div>
        )}

        {/* Fallback iframe (megaplay.buzz) */}
        {hasSource && !loading && useFallback && fallbackUrl && (
          <iframe
            id="vibe-player-iframe"
            key={`fb-${category}-${server}-${episodeNumber}-${reloadKey}`}
            src={fallbackUrl}
            title={`${animeTitle} Episode ${episodeNumber}`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"
          />
        )}

        {/* Native HLS video player */}
        {hasSource && !loading && !useFallback && (
          <video
            ref={videoRef}
            key={`hls-${server}-${category}-${episodeNumber}-${reloadKey}`}
            className="absolute inset-0 w-full h-full bg-black"
            controls
            playsInline
            crossOrigin="anonymous"
          >
            {streamData?.subtitles
              ?.filter((s) => !s.url.includes("thumbnails"))
              .map((sub) => (
                <track
                  key={sub.url}
                  kind="subtitles"
                  src={sub.url}
                  label={sub.lang}
                  srcLang={sub.lang.slice(0, 2).toLowerCase()}
                />
              ))}
          </video>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className="px-3 py-1.5 bg-[#16161a] border-t border-[#2a2a35] flex items-center justify-between text-[10px] text-[#8888aa]">
        <span className="truncate">
          {animeTitle} — Episode {episodeNumber}
        </span>
        <span className="flex-none ml-4 text-[#555566]">
          {useFallback
            ? "Fallback active — switch server if video fails"
            : "Switch server if buffering"}
        </span>
      </div>
    </div>
  );
}