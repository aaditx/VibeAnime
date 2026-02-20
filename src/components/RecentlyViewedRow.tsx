"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Star } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { formatScore } from "@/lib/utils";

export default function RecentlyViewedRow() {
  const { items } = useRecentlyViewedStore();

  if (!items.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-rose-500 rounded-full inline-block" />
        <Clock className="w-4 h-4 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Recently Viewed</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => {
          const accentColor = item.coverColor ?? "#e11d48";
          return (
            <Link
              key={item.id}
              href={`/anime/${item.id}`}
              className="flex-none flex items-center gap-3 bg-[#16161a] border border-[#2a2a35] hover:border-rose-500/40 rounded-xl p-2.5 pr-4 transition-all group hover:-translate-y-0.5"
              style={{ minWidth: "200px", maxWidth: "220px" }}
            >
              <div className="flex-none relative w-10 h-14 rounded-lg overflow-hidden">
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="40px"
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: accentColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-1">
                  {item.title}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-[#8888aa]">
                  <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400">{formatScore(item.averageScore)}</span>
                </div>
                {item.genres[0] && (
                  <span
                    className="text-[9px] mt-1 inline-block px-1.5 py-0.5 rounded-full"
                    style={{ background: `${accentColor}20`, color: accentColor }}
                  >
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
