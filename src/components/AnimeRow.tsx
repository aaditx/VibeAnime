import Link from "next/link";
import AnimeCard from "./AnimeCard";
import type { Anime } from "@/lib/anilist";

interface AnimeRowProps {
  title: string;
  animes: Anime[];
  viewAllHref?: string;
  showRank?: boolean;
}

export default function AnimeRow({ title, animes, viewAllHref, showRank }: AnimeRowProps) {
  if (!animes.length) return null;

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#e8002d]" />
          <h2 className="text-base font-black text-white uppercase tracking-widest">{title}</h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[10px] font-black uppercase tracking-widest text-[#888] hover:text-[#e8002d] border border-[#333] hover:border-[#e8002d] px-3 py-1.5 transition-all"
          >
            View All →
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {animes.map((anime, index) => (
          <div key={anime.id} className="flex-none w-36 sm:w-44">
            <AnimeCard anime={anime} size="sm" rank={showRank ? index + 1 : undefined} />
          </div>
        ))}
      </div>
    </section>
  );
}

