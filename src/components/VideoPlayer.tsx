"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { Maximize2, Film, RefreshCw, MonitorPlay, Loader2, AlertTriangle, ChevronRight } from "lucide-react";
import { extractHiAnimeEpId, buildMegaplayUrl } from "@/lib/streaming-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  hianimeEpisodeId: string | null;
  episodeNumber: number;
  animeTitle: string;
  coverImage?: string;
  animeId: number;
  totalEpisodes: number;
}

type Server = "hd-1" | "hd-2";
type Category = "sub" | "dub";

interface StreamSources {
  sources: { url: string; quality?: string; isM3U8?: boolean }[];
  subtitles: { url: string; lang: string }[];
  headers: Record<string, string>;
  megaplayUrl?: string;
  fallbackIframe?: string;
}

const SERVER_LABELS: Record<Server, string> = {
  "hd-1": "VidStreaming",
  "hd-2": "VidCloud",
};

const STORAGE_KEY = (animeId: number, ep: number) => `vibe-time-${animeId}-${ep}`;
const AUTO_NEXT_THRESHOLD = 30; // seconds before end to show overlay
const AUTO_NEXT_COUNTDOWN = 10; // seconds to count down before navigating

// ─── Component ───────────────────────────────────────────────────────────────

export default function VideoPlayer({
  hianimeEpisodeId,
  episodeNumber,
  animeTitle,
  coverImage,
  animeId,
  totalEpisodes,
}: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [server, setServer] = useState<Server>("hd-1");
  const [category, setCategory] = useState<Category>("sub");
  const [streamData, setStreamData] = useState<StreamSources | null>(null);
  const [loading, setLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [hlsError, setHlsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Auto-play next episode
  const [showAutoNext, setShowAutoNext] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_NEXT_COUNTDOWN);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasNextEp = episodeNumber < totalEpisodes;
  const nextEpUrl = `/anime/${animeId}/watch/${episodeNumber + 1}`;

  // ── Guaranteed fallback URL ───────────────────────────────────────────────
  const guaranteedFallback = useCallback((): string => {
    if (streamData?.fallbackIframe) return streamData.fallbackIframe;
    if (streamData?.megaplayUrl) return streamData.megaplayUrl;
    const epId = hianimeEpisodeId ? extractHiAnimeEpId(hianimeEpisodeId) : null;
    if (epId) return buildMegaplayUrl(epId, category === "dub");
    return "";
  }, [streamData, hianimeEpisodeId, category]);

  // ── Source fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hianimeEpisodeId) return;
    let cancelled = false;
    setLoading(true);
    setStreamData(null);
    setUseFallback(false);
    setHlsError(false);
    setShowAutoNext(false);

    const url =
      `/api/streaming/sources` +
      `?episodeId=${encodeURIComponent(hianimeEpisodeId)}` +
      `&server=${server}&category=${category}`;

    fetch(url)
      .then((r) => r.json())
      .then((data: StreamSources) => {
        if (cancelled) return;
        setStreamData(data);
        if (!data.sources || data.sources.length === 0) setUseFallback(true);
      })
      .catch(() => { if (!cancelled) setUseFallback(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [hianimeEpisodeId, server, category, reloadKey]);

  // ── Prefetch next episode sources ─────────────────────────────────────────
  useEffect(() => {
    if (!hasNextEp || !streamData || !hianimeEpisodeId) return;
    // Fire-and-forget prefetch — warms the Next.js fetch cache
    const nextEpisodeNum = episodeNumber + 1;
    // Prefetch the next episode page (router-level)
    router.prefetch(nextEpUrl);
  }, [streamData, hasNextEp, nextEpUrl, router, episodeNumber, hianimeEpisodeId]);

  // ── HLS setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamData || useFallback) return;

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    const m3u8 = streamData.sources?.find((s) => s.isM3U8) ?? streamData.sources?.[0];
    if (!m3u8) { setUseFallback(true); return; }

    const referer = streamData.headers?.Referer || "https://hianime.to/";
    const proxied = `/api/streaming/proxy?url=${encodeURIComponent(m3u8.url)}&referer=${encodeURIComponent(referer)}`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        backBufferLength: 90,
        maxBufferLength: 60,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
        fragLoadingMaxRetry: 6,
      });
      hlsRef.current = hls;
      hls.loadSource(proxied);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Resume saved position
        const saved = localStorage.getItem(STORAGE_KEY(animeId, episodeNumber));
        if (saved) {
          const t = parseFloat(saved);
          if (!isNaN(t) && t > 5) video.currentTime = t;
        }
        video.play().catch(() => { });
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) { setHlsError(true); setUseFallback(true); }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = proxied;
      video.load();
    } else {
      setUseFallback(true);
    }

    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [streamData, useFallback, animeId, episodeNumber]);

  // ── Save watch position + auto-next trigger ────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      // Save position every ~5 seconds
      if (Math.round(video.currentTime) % 5 === 0 && video.currentTime > 5) {
        localStorage.setItem(STORAGE_KEY(animeId, episodeNumber), String(video.currentTime));
      }
      // Show auto-next overlay near end
      if (hasNextEp && video.duration > 0) {
        const remaining = video.duration - video.currentTime;
        if (remaining <= AUTO_NEXT_THRESHOLD && remaining > 0) {
          setShowAutoNext(true);
        } else {
          setShowAutoNext(false);
        }
      }
    };

    const onEnded = () => {
      // Clear saved position on episode completion
      localStorage.removeItem(STORAGE_KEY(animeId, episodeNumber));
      if (hasNextEp) {
        router.push(nextEpUrl);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [animeId, episodeNumber, hasNextEp, nextEpUrl, router]);

  // ── Auto-next countdown ───────────────────────────────────────────────────
  useEffect(() => {
    if (!showAutoNext) {
      setCountdown(AUTO_NEXT_COUNTDOWN);
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
      return;
    }
    setCountdown(AUTO_NEXT_COUNTDOWN);
    countdownRef.current = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(countdownRef.current!);
          router.push(nextEpUrl);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [showAutoNext, nextEpUrl, router]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen();
  }, []);

  const handleReload = useCallback(() => {
    setUseFallback(false);
    setHlsError(false);
    setStreamData(null);
    setShowAutoNext(false);
    setReloadKey((k) => k + 1);
  }, []);

  const dismissAutoNext = useCallback(() => {
    setShowAutoNext(false);
  }, []);

  // ── Computed ──────────────────────────────────────────────────────────────
  const hasSource = !!hianimeEpisodeId;
  const iframeUrl = useFallback ? guaranteedFallback() : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="border border-[#1e1e1e] bg-black shadow-2xl">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111] border-b border-[#1e1e1e] flex-wrap gap-y-1.5">
        <MonitorPlay className="w-3.5 h-3.5 text-[#e8002d] flex-none" />

        <span className="text-[10px] text-[#555] font-black uppercase tracking-widest mr-0.5">Server:</span>
        {(["hd-1", "hd-2"] as Server[]).map((s) => (
          <button key={s} onClick={() => { if (s !== server) setServer(s); }}
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 transition-colors ${server === s ? "bg-[#e8002d] text-white" : "bg-[#1a1a1a] border border-[#222] text-[#555] hover:text-white hover:border-[#e8002d]"}`}>
            {SERVER_LABELS[s]}
          </button>
        ))}

        <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />

        <span className="text-[10px] text-[#555] font-black uppercase tracking-widest mr-0.5">Lang:</span>
        {(["sub", "dub"] as Category[]).map((c) => (
          <button key={c} onClick={() => { if (c !== category) setCategory(c); }}
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 transition-colors ${category === c ? "bg-[#e8002d] text-white" : "bg-[#1a1a1a] border border-[#222] text-[#555] hover:text-white hover:border-[#e8002d]"}`}>
            {c}
          </button>
        ))}

        <div className="flex-1" />

        {useFallback && !hlsError && (
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/30 px-2 py-0.5">Embed</span>
        )}
        {hlsError && (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-400 border border-amber-400/30 px-2 py-0.5">
            <AlertTriangle className="w-3 h-3" /> Stream error
          </span>
        )}
        <button onClick={handleReload} title="Reload player" className="text-[#555] hover:text-white p-1 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleFullscreen} title="Fullscreen" className="text-[#555] hover:text-white p-1 transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Player area ── */}
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        {/* No episode ID — indexing placeholder */}
        {!hasSource && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0f]"
            style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
            <div className="absolute inset-0 bg-black/75" />
            <div className="relative flex flex-col items-center gap-3 text-center px-6 max-w-sm">
              <Film className="w-10 h-10 text-white/30" />
              <p className="text-white font-semibold text-base">{animeTitle}</p>
              <p className="text-white/60 text-sm">Episode {episodeNumber}</p>
              <p className="text-white/40 text-xs leading-relaxed">
                This episode hasn&apos;t been indexed yet. Try reloading or check back in a moment.
              </p>
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {hasSource && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0f] z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#e8002d] animate-spin" />
              <p className="text-[#555] text-xs font-black uppercase tracking-widest">Loading stream…</p>
            </div>
          </div>
        )}

        {/* Fallback iframe */}
        {hasSource && !loading && useFallback && iframeUrl && (
          <iframe
            id="vibe-player-iframe"
            key={`fb-${category}-${server}-${episodeNumber}-${reloadKey}`}
            src={iframeUrl}
            title={`${animeTitle} Episode ${episodeNumber}`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"
          />
        )}

        {/* Native HLS video */}
        {hasSource && !loading && !useFallback && (
          <video
            ref={videoRef}
            key={`hls-${server}-${category}-${episodeNumber}-${reloadKey}`}
            className="absolute inset-0 w-full h-full bg-black"
            controls playsInline crossOrigin="anonymous"
          >
            {streamData?.subtitles
              ?.filter((s) => !s.url.toLowerCase().includes("thumbnail"))
              .map((sub) => (
                <track key={sub.url} kind="subtitles" src={sub.url}
                  label={sub.lang} srcLang={sub.lang.slice(0, 2).toLowerCase()} />
              ))}
          </video>
        )}

        {/* Auto-next episode overlay */}
        {hasSource && !loading && !useFallback && showAutoNext && hasNextEp && (
          <div className="absolute bottom-16 right-4 z-20 flex flex-col items-end gap-2 animate-fade-in">
            <button
              onClick={dismissAutoNext}
              className="text-[10px] text-[#555] hover:text-white uppercase tracking-widest transition-colors"
            >
              Stay on this episode
            </button>
            <button
              onClick={() => router.push(nextEpUrl)}
              className="flex items-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 transition-all hover:shadow-[0_0_20px_rgba(232,0,45,0.4)]"
            >
              <ChevronRight className="w-4 h-4" />
              Next Episode
              <span className="ml-1 bg-white/20 rounded px-1.5 py-0.5 text-[10px] tabular-nums">
                {countdown}s
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className="px-3 py-1.5 bg-[#16161a] border-t border-[#2a2a35] flex items-center justify-between text-[10px] text-[#8888aa]">
        <span className="truncate">{animeTitle} — Episode {episodeNumber}</span>
        <span className="flex-none ml-4 text-[#555566]">
          {hlsError
            ? "HLS failed — playing embed. Try another server."
            : useFallback
              ? "Embed mode — switch server if video fails"
              : "Switch server if buffering"}
        </span>
      </div>
    </div>
  );
}