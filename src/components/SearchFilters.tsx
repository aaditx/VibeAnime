"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { GENRES, FORMATS, STATUSES, SORT_OPTIONS, YEARS, SEASONS } from "@/lib/anilist";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const get = (key: string) => searchParams.get(key) ?? "";

  const activeCount = ["sort", "genre", "format", "status", "season", "year"].filter(
    (k) => get(k)
  ).length;

  const clearAll = () => {
    const q = searchParams.get("q");
    router.push(q ? `/search?q=${q}` : "/search");
  };

  return (
    <div className="space-y-3">
      {/* Sort pills (always visible) */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] text-[#555] font-black uppercase tracking-widest mr-1">Sort:</span>
        {SORT_OPTIONS.map((opt) => {
          const val = opt.value.join(",");
          const active = get("sort") === val || (!get("sort") && val === "TRENDING_DESC");
          return (
            <button
              key={val}
              onClick={() => update("sort", active ? "" : val)}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 transition-all border ${
                active
                  ? "bg-[#e8002d] border-[#e8002d] text-white"
                  : "bg-[#111] border-[#222] text-[#555] hover:border-[#e8002d] hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        {/* More filters toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 border transition-all ${
            expanded || activeCount > 0
              ? "border-[#e8002d] text-[#e8002d] bg-[#e8002d]/5"
              : "border-[#222] text-[#555] bg-[#111] hover:border-[#e8002d] hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters{activeCount > 1 ? ` (${activeCount - 1})` : ""}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="bg-[#111] border border-[#1e1e1e] p-4 space-y-4">
          {/* Genre */}
          <FilterSection label="Genre">
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <PillButton
                  key={g}
                  label={g}
                  active={get("genre") === g}
                  onClick={() => update("genre", get("genre") === g ? "" : g)}
                />
              ))}
            </div>
          </FilterSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Format */}
            <FilterSection label="Format">
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <PillButton
                    key={f.value}
                    label={f.label}
                    active={get("format") === f.value}
                    onClick={() => update("format", get("format") === f.value ? "" : f.value)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Status */}
            <FilterSection label="Status">
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <PillButton
                    key={s.value}
                    label={s.label}
                    active={get("status") === s.value}
                    onClick={() => update("status", get("status") === s.value ? "" : s.value)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Season */}
            <FilterSection label="Season">
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((s) => (
                  <PillButton
                    key={s}
                    label={s.charAt(0) + s.slice(1).toLowerCase()}
                    active={get("season") === s}
                    onClick={() => update("season", get("season") === s ? "" : s)}
                  />
                ))}
              </div>
            </FilterSection>
          </div>

          {/* Year */}
          <FilterSection label="Year">
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              {YEARS.slice(0, 30).map((y) => (
                <PillButton
                  key={y}
                  label={String(y)}
                  active={get("year") === String(y)}
                  onClick={() => update("year", get("year") === String(y) ? "" : String(y))}
                  small
                />
              ))}
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-black text-[#e8002d] uppercase tracking-widest mb-2 border-b border-[#1a1a1a] pb-1">{label}</p>
      {children}
    </div>
  );
}

function PillButton({
  label,
  active,
  onClick,
  small,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-black uppercase tracking-widest transition-all border ${
        small ? "text-[9px] px-2.5 py-1" : "text-[10px] px-3 py-1.5"
      } ${
        active
          ? "bg-[#e8002d] border-[#e8002d] text-white"
          : "bg-[#0a0a0a] border-[#222] text-[#555] hover:border-[#e8002d] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
