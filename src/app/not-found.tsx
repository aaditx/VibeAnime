import Link from "next/link";
import { Search, Home, TrendingUp } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="max-w-lg w-full text-center">
        {/* Big 404 */}
        <div
          className="text-[160px] sm:text-[220px] font-black leading-none text-[#111] select-none"
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.04em" }}
        >
          4<span className="text-[#e8002d]">0</span>4
        </div>

        <div className="relative -mt-8">
          <div className="h-[2px] bg-[#e8002d] mb-8" />
          <h1 className="text-xl font-black text-white uppercase tracking-widest mb-3">
            Page Not Found
          </h1>
          <p className="text-[#555] text-sm mb-10 max-w-sm mx-auto leading-relaxed">
            This anime may have been dropped, moved, or never existed. Check the URL or head back home.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] text-white font-black uppercase tracking-widest px-6 py-3 transition-all hover:shadow-[0_0_20px_rgba(232,0,45,0.4)] text-sm"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              href="/search?sort=TRENDING_DESC"
              className="flex items-center gap-2 border border-[#333] hover:border-[#e8002d] text-[#888] hover:text-white font-black uppercase tracking-widest px-6 py-3 transition-all text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 border border-[#333] hover:border-[#e8002d] text-[#888] hover:text-white font-black uppercase tracking-widest px-6 py-3 transition-all text-sm"
            >
              <Search className="w-4 h-4" />
              Browse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
