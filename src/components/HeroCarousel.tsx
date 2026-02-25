"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Anime } from "@/lib/anilist";
import { getAnimeTitle, formatScore, formatStatus, stripHtml } from "@/lib/utils";

interface HeroCarouselProps {
    animes: Anime[];
}

export default function HeroCarousel({ animes }: HeroCarouselProps) {
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

    const goTo = (idx: number) => {
        if (animating) return;
        setAnimating(true);
        setCurrent(idx);
        setTimeout(() => setAnimating(false), 400);
    };

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % animes.length);
        }, 7000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [animes.length]);

    if (!animes.length) return null;

    const anime = animes[current];
    const title = getAnimeTitle(anime.title);
    const description = stripHtml(anime.description);

    return (
        <section className="relative w-full h-[60vh] sm:h-[85vh] min-h-[420px] sm:min-h-[560px] max-h-[820px] overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0">
                {anime.bannerImage ? (
                    <Image
                        src={anime.bannerImage}
                        alt=""
                        fill
                        className="object-cover object-center transition-opacity duration-500"
                        style={{ opacity: animating ? 0.3 : 0.45 }}
                        sizes="100vw"
                        priority
                    />
                ) : (
                    <Image
                        src={anime.coverImage.extraLarge}
                        alt=""
                        fill
                        className="object-cover object-top"
                        style={{ opacity: 0.25 }}
                        sizes="100vw"
                    />
                )}
                {/* Heavy overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50" />
                {/* Red line at top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#e8002d]" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">

                    {/* Left: info */}
                    <div className="lg:col-span-3 space-y-5">
                        {/* Top tag row */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="bg-[#e8002d] px-3 py-1">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                    #{current + 1} Trending
                                </span>
                            </div>
                            <div className="border border-[#333] px-3 py-1">
                                <span className="text-[10px] font-bold text-[#888] uppercase tracking-widest">
                                    {anime.format ?? "TV"}
                                </span>
                            </div>
                            {anime.genres.slice(0, 2).map((g) => (
                                <div key={g} className="border border-[#222] px-3 py-1">
                                    <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">{g}</span>
                                </div>
                            ))}
                        </div>

                        {/* Title */}
                        <div>
                            <h1
                                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none uppercase"
                                style={{
                                    fontFamily: "var(--font-bebas), 'Space Grotesk', sans-serif",
                                    letterSpacing: "0.04em",
                                    textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                                    opacity: animating ? 0 : 1,
                                    transition: "opacity 0.4s",
                                }}
                            >
                                {title}
                            </h1>
                            {anime.title.romaji !== title && (
                                <p className="text-[#555] text-sm mt-1.5 font-medium tracking-wide">{anime.title.romaji}</p>
                            )}
                            {/* Red underline accent */}
                            <div className="h-[3px] mt-4 w-20 bg-[#e8002d]" />
                        </div>

                        {/* Stats row */}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wide">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 fill-[#e8002d] text-[#e8002d]" />
                                <span className="text-white text-base font-black">{formatScore(anime.averageScore)}</span>
                                <span className="text-[#555]">/10</span>
                            </div>
                            <div className="w-px h-4 bg-[#222]" />
                            <span className="text-[#888]">
                                {anime.episodes ? `${anime.episodes} EPS` : "ONGOING"}
                            </span>
                            <div className="w-px h-4 bg-[#222]" />
                            <span className="text-[#888]">{anime.seasonYear ?? ""}</span>
                            <div className="w-px h-4 bg-[#222]" />
                            <span
                                className={`${anime.status === "RELEASING"
                                        ? "text-[#e8002d]"
                                        : "text-[#555]"
                                    }`}
                            >
                                {formatStatus(anime.status)}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-[#888] text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-lg hidden sm:block">
                            {description || "No description available."}
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <Link
                                href={`/anime/${anime.id}/watch/1`}
                                className="flex items-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] text-white font-black px-5 sm:px-8 py-2.5 sm:py-3.5 uppercase tracking-widest text-xs sm:text-sm transition-all hover:shadow-[0_0_20px_rgba(232,0,45,0.5)]"
                            >
                                <Play className="w-4 h-4 fill-white" />
                                Watch Now
                            </Link>
                            <Link
                                href={`/anime/${anime.id}`}
                                className="flex items-center gap-2 border-2 border-white/30 hover:border-white text-white font-black px-4 sm:px-7 py-2.5 sm:py-3.5 uppercase tracking-widest text-xs sm:text-sm transition-all hover:bg-white/10"
                            >
                                <Info className="w-4 h-4" />
                                Details
                            </Link>
                        </div>
                    </div>

                    {/* Right: poster */}
                    <div className="hidden lg:flex lg:col-span-2 justify-end items-center pr-4">
                        <div className="relative w-52 border-2 border-[#e8002d] shadow-[0_0_40px_rgba(232,0,45,0.3)]">
                            <Image
                                src={anime.coverImage.extraLarge}
                                alt={title}
                                width={208}
                                height={294}
                                priority={current === 0}
                                className="w-full h-auto object-cover"
                                style={{ aspectRatio: "2/3", opacity: animating ? 0.4 : 1, transition: "opacity 0.4s" }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t-2 border-[#e8002d] p-3 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-[#e8002d] text-[#e8002d]" />
                                    <span className="text-white font-black text-sm">{formatScore(anime.averageScore)}</span>
                                </div>
                                <span className="text-[#555] text-xs font-bold uppercase">{anime.seasonYear}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom thumbnails + controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-[#1a1a1a] bg-black/60 backdrop-blur-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 py-3">
                    {/* Thumbnails — hidden on mobile */}
                    <div className="hidden sm:flex items-center gap-2">
                        {animes.slice(0, 6).map((a, i) => {
                            const t = getAnimeTitle(a.title);
                            return (
                                <button
                                    key={a.id}
                                    onClick={() => goTo(i)}
                                    className={`relative overflow-hidden transition-all duration-200 border-2 ${i === current
                                            ? "border-[#e8002d] w-16 h-10 opacity-100"
                                            : "border-transparent w-10 h-10 opacity-40 hover:opacity-70"
                                        }`}
                                    title={t}
                                >
                                    <Image
                                        src={a.coverImage.medium}
                                        alt={t}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                </button>
                            );
                        })}
                    </div>
                    {/* Mobile dot indicators */}
                    <div className="flex sm:hidden items-center gap-1.5">
                        {animes.slice(0, 6).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`transition-all duration-200 ${i === current ? "w-4 h-1.5 bg-[#e8002d]" : "w-1.5 h-1.5 bg-[#333]"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Prev / Next */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => goTo((current - 1 + animes.length) % animes.length)}
                            className="border border-[#333] hover:border-white text-white p-2 transition-all hover:bg-white/10"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => goTo((current + 1) % animes.length)}
                            className="bg-[#e8002d] hover:bg-[#c8001d] text-white p-2 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
