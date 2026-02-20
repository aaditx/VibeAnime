"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Play } from "lucide-react";
import { cn, formatScore, getAnimeTitle } from "@/lib/utils";
import { useWatchlistStore } from "@/store/useWatchlistStore";
import { useContinueWatchingStore } from "@/store/useContinueWatchingStore";
import type { Anime } from "@/lib/anilist";

interface AnimeCardProps {
  anime: Anime;
  size?: "sm" | "md" | "lg";
  rank?: number;
}

export default function AnimeCard({ anime, size = "md", rank }: AnimeCardProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
  const { getProgress } = useContinueWatchingStore();
  const inWatchlist = isInWatchlist(anime.id);
  const progress = getProgress(anime.id);
  const title = getAnimeTitle(anime.title);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(anime.id);
    } else {
      addToWatchlist(anime);
    }
  };

  const progressPct =
    progress && progress.totalEpisodes
      ? Math.round((progress.episode / progress.totalEpisodes) * 100)
      : null;

  return (
    <Link href={`/anime/${anime.id}`} className="group block">
      <div
        className={cn(
          "relative overflow-hidden bg-[#111] border border-[#222] transition-all duration-200",
          "hover:border-[#e8002d] hover:shadow-[0_0_0_1px_#e8002d,0_8px_32px_rgba(232,0,45,0.2)]",
          size === "sm" && "text-xs",
          size === "lg" && "text-base"
        )}
      >
        {/* Poster */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <Image
            src={anime.coverImage.large}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />

          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top red accent bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#e8002d] opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Rank badge */}
          {rank && (
            <div className="absolute top-0 left-0 bg-[#e8002d] text-white text-[10px] font-black px-2 py-1 uppercase">
              #{rank}
            </div>
          )}

          {/* Format badge */}
          {!rank && anime.format && (
            <div className="absolute top-2 left-2 bg-black/80 border border-[#333] text-white/80 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
              {anime.format === "TV" ? "TV" : anime.format === "MOVIE" ? "Film" : anime.format}
            </div>
          )}

          {/* Watchlist button */}
          <button
            onClick={handleWatchlist}
            className={cn(
              "absolute top-2 right-2 p-1.5 transition-all duration-200 z-10",
              inWatchlist
                ? "bg-[#e8002d] text-white"
                : "bg-black/70 border border-[#333] text-white/60 hover:text-white opacity-0 group-hover:opacity-100"
            )}
          >
            {inWatchlist ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>

          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-[#e8002d] p-3 shadow-[0_0_20px_rgba(232,0,45,0.6)]">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>

          {/* Continue watching badge */}
          {progress && (
            <div className="absolute bottom-2 left-2 bg-black/90 border border-[#e8002d]/50 text-white text-[9px] px-1.5 py-0.5 flex items-center gap-1 font-bold uppercase">
              <Play className="w-2.5 h-2.5 fill-[#e8002d] text-[#e8002d]" />
              EP {progress.episode}
            </div>
          )}

          {/* Score badge */}
          {anime.averageScore && (
            <div className="absolute bottom-2 right-2 bg-black/90 text-[10px] font-black px-1.5 py-0.5" style={{ color: anime.averageScore >= 75 ? '#22c55e' : anime.averageScore >= 60 ? '#eab308' : '#ef4444' }}>
              {(anime.averageScore / 10).toFixed(1)}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progressPct !== null && (
          <div className="h-[2px] w-full bg-[#222]">
            <div
              className="h-full bg-[#e8002d] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Info */}
        <div className="p-2.5">
          <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight mb-1.5">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#888] font-medium">
              {anime.episodes
                ? `${anime.episodes} EPS`
                : anime.nextAiringEpisode
                ? `EP ${anime.nextAiringEpisode.episode - 1}+`
                : "?"}
            </span>
            {anime.seasonYear && (
              <span className="text-[9px] text-[#555] font-bold uppercase">{anime.seasonYear}</span>
            )}
          </div>
          {anime.genres && anime.genres.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {anime.genres.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="text-[8px] px-1.5 py-0.5 border border-[#e8002d]/30 text-[#e8002d]/80 font-bold uppercase tracking-wide"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );}