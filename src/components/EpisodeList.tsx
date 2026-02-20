"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnimeEpisode } from "@/lib/streaming";

interface EpisodeListProps {
  animeId: number;
  totalEpisodes: number;
  currentEpisode?: number;
  episodes?: AnimeEpisode[];
}

const PAGE_SIZE = 50;

export default function EpisodeList({ animeId, totalEpisodes, currentEpisode, episodes = [] }: EpisodeListProps) {
  const [page, setPage] = useState(() => {
    // Start on the page containing the current episode
    if (!currentEpisode) return 0;
    return Math.floor((currentEpisode - 1) / PAGE_SIZE);
  });
  const [richView, setRichView] = useState(episodes.length > 0 && episodes.length <= 24);

  const total = Math.max(totalEpisodes, episodes.length);
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);

  // Numbers for the current page
  const pageNumbers = Array.from({ length: end - start }, (_, i) => start + i + 1);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
          <span className="w-1 h-4 bg-[#e8002d]" />
          Episodes
          <span className="text-xs text-[#555] font-bold normal-case tracking-normal">({total})</span>
        </h3>
        {episodes.length > 0 && (
          <button
            onClick={() => setRichView((v) => !v)}
            className="text-[10px] text-[#e8002d] hover:text-white flex items-center gap-1 transition-colors font-black uppercase tracking-widest"
          >
            {richView ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {richView ? "Grid" : "List"}
          </button>
        )}
      </div>

      {/* Page selector */}
      {pageCount > 1 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "text-[10px] px-2 py-1 font-black uppercase tracking-wide transition-colors",
                i === page
                  ? "bg-[#e8002d] text-white"
                  : "bg-[#1a1a1a] border border-[#222] text-[#555] hover:border-[#e8002d] hover:text-white"
              )}
            >
              {i * PAGE_SIZE + 1}–{Math.min((i + 1) * PAGE_SIZE, total)}
            </button>
          ))}
        </div>
      )}

      {/* Rich list view (with episode titles) */}
      {richView && episodes.length > 0 ? (
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
          {pageNumbers.map((ep) => {
            const epData = episodes.find((e) => e.number === ep) ?? episodes[ep - 1];
            const isCurrent = ep === currentEpisode;
            return (
              <Link
                key={ep}
                href={`/anime/${animeId}/watch/${ep}`}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg transition-all group",
                  isCurrent
                    ? "bg-[#e8002d]/10 border border-[#e8002d]/50"
                    : "hover:bg-[#1a1a1a] border border-transparent"
                )}
              >
                {/* Thumbnail */}
                {epData?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={epData.image}
                    alt={`Episode ${ep}`}
                    className="w-14 h-9 object-cover rounded flex-none"
                  />
                ) : (
                  <div className="w-14 h-9 bg-[#1a1a1a] border border-[#222] flex-none flex items-center justify-center text-[#555] text-xs font-black">
                    {ep}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn("text-xs font-bold truncate", isCurrent ? "text-[#e8002d]" : "text-white/80")}>
                    {epData?.title ?? `Episode ${ep}`}
                  </p>
                  <p className="text-[10px] text-[#8888aa]">EP {ep}</p>
                </div>
                {isCurrent && <Play className="w-3.5 h-3.5 text-[#e8002d] fill-[#e8002d] flex-none" />}
              </Link>
            );
          })}
        </div>
      ) : (
        /* Grid view (numbered buttons) */
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 max-h-[350px] overflow-y-auto pr-1">
          {pageNumbers.map((ep) => {
            const isCurrent = ep === currentEpisode;
            return (
              <Link
                key={ep}
                href={`/anime/${animeId}/watch/${ep}`}
                className={cn(
                  "flex items-center justify-center h-9 text-xs font-black transition-all border",
                  isCurrent
                    ? "bg-[#e8002d] border-[#e8002d] text-white"
                    : "bg-[#111] border-[#222] text-[#555] hover:border-[#e8002d] hover:text-white"
                )}
              >
                {isCurrent ? <Play className="w-3.5 h-3.5 fill-white text-white" /> : ep}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

