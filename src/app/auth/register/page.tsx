"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }

      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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

        <div className="border-2 border-[#1e1e1e] bg-[#111] p-8">
          <h2 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Create Account</h2>
          <div className="w-full h-px bg-[#222] mb-6" />

          {error && (
            <div className="mb-4 p-3 border border-[#e8002d] bg-[#e8002d]/10 text-sm font-bold text-[#e8002d]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-2">Your Name</label>
              <div className="w-full h-px bg-[#222] mb-3" />
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  required
                  className="w-full bg-[#0a0a0a] border-2 border-[#1e1e1e] focus:border-[#e8002d] text-white placeholder:text-[#444] rounded-none pl-9 pr-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
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
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-1">Create Account</label>
              <div className="w-full h-px bg-[#222] mb-3" />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] disabled:opacity-50 text-white font-black py-3.5 uppercase tracking-widest text-sm transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full spinner" />
                ) : (
                  <><UserPlus className="w-4 h-4" /> Register</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-1">Have an Account?</label>
            <div className="w-full h-px bg-[#222] mb-3" />
            <Link
              href="/auth/login"
              className="block w-full text-center border-2 border-[#333] hover:border-white text-white font-black py-3 uppercase tracking-widest text-xs transition-all hover:bg-white/5"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
