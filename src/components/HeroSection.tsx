"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Play } from "lucide-react";
import type { Anime } from "@/lib/anilist";
import { getAnimeTitle } from "@/lib/utils";

interface HeroSectionProps {
  animes: Anime[];
}

const TOP_SEARCHES = [
  "Solo Leveling",
  "One Piece",
  "Demon Slayer",
  "Jujutsu Kaisen",
  "Attack on Titan",
  "Frieren",
  "Bleach",
];

export default function HeroSection({ animes }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [query, setQuery] = useState("");
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % animes.length);
        setFading(false);
      }, 500);
    }, 6000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [animes.length]);

  const goTo = (idx: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 300);
    startTimer();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  if (!animes.length) return null;

  const anime = animes[current];
  const bgImage = anime.bannerImage || anime.coverImage.extraLarge;
  const posterAnimes = [0, 1, 2].map((o) => animes[(current + o) % animes.length]);

  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden">

      {/* ─── Background ─── */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <Image
          src={bgImage}
          alt=""
          fill
          className="object-cover object-top"
          sizes="100vw"
          priority
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14] via-[#0d0d14]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/10 to-[#0a0a0a]/70" />

      {/* ─── Page content ─── */}
      <div className="relative z-10 h-full flex flex-col">

        {/* Spacer for fixed navbar */}
        <div className="h-14 flex-none" />

        {/* Main centered area */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between gap-10" style={{ marginTop: "-20px" }}>

            {/* ─── LEFT ─── */}
            <div className="flex-1 max-w-[560px] flex flex-col gap-7">

              {/* Logo */}
              <div className="flex flex-col gap-1.5">
                <Link href="/" className="group inline-block">
                  <span
                    className="text-[4rem] leading-none font-black tracking-tight"
                    style={{ fontFamily: "var(--font-bebas, 'Space Grotesk', sans-serif)" }}
                  >
                    <span className="text-white">Vibe</span>
                    <span className="text-[#e8002d]">Anime</span>
                  </span>
                </Link>
                <p className="text-white/45 text-sm font-medium tracking-wide">
                  Stream &amp; discover anime, free and fast.
                </p>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex h-13 shadow-xl shadow-black/50">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime..."
                  className="flex-1 bg-white text-[#111] placeholder:text-[#999] text-[15px] font-medium px-5 outline-none rounded-l-xl rounded-r-none focus:ring-2 focus:ring-inset focus:ring-[#e8002d]"
                />
                <button
                  type="submit"
                  className="w-14 bg-[#e8002d] hover:bg-[#c8001d] transition-colors text-white flex items-center justify-center rounded-r-xl flex-none"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {/* Top searches */}
              <div className="flex flex-col gap-2.5">
                <p className="text-sm">
                  <span className="text-[#e8002d] font-semibold">Top search: </span>
                  {TOP_SEARCHES.slice(0, 3).map((s, i) => (
                    <Link
                      key={s}
                      href={`/search?q=${encodeURIComponent(s)}`}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {s}{i < 2 ? <span className="text-white/25 mx-1">·</span> : ""}
                    </Link>
                  ))}
                </p>
                <div className="flex flex-wrap gap-2">
                  {TOP_SEARCHES.slice(3).map((s) => (
                    <Link
                      key={s}
                      href={`/search?q=${encodeURIComponent(s)}`}
                      className="text-[11px] font-semibold text-white/50 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 px-3 py-1.5 rounded-full transition-all"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3">
                <Link
                  href="/home"
                  className="inline-flex items-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] text-white font-bold px-7 py-3 rounded-lg text-sm transition-all shadow-lg shadow-[#e8002d]/30 hover:shadow-[#e8002d]/50 group"
                >
                  Watch Anime
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href={`/anime/${anime.id}/watch/1`}
                  className="inline-flex items-center gap-2.5 bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/30 text-white/80 hover:text-white font-medium px-5 py-3 rounded-lg text-sm transition-all backdrop-blur-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="max-w-[130px] truncate">{getAnimeTitle(anime.title)}</span>
                </Link>
              </div>

              {/* Dot pagination */}
              <div className="flex items-center gap-2">
                {animes.slice(0, 6).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`transition-all duration-300 rounded-full ${i === current
                      ? "w-7 h-2 bg-[#e8002d]"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* ─── RIGHT: Poster collage ─── */}
            <div className="hidden lg:block relative flex-none" style={{ width: 380, height: 460 }}>
              {posterAnimes.map((pa, i) => {
                const configs = [
                  {
                    style: {
                      bottom: 0,
                      right: 220,
                      transform: "rotate(-9deg)",
                      zIndex: 1,
                      opacity: fading ? 0 : 0.6,
                    },
                    width: 165,
                    height: 235,
                  },
                  {
                    style: {
                      bottom: 30,
                      right: 110,
                      transform: "rotate(1deg)",
                      zIndex: 2,
                      opacity: fading ? 0 : 0.8,
                    },
                    width: 173,
                    height: 245,
                  },
                  {
                    style: {
                      bottom: 30,
                      right: 0,
                      transform: "rotate(11deg)",
                      zIndex: 3,
                      opacity: fading ? 0 : 1,
                    },
                    width: 183,
                    height: 260,
                  },
                ];
                const cfg = configs[i];
                return (
                  <div
                    key={`${pa.id}-${i}`}
                    className="absolute transition-all duration-700"
                    style={cfg.style}
                  >
                    <div
                      className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
                      style={{ width: cfg.width, height: cfg.height }}
                    >
                      <Image
                        src={pa.coverImage.extraLarge}
                        alt={getAnimeTitle(pa.title)}
                        width={cfg.width}
                        height={cfg.height}
                        className="w-full h-full object-cover"
                        priority={i === 2}
                      />
                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-2 px-2.5">
                        <p className="text-white text-[10px] font-bold truncate leading-tight">
                          {getAnimeTitle(pa.title)}
                        </p>
                        {pa.averageScore && (
                          <p className="text-[#e8002d] text-[9px] font-black mt-0.5">
                            ★ {(pa.averageScore / 10).toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Glow behind cards */}
              <div
                className="absolute rounded-full blur-3xl pointer-events-none"
                style={{
                  width: 260,
                  height: 260,
                  right: 20,
                  bottom: 40,
                  background: "radial-gradient(circle, rgba(232,0,45,0.18) 0%, transparent 70%)",
                }}
              />
            </div>

          </div>
        </div>

        {/* Bottom fade hint */}
        <div className="h-20 flex-none" />
      </div>

      {/* Bottom gradient into page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}
