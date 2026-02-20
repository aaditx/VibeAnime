"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import AnimeGrid from "@/components/AnimeGrid";
import SearchFilters from "@/components/SearchFilters";
import { SORT_OPTIONS } from "@/lib/anilist";
import type { Anime } from "@/lib/anilist";

function SearchContent() {
  const searchParams = useSearchParams();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "TRENDING_DESC";
  const genre = searchParams.get("genre") ?? "";
  const format = searchParams.get("format") ?? "";
  const status = searchParams.get("status") ?? "";
  const season = searchParams.get("season") ?? "";
  const year = searchParams.get("year") ?? "";

  useEffect(() => {
    setAnimes([]);
    setPage(1);
  }, [q, sort, genre, format, status, season, year]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const sortArr = sort ? sort.split(",") : ["TRENDING_DESC"];

    const params = new URLSearchParams({
      page: String(page),
      perPage: "24",
      sort: sortArr.join(","),
    });
    if (q) params.set("search", q);
    if (genre) params.set("genre", genre);
    if (format) params.set("format", format);
    if (status) params.set("status", status);
    if (season) params.set("season", season);
    if (year) params.set("year", year);

    fetch(`/api/anime/search?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setAnimes((prev) => (page === 1 ? data.media : [...prev, ...data.media]));
        setHasNextPage(data.pageInfo?.hasNextPage ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [q, sort, genre, format, status, season, year, page]);

  const sortLabel = SORT_OPTIONS.find((s) => s.value.join(",") === sort)?.label ?? "Results";

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-1">
            <Search className="w-5 h-5 text-[#e8002d]" />
            {q ? `"${q}"` : sortLabel}
          </h1>
          {animes.length > 0 && !loading && (
            <p className="text-[#8888aa] text-sm">{animes.length} anime found</p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <SearchFilters />
        </div>

        {/* Grid */}
        <AnimeGrid animes={animes} loading={loading && page === 1} />

        {/* Load More */}
        {hasNextPage && !loading && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="bg-[#e8002d] hover:bg-[#c8001d] text-white font-black uppercase tracking-widest px-8 py-3 transition-all hover:shadow-[0_0_20px_rgba(232,0,45,0.4)]"
            >
              Load More
            </button>
          </div>
        )}

        {loading && page > 1 && (
          <div className="flex justify-center mt-8">
            <div className="w-8 h-8 border-2 border-[#e8002d] border-t-transparent spinner" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#e8002d] border-t-transparent spinner" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
