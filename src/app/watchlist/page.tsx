"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Play, Trash2, Star } from "lucide-react";
import { useWatchlistStore } from "@/store/useWatchlistStore";
import { formatScore, formatStatus } from "@/lib/utils";

export default function WatchlistPage() {
  const { items, removeFromWatchlist, clearWatchlist } = useWatchlistStore();

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-7 bg-[#e8002d]" />
              <Bookmark className="w-5 h-5 text-[#e8002d]" />
              My Watchlist
            </h1>
            <p className="text-[#8888aa] text-sm mt-1">{items.length} anime saved</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear entire watchlist?")) clearWatchlist();
              }}
              className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-[#111] border border-[#1e1e1e] flex items-center justify-center mb-6">
              <Bookmark className="w-8 h-8 text-[#333]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No anime saved yet</h2>
            <p className="text-[#8888aa] text-sm mb-6 max-w-xs">
              Browse anime and click the bookmark icon to add them to your watchlist.
            </p>
            <Link
              href="/search"
              className="bg-[#e8002d] hover:bg-[#c8001d] text-white font-black uppercase tracking-widest px-6 py-3 transition-all"
            >
              Browse Anime
            </Link>
          </div>
        )}

        {/* Watchlist grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#111] border border-[#1e1e1e] overflow-hidden flex hover:border-[#e8002d] transition-colors group"
              >
                {/* Thumbnail */}
                <Link href={`/anime/${item.id}`} className="flex-none w-24 relative">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 p-3 min-w-0">
                  <Link href={`/anime/${item.id}`}>
                    <h3 className="font-black text-white text-sm line-clamp-2 hover:text-[#e8002d] uppercase tracking-wide transition-colors mb-1">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-[#8888aa] mb-2">
                    <span className="flex items-center gap-0.5 text-[#e8002d]">
                      <Star className="w-3 h-3 fill-[#e8002d]" />
                      {formatScore(item.averageScore)}
                    </span>
                    <span>{formatStatus(item.status)}</span>
                    {item.episodes && <span>{item.episodes} eps</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.genres.slice(0, 2).map((g) => (
                      <span key={g} className="text-[9px] px-1.5 py-0.5 bg-[#111] border border-[#1e1e1e] text-[#555] uppercase font-bold tracking-wide">
                        {g}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/anime/${item.id}/watch/1`}
                      className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-[#e8002d] hover:bg-[#c8001d] text-white px-2.5 py-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-white" /> Watch
                    </Link>
                    <button
                      onClick={() => removeFromWatchlist(item.id)}
                      className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-[#111] border border-[#222] hover:border-[#e8002d] hover:text-white text-[#555] px-2 py-1.5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
