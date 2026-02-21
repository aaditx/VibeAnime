"use client";

import { useState } from "react";
import { Maximize2, Film, RefreshCw, MonitorPlay } from "lucide-react";
import {
  extractHiAnimeEpId,
  buildMegaplayUrl,
  buildVidwishUrl,
} from "@/lib/streaming";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  /** HiAnime episode ID, e.g. "one-piece-100?ep=2142" */
  hianimeEpisodeId: string | null;
  episodeNumber: number;
  animeTitle: string;
  coverImage?: string;
}

type Source = "sub" | "dub" | "alt-sub" | "alt-dub";

const SOURCE_LABELS: Record<Source, string> = {
  sub: "Sub",
  dub: "Dub",
  "alt-sub": "Alt Sub",
  "alt-dub": "Alt Dub",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function VideoPlayer({
  hianimeEpisodeId,
  episodeNumber,
  animeTitle,
  coverImage,
}: VideoPlayerProps) {
  const [source, setSource] = useState<Source>("sub");
  const [iframeKey, setIframeKey] = useState(0);

  const epId = hianimeEpisodeId ? extractHiAnimeEpId(hianimeEpisodeId) : null;
  const hasSource = !!epId;

  const sources: Source[] = hasSource
    ? ["sub", "dub", "alt-sub", "alt-dub"]
    : [];

  function getEmbedUrl(src: Source): string {
    if (!epId) return "";
    switch (src) {
      case "sub":     return buildMegaplayUrl(epId, false);
      case "dub":     return buildMegaplayUrl(epId, true);
      case "alt-sub": return buildVidwishUrl(epId, false);
      case "alt-dub": return buildVidwishUrl(epId, true);
      default:        return "";
    }
  }

  const currentUrl = getEmbedUrl(source);

  const handleFullscreen = () => {
    const el = document.getElementById("vibe-player-iframe") as HTMLIFrameElement | null;
    if (el?.requestFullscreen) el.requestFullscreen();
  };

  return (
    <div className="border border-[#1e1e1e] bg-black shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111] border-b border-[#1e1e1e]">
        <MonitorPlay className="w-3.5 h-3.5 text-[#e8002d] flex-none" />
        <span className="text-[10px] text-[#555] font-black uppercase tracking-widest mr-1">Server:</span>
        <div className="flex gap-1 flex-1 flex-wrap">
          {sources.map((src) => (
            <button
              key={src}
              onClick={() => {
                if (src === source) return; // already active — don't reload
                setSource(src);
                setIframeKey((k) => k + 1);
              }}
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 transition-colors ${
                source === src
                  ? "bg-[#e8002d] text-white"
                  : "bg-[#1a1a1a] border border-[#222] text-[#555] hover:text-white hover:border-[#e8002d]"
              }`}
            >
              {SOURCE_LABELS[src]}
            </button>
          ))}
          {!hasSource && (
            <span className="text-[10px] text-[#555] uppercase tracking-wide px-2 py-1">
              Episode not indexed yet — try reloading
            </span>
          )}
        </div>
        <button
          onClick={() => setIframeKey((k) => k + 1)}
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

      {/* Player area */}
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        {currentUrl ? (
          <iframe
            id="vibe-player-iframe"
            key={`${source}-${episodeNumber}-${iframeKey}`}
            src={currentUrl}
            title={`${animeTitle} Episode ${episodeNumber}`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d0d0f]"
            style={
              coverImage
                ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                : {}
            }
          >
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
      </div>

      {/* Bottom info bar */}
      <div className="px-3 py-1.5 bg-[#16161a] border-t border-[#2a2a35] flex items-center justify-between text-[10px] text-[#8888aa]">
        <span className="truncate">{animeTitle} — Episode {episodeNumber}</span>
        <span className="flex-none ml-4 text-[#555566]">If black, switch server above</span>
      </div>
    </div>
  );
}