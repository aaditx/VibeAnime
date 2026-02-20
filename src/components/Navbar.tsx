"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, Menu, X, Bookmark, LogIn, LogOut, User,
  ChevronDown, Shuffle, Flame, Star, TrendingUp, Grid3x3,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { GENRES } from "@/lib/anilist";

const GENRE_EMOJIS: Record<string, string> = {
  Action: "⚔️", Adventure: "🗺️", Comedy: "😂", Drama: "🎭", Fantasy: "🧙",
  Horror: "👻", Mecha: "🤖", Music: "🎵", Mystery: "🔍", Psychological: "🧠",
  Romance: "💕", "Sci-Fi": "🚀", "Slice of Life": "🌸", Sports: "⚽",
  Supernatural: "✨", Thriller: "😰",
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const genreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setGenreOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const handleRandomAnime = async () => {
    const randomId = Math.floor(Math.random() * 150000) + 1;
    router.push(`/anime/${randomId}`);
  };

  const navLinks = [
    { href: "/search?sort=TRENDING_DESC", label: "Trending", icon: <Flame className="w-3.5 h-3.5" /> },
    { href: "/search?sort=POPULARITY_DESC", label: "Popular", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { href: "/search?sort=SCORE_DESC", label: "Top Rated", icon: <Star className="w-3.5 h-3.5" /> },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-[#0a0a0a] border-b-2 border-[#e8002d] shadow-[0_2px_20px_rgba(232,0,45,0.15)]"
          : "bg-[#0a0a0a]/90 border-b border-[#1e1e1e]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 flex-none">
            <div className="border-2 border-white px-2 py-0.5 flex items-center">
              <span className="font-black text-lg tracking-tight text-white uppercase">Vibe</span>
              <span className="font-black text-lg tracking-tight text-[#e8002d] uppercase">Anime</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0">
            <Link
              href="/"
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#888] hover:text-white hover:bg-white/5 transition-all"
            >
              Home
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#888] hover:text-white hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}

            {/* Genres dropdown */}
            <div ref={genreRef} className="relative">
              <button
                onClick={() => setGenreOpen(!genreOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all",
                  genreOpen
                    ? "text-[#e8002d] bg-[#e8002d]/10"
                    : "text-[#888] hover:text-white hover:bg-white/5"
                )}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
                Genres
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", genreOpen && "rotate-180")} />
              </button>

              {genreOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[440px] bg-[#0a0a0a] border-2 border-[#e8002d] shadow-[0_8px_40px_rgba(232,0,45,0.2)] p-5 z-50">
                  <p className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-4 border-b border-[#222] pb-2">Browse by Genre</p>
                  <div className="grid grid-cols-4 gap-2">
                    {GENRES.map((g) => (
                      <Link
                        key={g}
                        href={`/search?genre=${encodeURIComponent(g)}`}
                        className="flex flex-col items-center gap-1 p-2 border border-[#222] hover:border-[#e8002d] hover:bg-[#e8002d]/10 transition-all group"
                      >
                        <span className="text-lg">{GENRE_EMOJIS[g] ?? "🎬"}</span>
                        <span className="text-[9px] font-bold text-[#888] group-hover:text-white uppercase tracking-wide text-center leading-tight">
                          {g}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#222]">
                    <Link
                      href="/search"
                      className="flex items-center justify-center gap-2 text-[11px] font-black text-[#e8002d] hover:text-white uppercase tracking-widest transition-colors"
                    >
                      Browse All Anime →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                  <input
                    ref={searchInputRef}
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SEARCH ANIME..."
                    className="bg-[#111] border-2 border-[#e8002d] text-white text-xs font-bold uppercase tracking-wider placeholder:normal-case placeholder:font-normal placeholder:tracking-normal rounded-none pl-9 pr-4 py-2 w-36 sm:w-52 focus:outline-none transition-all"
                  />
                </div>
                <button type="button" onClick={() => setSearchOpen(false)} className="text-[#888] hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
                className="p-2 text-[#888] hover:text-[#e8002d] transition-all"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleRandomAnime}
              className="hidden md:block p-2 text-[#888] hover:text-[#e8002d] transition-all"
              title="Random anime"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <Link
              href="/watchlist"
              className="p-2 text-[#888] hover:text-[#e8002d] transition-all hidden md:block"
              title="Watchlist"
            >
              <Bookmark className="w-5 h-5" />
            </Link>

            {session ? (
              <div className="hidden md:flex items-center gap-2 border border-[#333] px-3 py-1.5">
                <User className="w-3.5 h-3.5 text-[#e8002d]" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  {session.user?.name?.split(" ")[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  className="ml-1 text-[#888] hover:text-[#e8002d] transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-1.5 text-xs font-black bg-[#e8002d] hover:bg-[#c8001d] text-white px-4 py-2 uppercase tracking-widest transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-[#888] hover:text-white transition-all"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-t-2 border-[#e8002d]">
            <div className="p-4 space-y-0">
              {[
                { href: "/", label: "Home" },
                { href: "/search?sort=TRENDING_DESC", label: "Trending" },
                { href: "/search?sort=POPULARITY_DESC", label: "Popular" },
                { href: "/search?sort=SCORE_DESC", label: "Top Rated" },
                { href: "/watchlist", label: "Watchlist" },
                { href: "/search", label: "Browse All" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-[#888] hover:text-white hover:bg-white/5 border-b border-[#1a1a1a] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-[#222] p-4">
              <p className="text-[10px] text-[#e8002d] font-black uppercase tracking-widest mb-3">Genres</p>
              <div className="grid grid-cols-4 gap-2">
                {GENRES.slice(0, 8).map((g) => (
                  <Link
                    key={g}
                    href={`/search?genre=${encodeURIComponent(g)}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col items-center gap-1 p-2 border border-[#222] hover:border-[#e8002d] text-center"
                  >
                    <span className="text-base">{GENRE_EMOJIS[g] ?? "🎬"}</span>
                    <span className="text-[9px] text-[#888] uppercase font-bold">{g}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-[#222] p-4">
              {session ? (
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#e8002d] hover:bg-white/5"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center bg-[#e8002d] hover:bg-[#c8001d] text-white font-black py-3 uppercase tracking-widest text-xs transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
