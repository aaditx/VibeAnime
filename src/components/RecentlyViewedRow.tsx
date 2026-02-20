"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { formatScore } from "@/lib/utils";

export default function RecentlyViewedRow() {
  const { items } = useRecentlyViewedStore();

  if (!items.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 bg-[#e8002d]" />
        <Clock className="w-4 h-4 text-[#e8002d]" />
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Recently Viewed</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => {
          const accentColor = item.coverColor ?? "#e8002d";
          return (
            <Link
              key={item.id}
              href={`/anime/${item.id}`}
              className="flex-none flex items-center gap-3 bg-[#111] border border-[#1e1e1e] hover:border-[#e8002d] p-2.5 pr-4 transition-all group"
              style={{ minWidth: "200px", maxWidth: "220px" }}
            >
              <div className="flex-none relative w-10 h-14 overflow-hidden border border-[#222]">
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="40px"
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: accentColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-white text-[10px] font-black uppercase tracking-wide line-clamp-2 leading-tight mb-1 group-hover:text-[#e8002d] transition-colors">
                  {item.title}
                </p>
                <p className="text-[10px] font-bold text-[#555]">
                  ★ {formatScore(item.averageScore)}
                </p>
                {item.genres[0] && (
                  <span className="text-[9px] mt-1 inline-block px-1.5 py-0.5 border border-[#222] text-[#555] uppercase font-bold tracking-wide">
                    {item.genres[0]}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
