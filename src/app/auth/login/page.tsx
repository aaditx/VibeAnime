"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Try demo@vibeanime.com / demo123");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-0">
            <div className="border-2 border-white px-3 py-1">
              <span className="font-black text-2xl tracking-tight text-white uppercase">Vibe</span>
              <span className="font-black text-2xl tracking-tight text-[#e8002d] uppercase">Anime</span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="border-2 border-[#1e1e1e] bg-[#111] p-8">
          {/* YOUR EMAIL + divider */}
          <h2 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Sign In</h2>
          <div className="w-full h-px bg-[#222] mb-6" />

          {/* Demo hint */}
          <div className="mb-5 p-3 border border-[#e8002d]/30 bg-[#e8002d]/5 text-[11px] font-bold text-[#e8002d] uppercase tracking-wide">
            Demo: demo@vibeanime.com / demo123
          </div>

          {error && (
            <div className="mb-4 p-3 border border-[#e8002d] bg-[#e8002d]/10 text-sm font-bold text-[#e8002d]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-2">Your Email</label>
              <div className="w-full h-px bg-[#222] mb-3" />
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  required
                  className="w-full bg-[#0a0a0a] border-2 border-[#1e1e1e] focus:border-[#e8002d] text-white placeholder:text-[#444] rounded-none pl-9 pr-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-2">Password</label>
              <div className="w-full h-px bg-[#222] mb-3" />
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0a0a0a] border-2 border-[#1e1e1e] focus:border-[#e8002d] text-white placeholder:text-[#444] rounded-none pl-9 pr-10 py-3 text-sm focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href="/auth/forgot-password" className="text-[10px] font-bold text-[#555] hover:text-[#e8002d] uppercase tracking-widest transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Sign In section */}
            <div className="pt-2">
              <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-1">Sign In</label>
              <div className="w-full h-px bg-[#222] mb-3" />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] disabled:opacity-50 text-white font-black py-3.5 uppercase tracking-widest text-sm transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full spinner" />
                ) : (
                  <><LogIn className="w-4 h-4" /> Sign In</>
                )}
              </button>
            </div>
          </form>

          {/* Join Session style — Register */}
          <div className="mt-6">
            <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-1">New Here?</label>
            <div className="w-full h-px bg-[#222] mb-3" />
            <div className="flex items-center gap-3">
              <Link
                href="/auth/register"
                className="flex-1 text-center border-2 border-[#333] hover:border-white text-white font-black py-3 uppercase tracking-widest text-xs transition-all hover:bg-white/5"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
