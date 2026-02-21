"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalWatchlistEntries: number;
  totalWatchProgressEntries: number;
  users: User[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/admin/stats")
        .then((r) => {
          if (r.status === 403) throw new Error("Forbidden");
          if (!r.ok) throw new Error("Failed to fetch");
          return r.json();
        })
        .then(setStats)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-sm tracking-widest animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#e8002d] text-4xl font-black mb-2">403</p>
          <p className="text-white text-sm tracking-widest">ACCESS DENIED</p>
          <p className="text-[#555] text-xs mt-2">Admin access only</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const filtered = stats.users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-black text-xl tracking-tight">
            VIBE<span className="text-[#e8002d]">ANIME</span>
          </span>
          <span className="text-xs border border-[#e8002d] text-[#e8002d] px-2 py-0.5 tracking-widest">
            ADMIN
          </span>
        </div>
        <p className="text-[#555] text-xs tracking-widest">
          Logged in as {session?.user?.email}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="TOTAL USERS" value={stats.totalUsers} />
        <StatCard label="WATCHLIST ENTRIES" value={stats.totalWatchlistEntries} />
        <StatCard label="WATCH PROGRESS ENTRIES" value={stats.totalWatchProgressEntries} />
      </div>

      {/* Users table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold tracking-widest text-[#aaa]">REGISTERED USERS</h2>
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111] border border-[#222] text-white text-xs px-3 py-2 rounded outline-none focus:border-[#e8002d] w-48 md:w-64 transition"
          />
        </div>

        <div className="border border-[#1a1a1a] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0f0f0f] border-b border-[#1a1a1a]">
                <th className="text-left px-4 py-3 text-[#555] text-xs tracking-widest font-normal">
                  #
                </th>
                <th className="text-left px-4 py-3 text-[#555] text-xs tracking-widest font-normal">
                  NAME
                </th>
                <th className="text-left px-4 py-3 text-[#555] text-xs tracking-widest font-normal">
                  EMAIL
                </th>
                <th className="text-left px-4 py-3 text-[#555] text-xs tracking-widest font-normal">
                  JOINED
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-[#444] text-xs">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#111] hover:bg-[#0f0f0f] transition"
                  >
                    <td className="px-4 py-3 text-[#444] text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-[#aaa] text-xs">{user.email}</td>
                    <td className="px-4 py-3 text-[#555] text-xs">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[#333] text-xs mt-2 text-right">
          Showing {filtered.length} of {stats.totalUsers} users
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#1a1a1a] bg-[#0a0a0a] rounded p-5">
      <p className="text-[#555] text-xs tracking-widest mb-2">{label}</p>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  );
}
