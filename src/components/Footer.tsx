import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t-2 border-[#e8002d] bg-[#0a0a0a] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-0 mb-4">
              <div className="border-2 border-white px-2 py-0.5">
                <span className="font-black text-xl tracking-tight text-white uppercase">Vibe</span>
                <span className="font-black text-xl tracking-tight text-[#e8002d] uppercase">Anime</span>
              </div>
            </Link>
            <p className="text-[#555] text-sm leading-relaxed max-w-xs">
              Your ultimate anime streaming destination. Discover, watch, and track your favourite anime. Powered by AniList.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-4 border-b border-[#1a1a1a] pb-2">Discover</h4>
            <ul className="space-y-3">
              {[
                { href: "/search?sort=TRENDING_DESC", label: "Trending" },
                { href: "/search?sort=POPULARITY_DESC", label: "Popular" },
                { href: "/search?sort=SCORE_DESC", label: "Top Rated" },
                { href: "/search", label: "Browse All" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs font-bold uppercase tracking-wide text-[#555] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-4 border-b border-[#1a1a1a] pb-2">Account</h4>
            <ul className="space-y-3">
              {[
                { href: "/auth/login", label: "Sign In" },
                { href: "/auth/register", label: "Register" },
                { href: "/watchlist", label: "Watchlist" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs font-bold uppercase tracking-wide text-[#555] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#444]">
            &copy; {new Date().getFullYear()} VibeAnime &mdash; For educational purposes only
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#444]">
            Data by{" "}
            <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="text-[#e8002d] hover:text-white transition-colors">AniList</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
