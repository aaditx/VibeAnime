"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setSent(true);
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
          {sent ? (
            /* Success state */
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-[#e8002d] mx-auto mb-4" />
              <h2 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Check Your Email</h2>
              <div className="w-full h-px bg-[#222] mb-6" />
              <p className="text-sm text-[#888] mb-6 leading-relaxed">
                If <span className="text-white font-bold">{email}</span> is registered, you&apos;ll receive a reset link shortly. Check your spam folder too.
              </p>
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 w-full border-2 border-[#333] hover:border-white text-white font-black py-3 uppercase tracking-widest text-xs transition-all hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <h2 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Reset Password</h2>
              <div className="w-full h-px bg-[#222] mb-6" />

              <p className="text-xs text-[#888] mb-6 leading-relaxed">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

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

                <div className="pt-2">
                  <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-1">Send Link</label>
                  <div className="w-full h-px bg-[#222] mb-3" />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] disabled:opacity-50 text-white font-black py-3.5 uppercase tracking-widest text-sm transition-colors"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="w-full h-px bg-[#222] mb-3" />
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full text-xs font-black text-[#888] hover:text-white uppercase tracking-widest transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
