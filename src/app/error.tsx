"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[VibeAnime]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="max-w-lg w-full text-center">
        <div
          className="text-[120px] sm:text-[160px] font-black leading-none text-[#111] select-none"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          ERR<span className="text-[#e8002d]">OR</span>
        </div>

        <div className="relative -mt-4">
          <div className="h-[2px] bg-[#e8002d] mb-8" />
          <h1 className="text-xl font-black text-white uppercase tracking-widest mb-3">
            Something went wrong
          </h1>
          <p className="text-[#555] text-sm mb-2 max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred. This is usually a temporary issue.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-[#333] mb-8">ref: {error.digest}</p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={reset}
              className="flex items-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] text-white font-black uppercase tracking-widest px-6 py-3 transition-all hover:shadow-[0_0_20px_rgba(232,0,45,0.4)] text-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 border border-[#333] hover:border-[#e8002d] text-[#888] hover:text-white font-black uppercase tracking-widest px-6 py-3 transition-all text-sm"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
