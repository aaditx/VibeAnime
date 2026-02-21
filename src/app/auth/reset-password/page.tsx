"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-[#e8002d] font-bold mb-6">Invalid or missing reset link.</p>
        <Link href="/auth/forgot-password" className="text-xs font-black text-white uppercase tracking-widest hover:text-[#e8002d] transition-colors">
          Request a new link →
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/auth/login"), 2500);
  };

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-[#e8002d] mx-auto mb-4" />
        <h2 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Password Updated</h2>
        <div className="w-full h-px bg-[#222] mb-6" />
        <p className="text-sm text-[#888]">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">New Password</h2>
      <div className="w-full h-px bg-[#222] mb-6" />

      {error && (
        <div className="mb-4 p-3 border border-[#e8002d] bg-[#e8002d]/10 text-sm font-bold text-[#e8002d]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-2">New Password</label>
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

        <div>
          <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-2">Confirm Password</label>
          <div className="w-full h-px bg-[#222] mb-3" />
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type={showPass ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              required
              className="w-full bg-[#0a0a0a] border-2 border-[#1e1e1e] focus:border-[#e8002d] text-white placeholder:text-[#444] rounded-none pl-9 pr-4 py-3 text-sm focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-[10px] font-black text-white uppercase tracking-widest mb-1">Update Password</label>
          <div className="w-full h-px bg-[#222] mb-3" />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] disabled:opacity-50 text-white font-black py-3.5 uppercase tracking-widest text-sm transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-0">
            <div className="border-2 border-white px-3 py-1">
              <span className="font-black text-2xl tracking-tight text-white uppercase">Vibe</span>
              <span className="font-black text-2xl tracking-tight text-[#e8002d] uppercase">Anime</span>
            </div>
          </Link>
        </div>

        <div className="border-2 border-[#1e1e1e] bg-[#111] p-8">
          <Suspense fallback={<div className="text-center text-sm text-[#888]">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
