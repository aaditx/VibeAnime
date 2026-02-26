"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { Maximize2, Film, RefreshCw, MonitorPlay, Loader2, AlertTriangle, ChevronRight } from "lucide-react";
import { extractHiAnimeEpId, buildMegaplayUrl } from "@/lib/streaming-utils";

import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

// const DOWNLOADER_URL =
//   process.env.NEXT_PUBLIC_DOWNLOADER_URL ?? "http://localhost:3001";

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
  const playerRef = useRef<any>(null);
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
    let retryCount = 0;
    const maxRetries = 2;

    const fetchSources = async () => {
      setLoading(true);
      setStreamData(null);
      setUseFallback(false);
      setHlsError(false);
      setShowAutoNext(false);

      const url =
        `/api/streaming/sources` +
        `?episodeId=${encodeURIComponent(hianimeEpisodeId!)}` +
        `&server=${server}&category=${category}`;

      let isSuccess = false;
      let hasSources = false;

      try {
        const r = await fetch(url);
        const data: StreamSources = await r.json();

        if (cancelled) return;

        if (!data.sources || data.sources.length === 0) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`[VideoPlayer] Empty sources, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(fetchSources, 1500);
            return;
          }
          setStreamData(data);
          setUseFallback(true);
          isSuccess = true;
        } else {
          setStreamData(data);
          hasSources = true;
          isSuccess = true;
        }
      } catch (err) {
        if (!cancelled) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`[VideoPlayer] Fetch failed, retrying (${retryCount}/${maxRetries})...`);
            setTimeout(fetchSources, 1500);
            return;
          }
          setUseFallback(true);
        }
      } finally {
        if (!cancelled && retryCount >= maxRetries) {
          setLoading(false);
        } else if (!cancelled && (hasSources || useFallback)) {
          setLoading(false);
        }
      }
    };

    fetchSources();

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


  // ── Auto-fallback on proxy timeout (Netlify Port Blocking Bypass) ───────
  useEffect(() => {
    if (!hianimeEpisodeId || useFallback || !streamData?.sources?.find(s => s.isM3U8) || loading) return;

    // Wait exactly 5 seconds for the player to initialize and fetch its first chunks
    const timeout = setTimeout(() => {
      const currentTime = playerRef.current?.getCurrentTime() || 0;
      if (currentTime === 0) {
        console.warn("[VideoPlayer] Stream proxy timed out or blocked by server firewall. Auto-falling back to iframe iframe.");
        setUseFallback(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [streamData, useFallback, hianimeEpisodeId, loading]);

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
  // ── [Download feature — paused] ────────────────────────────────────────────
  // Uncomment when download-site is ready to ship:
  // const handleDownload = useCallback(() => { ... }, [...]);

  const handleFullscreen = useCallback(() => {
    const el = playerRef.current?.getInternalPlayer() as HTMLVideoElement | undefined;
    if (el && el.requestFullscreen) {
      el.requestFullscreen();
    }
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

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black shadow-[0_0_40px_rgba(232,0,45,0.03)] border border-white/5 transition-all flex flex-col">



      {/* ── Player area ── */}
      <div className="relative w-full bg-[#050505]" style={{ aspectRatio: "16/9" }}>

        {/* Unindexed / Placeholder State (Cinematic) */}
        {!hasSource && (
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
            {coverImage && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 scale-110 blur-xl"
                  style={{ backgroundImage: `url(${coverImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]/80" />
              </>
            )}
            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6 max-w-md animate-fade-in-up">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center mb-2 shadow-2xl">
                <Film className="w-8 h-8 text-[#e8002d]" />
              </div>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight" style={{ fontFamily: "var(--font-bebas)" }}>{animeTitle}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[#e8002d] text-xs font-black uppercase tracking-widest px-2.5 py-1 bg-[#e8002d]/10 rounded-full border border-[#e8002d]/20">Episode {episodeNumber}</span>
              </div>
              <p className="text-white/50 text-xs font-medium leading-relaxed mt-2 max-w-sm">
                This episode hasn't been indexed by the streaming servers yet. Check back in a few hours or drop varying titles in the search.
              </p>
            </div>
          </div>
        )}

        {/* Loading State (Premium Pulse) */}
        {hasSource && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050505] z-20">
            {coverImage && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 scale-105 blur-2xl"
                style={{ backgroundImage: `url(${coverImage})` }}
              />
            )}
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#e8002d] rounded-full blur-xl opacity-20 animate-pulse" />
                <Loader2 className="w-10 h-10 text-[#e8002d] animate-spin drop-shadow-[0_0_10px_rgba(232,0,45,0.5)]" />
              </div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Initializing Stream</p>
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
            className="absolute inset-0 w-full h-full border-0 bg-black z-10"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"
          />
        )}

        {/* ReactPlayer Video */}
        {hasSource && !loading && !useFallback && streamData?.sources?.find((s) => s.isM3U8) && (() => {
          const Player: any = ReactPlayer;
          return (
            <div className="absolute inset-0 w-full h-full z-10 bg-black">
              {/* @ts-ignore */}
              <Player
                ref={playerRef}
                url={`/api/streaming/proxy?url=${encodeURIComponent(streamData.sources.find(s => s.isM3U8)!.url)}&referer=${encodeURIComponent(streamData.headers?.Referer || "https://hianime.to/")}`}
                width="100%"
                height="100%"
                playing={true}
                controls={true}
                config={{
                  file: {
                    forceHLS: true,
                    attributes: {
                      crossOrigin: 'anonymous',
                    },
                    tracks: streamData?.subtitles
                      ?.filter((s) => !s.url.toLowerCase().includes("thumbnail"))
                      .map((sub, i) => {
                        const isEng = sub.lang.toLowerCase().includes("english");
                        return {
                          kind: 'subtitles',
                          src: sub.url,
                          srcLang: sub.lang.slice(0, 2).toLowerCase(),
                          label: sub.lang,
                          default: isEng && i === 0
                        };
                      }) || []
                  }
                } as any}
                onProgress={(state: any) => {
                  const currentTime = state.playedSeconds;
                  const duration = playerRef.current?.getDuration() || 0;

                  if (Math.round(currentTime) % 5 === 0 && currentTime > 5) {
                    localStorage.setItem(STORAGE_KEY(animeId, episodeNumber), String(currentTime));
                  }

                  if (hasNextEp && duration > 0) {
                    const remaining = duration - currentTime;
                    if (remaining <= AUTO_NEXT_THRESHOLD && remaining > 0) {
                      setShowAutoNext(true);
                    } else {
                      setShowAutoNext(false);
                    }
                  }
                }}
                onEnded={() => {
                  localStorage.removeItem(STORAGE_KEY(animeId, episodeNumber));
                  if (hasNextEp) {
                    router.push(nextEpUrl);
                  }
                }}
                onReady={() => {
                  const saved = localStorage.getItem(STORAGE_KEY(animeId, episodeNumber));
                  if (saved && playerRef.current) {
                    const t = parseFloat(saved);
                    if (!isNaN(t) && t > 5) {
                      playerRef.current.seekTo(t, 'seconds');
                    }
                  }
                }}
                onError={(e: any) => {
                  console.error("ReactPlayer HLS Error:", e);
                  // Only fallback if the video completely failed to start (e.g., proxy blocked)
                  // Mid-stream buffering errors will be ignored to let hls.js auto-recover
                  const currentTime = playerRef.current?.getCurrentTime() || 0;
                  if (currentTime === 0) {
                    console.log("[VideoPlayer] Stream failed to initialize, switching to fallback iframe.");
                    setUseFallback(true);
                  }
                }}
              />
            </div>
          );
        })()}

        {/* Premium Auto-Next Overlay */}
        {hasSource && !loading && !useFallback && showAutoNext && hasNextEp && (
          <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-6 z-30 flex flex-col items-end gap-2 sm:gap-3 animate-slide-up-fade">
            <button
              onClick={dismissAutoNext}
              className="text-[10px] font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors drop-shadow-md"
            >
              Stay on this episode
            </button>
            <button
              onClick={() => router.push(nextEpUrl)}
              className="group/btn relative flex items-center gap-3 bg-white/10 hover:bg-[#e8002d] backdrop-blur-xl border border-white/20 hover:border-[#e8002d] text-white p-1 pr-5 rounded-full transition-all duration-300 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_rgba(232,0,45,0.4)]"
            >
              {/* Circular Progress Countdown */}
              <div className="relative w-9 h-9 flex items-center justify-center bg-black/40 rounded-full flex-none">
                <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                  <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2" fill="none" className="text-white/10" />
                  <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2" fill="none"
                    className="text-white transition-all duration-1000 ease-linear"
                    strokeDasharray="100"
                    strokeDashoffset={100 - (countdown / AUTO_NEXT_COUNTDOWN) * 100}
                  />
                </svg>
                <span className="relative text-[10px] font-black font-mono tracking-tighter">{countdown}s</span>
              </div>
              <span className="text-xs font-black uppercase tracking-wider relative z-10">Next Episode</span>
              <ChevronRight className="w-4 h-4 text-white/50 group-hover/btn:text-white transition-colors relative z-10 translate-x-0 group-hover/btn:translate-x-1 duration-300" />
            </button>
          </div>
        )}
      </div>

      {/* ── Player Controls & Info (Below Player) ── */}
      <div className="flex flex-col bg-[#080808] border-t border-white/5 relative z-20">

        {/* Top row: Server & Language */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-3 border-b border-white/5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Server Selector */}
            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
              {(["hd-1", "hd-2"] as Server[]).map((s) => (
                <button key={s} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (s !== server) setServer(s); }}
                  className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all duration-300 ${server === s ? "bg-[#e8002d] text-white shadow-md shadow-[#e8002d]/20" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
                  {SERVER_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
              {(["sub", "dub"] as Category[]).map((c) => (
                <button key={c} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (c !== category) setCategory(c); }}
                  className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all duration-300 ${category === c ? "bg-white text-black shadow-md shadow-white/20" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReload(); }} title="Reload player" className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all border border-transparent hover:border-white/10 bg-white/5">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFullscreen(); }} title="Fullscreen" className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all border border-transparent hover:border-white/10 bg-white/5">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom row: Info */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 bg-black/20">
          <div className="min-w-0 flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {hlsError ? <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-none" /> : <MonitorPlay className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e8002d] flex-none" />}
            <span className="text-[10px] sm:text-xs font-bold text-white/80 w-full truncate">{animeTitle} <span className="text-white/40 ml-1 font-normal">| Ep {episodeNumber}</span></span>
          </div>
          <div className="flex items-center gap-3 mt-1 sm:mt-0">
            {useFallback && !hlsError && (
              <span className="flex text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-sm items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Embed
              </span>
            )}
            {!useFallback && hasSource && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUseFallback(true);
                }}
                className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-white/10 hover:bg-amber-500/20 hover:text-amber-400 border border-transparent hover:border-amber-500/30 text-white transition-all cursor-pointer"
              >
                Force Embed
              </button>
            )}
            <span className="flex-none text-[10px] font-black uppercase tracking-widest text-[#e8002d]/70 hidden sm:block">
              {hlsError ? "HLS failed · Playing embed" : useFallback ? "Embed mode active" : "Vibe Stream"}
            </span>
          </div>
        </div>
      </div>
    </div >
  );
}