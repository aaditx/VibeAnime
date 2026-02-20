import AnimeCard from "./AnimeCard";
import type { Anime } from "@/lib/anilist";
import { Frown } from "lucide-react";

interface AnimeGridProps {
  animes: Anime[];
  loading?: boolean;
}

export default function AnimeGrid({ animes, loading }: AnimeGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="overflow-hidden bg-[#111] border border-[#1e1e1e] animate-pulse">
            <div className="aspect-[2/3] bg-[#1a1a1a]" />
            <div className="p-2.5 space-y-2">
              <div className="h-3 bg-[#1a1a1a] w-3/4" />
              <div className="h-3 bg-[#1a1a1a] w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!animes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#8888aa]">
        <Frown className="w-16 h-16 mb-4 opacity-40" />
        <p className="text-lg font-medium">No anime found</p>
        <p className="text-sm mt-1 opacity-70">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {animes.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
