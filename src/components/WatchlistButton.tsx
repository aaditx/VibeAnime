"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useWatchlistStore } from "@/store/useWatchlistStore";
import type { Anime } from "@/lib/anilist";

interface WatchlistButtonProps {
  anime: Anime;
}

export default function WatchlistButton({ anime }: WatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(anime.id);

  const toggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(anime.id);
    } else {
      addToWatchlist(anime);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 font-black uppercase tracking-widest text-sm px-5 py-3 transition-all border-2 ${
        inWatchlist
          ? "bg-[#e8002d]/10 border-[#e8002d] text-[#e8002d] hover:bg-[#e8002d] hover:text-white"
          : "bg-transparent border-[#333] text-[#555] hover:border-white hover:text-white"
      }`}
    >
      {inWatchlist ? (
        <>
          <BookmarkCheck className="w-4 h-4" /> In Watchlist
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" /> Add to Watchlist
        </>
      )}
    </button>
  );
}
