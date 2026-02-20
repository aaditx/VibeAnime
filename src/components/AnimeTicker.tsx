"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { Anime } from "@/lib/anilist";
import { getAnimeTitle } from "@/lib/utils";

interface AnimeTickerProps {
  animes: Anime[];
}

export default function AnimeTicker({ animes }: AnimeTickerProps) {
  if (!animes.length) return null;

  // Duplicate for seamless loop
  const items = [...animes, ...animes];

  return (
    <div className="border-y-2 border-[#e8002d] bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-none flex items-center gap-2 px-4 py-2.5 bg-[#e8002d] text-white text-[10px] font-black uppercase tracking-widest z-10">
          <TrendingUp className="w-3.5 h-3.5" />
          Trending
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden relative">
          {/* Fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent" />

          <div
            className="flex gap-6 py-2.5 whitespace-nowrap"
            style={{
              animation: "ticker 30s linear infinite",
              width: "max-content",
            }}
          >
            {items.map((anime, i) => (
              <Link
                key={`${anime.id}-${i}`}
                href={`/anime/${anime.id}`}
                className="flex items-center gap-2 text-[#555] hover:text-white transition-colors text-xs font-bold uppercase tracking-wide"
              >
                <span className="text-[#e8002d] font-black">#{(i % animes.length) + 1}</span>
                <span>{getAnimeTitle(anime.title)}</span>
                {anime.averageScore && (
                  <span className="text-[#e8002d]/60">★{(anime.averageScore / 10).toFixed(1)}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
