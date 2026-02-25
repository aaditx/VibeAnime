"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, Menu, X, Bookmark, LogIn, LogOut, User,
  ChevronDown, Shuffle, Flame, Star, TrendingUp, Grid3x3, Zap,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { GENRES } from "@/lib/anilist";
import Image from "next/image";

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
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
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

  // Fetch points & avatar whenever user logs in
  useEffect(() => {
    if (!session?.user?.id) { setUserPoints(null); setUserAvatar(null); return; }
    fetch("/api/user/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.points != null) setUserPoints(data.points);
        if (data?.avatarId) setUserAvatar(data.avatarId);
      })
      .catch(() => { });
  }, [session?.user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const handleRandomAnime = async () => {
    // Curated pool of popular AniList IDs — always valid, never 404
    const popularIds = [
      20, 21, 16498, 101922, 21459, 5114, 9253, 1535, 11757, 11061,
      20583, 97940, 154587, 113415, 136430, 121301, 1, 6702, 918, 2904,
      19, 269, 35760, 38524, 237, 31964, 22319, 105333, 98659, 131681,
    ];
    const id = popularIds[Math.floor(Math.random() * popularIds.length)];
    router.push(`/anime/${id}`);
  };

  const navLinks = [
    { href: "/search?sort=TRENDING_DESC", label: "Trending", icon: <Flame className="w-3.5 h-3.5" /> },
    { href: "/search?sort=POPULARITY_DESC", label: "Popular", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { href: "/search?sort=SCORE_DESC", label: "Top Rated", icon: <Star className="w-3.5 h-3.5" /> },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#0d0d14]/95 backdrop-blur-xl border-b border-[#ffffff12] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-transparent backdrop-blur-sm border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={cn(
          "flex items-center h-14 gap-4",
          pathname === "/" ? "justify-center" : "justify-between"
        )}>
          {/* Left: Logo & Nav */}
          <div className={cn(
            "flex items-center",
            pathname === "/" ? "gap-0" : "gap-6 md:gap-10"
          )}>
            {/* Logo - Hide on root page */}
            {pathname !== "/" && (
              <Link href="/" className="flex items-center gap-1.5 focus:outline-none">
                <span className="text-2xl font-black italic tracking-tighter" style={{ fontFamily: "var(--font-bebas)" }}>
                  <span className="text-white">VIBE</span>
                  <span className="text-[#e8002d]">ANIME</span>
                </span>
              </Link>
            )}

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {[{ href: "/home", label: "Home" }, { href: "/leaderboard", label: "🏆 Ranks" }, ...navLinks].map((link) => {
                const isActive = pathname === link.href || (link.href !== "/home" && link.href !== "/leaderboard" && pathname.startsWith(link.href.split("?")[0]));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all rounded-sm",
                      isActive
                        ? "text-[#e8002d]"
                        : "text-[#aaa] hover:text-white hover:bg-white/5"
                    )}
                  >
                    {(link as { label: string }).label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#e8002d] rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* Genres dropdown */}
              <div ref={genreRef} className="relative">
                <button
                  onClick={() => setGenreOpen(!genreOpen)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all rounded-sm",
                    genreOpen
                      ? "text-[#e8002d]"
                      : "text-[#aaa] hover:text-white hover:bg-white/5"
                  )}
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                  Genres
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", genreOpen && "rotate-180")} />
                  {genreOpen && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#e8002d] rounded-full" />
                  )}
                </button>

                {genreOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[440px] bg-[#0d0d14]/98 backdrop-blur-xl border border-[#ffffff14] shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-5 z-50 rounded-xl">
                    <p className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Browse by Genre</p>
                    <div className="grid grid-cols-4 gap-2">
                      {GENRES.map((g) => (
                        <Link
                          key={g}
                          href={`/search?genre=${encodeURIComponent(g)}`}
                          className="flex flex-col items-center gap-1 p-2 border border-white/5 hover:border-[#e8002d] hover:bg-[#e8002d]/10 transition-all group rounded-lg"
                        >
                          <span className="text-lg">{GENRE_EMOJIS[g] ?? "🎬"}</span>
                          <span className="text-[9px] font-bold text-[#888] group-hover:text-white uppercase tracking-wide text-center leading-tight">
                            {g}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5">
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
          </div>

          {/* Right actions - Hide on root page */}
          <div className="flex items-center gap-2">
            {pathname !== "/" && (
              <>
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
                  <div className="hidden md:flex items-center gap-0">
                    {/* Points pill */}
                    {userPoints !== null && (
                      <Link
                        href="/profile"
                        className="flex items-center gap-1 border border-[#e8002d]/40 bg-[#e8002d]/10 hover:bg-[#e8002d]/20 px-2.5 py-1.5 transition-all"
                        title="View your profile & badges"
                      >
                        <Zap className="w-3 h-3 text-[#e8002d]" />
                        <span className="text-[10px] font-black text-[#e8002d] tabular-nums">
                          {userPoints.toLocaleString()}
                        </span>
                      </Link>
                    )}
                    {/* User name → profile */}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 pl-2 pr-4 py-1.5 transition-all group"
                    >
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt=""
                          width={24}
                          height={24}
                          className="rounded-full ring-1 ring-[#e8002d]/50 group-hover:ring-[#e8002d] transition-all"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center ring-1 ring-white/10">
                          <User className="w-3.5 h-3.5 text-[#888]" />
                        </div>
                      )}
                      <span className="text-[10px] font-black text-white tracking-widest uppercase">
                        {session.user?.name || "User"}
                      </span>
                    </Link>

                    {/* Quick logout */}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="border border-white/10 border-l-0 hover:border-white/30 hover:bg-white/10 px-3 py-1.5 transition-all"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4 text-[#888] hover:text-[#e8002d] transition-colors" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="hidden md:flex items-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] text-white px-5 py-1.5 font-bold text-xs uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(232,0,45,0.3)] hover:shadow-[0_0_20px_rgba(232,0,45,0.5)]"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Link>
                )}
              </>
            )}

            {/* Mobile Menu Toggle (Always show if not hidden logic applies) */}
            <button
              className="md:hidden p-2 text-[#888] hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-t-2 border-[#e8002d]">
            <div className="p-4 space-y-0">
              {[
                { href: "/home", label: "Home" },
                { href: "/leaderboard", label: "🏆 Leaderboard" },
                { href: "/search?sort=TRENDING_DESC", label: "Trending" },
                { href: "/search?sort=POPULARITY_DESC", label: "Popular" },
                { href: "/search?sort=SCORE_DESC", label: "Top Rated" },
                { href: "/watchlist", label: "Watchlist" },
                { href: "/search", label: "Browse All" },
                ...(session ? [{ href: "/profile", label: userPoints !== null ? `⚡ Profile (${userPoints.toLocaleString()} pts)` : "Profile" }] : []),
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
