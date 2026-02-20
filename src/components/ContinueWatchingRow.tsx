"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, X, RotateCcw } from "lucide-react";
import { useContinueWatchingStore } from "@/store/useContinueWatchingStore";

export default function ContinueWatchingRow() {
  const { items, removeProgress } = useContinueWatchingStore();

  if (!items.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
          <span className="w-1 h-5 bg-[#e8002d] inline-block" />
          <RotateCcw className="w-4 h-4 text-[#e8002d]" />
          Continue Watching
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => {
          const pct = item.totalEpisodes
            ? Math.round((item.episode / item.totalEpisodes) * 100)
            : null;
          const accentColor = item.coverColor ?? "#7c3aed";

          return (
            <div
              key={item.animeId}
              className="flex-none w-48 relative group overflow-hidden bg-[#111] border border-[#1e1e1e] hover:border-[#e8002d] transition-all"
              style={{ boxShadow: `0 0 0 0 transparent` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${accentColor}30`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent";
              }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video">
                <Image
                  src={item.coverImage}
                  alt={item.animeTitle}
                  fill
                  className="object-cover object-top"
                  sizes="192px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Play button overlay */}
                <Link
                  href={`/anime/${item.animeId}/watch/${item.episode}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div
                    className="rounded-full p-2.5"
                    style={{ background: `${accentColor}dd` }}
                  >
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => removeProgress(item.animeId)}
                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white/70 hover:text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Episode badge */}
                <div
                  className="absolute bottom-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{ background: accentColor }}
                >
                  EP {item.episode}
                </div>
              </div>

              {/* Progress bar */}
              {pct !== null && (
                <div className="h-0.5 bg-[#2a2a35]">
                  <div
                    className="h-full"
                    style={{ width: `${pct}%`, background: accentColor }}
                  />
                </div>
              )}

              {/* Info */}
              <div className="p-2.5">
                <Link
                  href={`/anime/${item.animeId}`}
                  className="text-white text-xs font-black uppercase tracking-wide line-clamp-1 hover:text-[#e8002d] transition-colors"
                >
                  {item.animeTitle}
                </Link>
                <div className="flex items-center justify-between mt-1 text-[10px] text-[#8888aa]">
                  <span>{pct !== null ? `${pct}% watched` : `EP ${item.episode}`}</span>
                  {item.totalEpisodes && (
                    <span>{item.episode}/{item.totalEpisodes} eps</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
