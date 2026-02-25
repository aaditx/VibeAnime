"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import BadgeCard from "@/components/BadgeCard";
import { type BadgeComputeResult } from "@/lib/badges";
import { type UserProfile } from "@/lib/userDb";
import { LogOut, Tv2, Film, Zap, Trophy, ChevronRight, Edit3 } from "lucide-react";
import Image from "next/image";

interface Props {
    user: { name: string; email: string };
    stats: BadgeComputeResult;
    totalTiers: number;
    profile?: UserProfile;
}

export default function ProfileClient({ user, stats, totalTiers, profile = {} }: Props) {
    const { points, uniqueAnimeWatched, totalEpisodesWatched, allBadges, earnedBadges, nextBadge, highestBadge } = stats;
    const { avatarId, displayName, bio, bannerColor = "#e8002d" } = profile;

    const progressPct = nextBadge
        ? Math.min(100, (uniqueAnimeWatched / nextBadge.threshold) * 100)
        : 100;

    const initial = (displayName || user.name).charAt(0).toUpperCase();

    return (
        <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* ── Hero ── */}
                <div
                    className="relative border-2 bg-[#0f0f0f] p-6 sm:p-8 mb-8 overflow-hidden transition-colors"
                    style={{ borderColor: bannerColor }}
                >
                    {/* Custom color glow bg */}
                    <div
                        className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl pointer-events-none"
                        style={{ backgroundColor: bannerColor }}
                    />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                        {/* Avatar */}
                        <div className="relative flex-none">
                            <div
                                className="w-20 h-20 border-2 bg-[#1a0a0a] flex items-center justify-center text-3xl font-black text-white relative overflow-hidden"
                                style={{ borderColor: bannerColor }}
                            >
                                {avatarId ? (
                                    <Image
                                        src={`/avatars/${avatarId}.${parseInt(avatarId.split("-")[1]) > 5 ? 'svg' : 'png'}`}
                                        alt="Avatar"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    initial
                                )}
                            </div>
                            {highestBadge && (
                                <div className="absolute -bottom-2 -right-2 text-xl" title={highestBadge.name}>
                                    {highestBadge.icon}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <p
                                    className="text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: bannerColor }}
                                >
                                    Anime Profile
                                </p>
                                <Link
                                    href="/profile/settings"
                                    className="flex items-center gap-1 text-[9px] font-black text-[#888] hover:text-white uppercase tracking-widest transition-colors border border-[#333] hover:border-[#888] px-2 py-0.5"
                                >
                                    <Edit3 className="w-3 h-3" /> Edit Profile
                                </Link>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight truncate">
                                {displayName || user.name}
                            </h1>
                            {bio ? (
                                <p className="text-xs text-[#888] mt-1 line-clamp-2 max-w-md leading-relaxed">{bio}</p>
                            ) : (
                                <p className="text-xs text-[#555] mt-0.5">{user.email}</p>
                            )}
                            {highestBadge && (
                                <p className="mt-2 text-xs font-bold text-[#888] uppercase tracking-widest">
                                    {highestBadge.icon} {highestBadge.name}
                                </p>
                            )}
                        </div>

                        {/* Points */}
                        <div className="flex-none text-right">
                            <p className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest">Total Points</p>
                            <p className="text-4xl sm:text-5xl font-black text-white tabular-nums">
                                {points.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-[#555] uppercase tracking-widest mt-1">pts</p>
                        </div>
                    </div>

                    {/* Progress to next badge */}
                    <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                        {nextBadge ? (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black text-[#666] uppercase tracking-widest">
                                        Progress to {nextBadge.icon} {nextBadge.name}
                                    </p>
                                    <p className="text-[10px] font-black text-[#e8002d] uppercase">
                                        {uniqueAnimeWatched} / {nextBadge.threshold} anime
                                    </p>
                                </div>
                                <div className="h-1.5 bg-[#1a1a1a] w-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#e8002d] transition-all duration-700"
                                        style={{
                                            width: `${progressPct}%`,
                                            boxShadow: "0 0 8px rgba(232,0,45,0.6)",
                                        }}
                                    />
                                </div>
                                <p className="mt-2 text-[10px] text-[#444] uppercase">
                                    {nextBadge.threshold - uniqueAnimeWatched} more unique anime needed
                                </p>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-[#fcd34d]">
                                <Trophy className="w-4 h-4" />
                                <p className="text-xs font-black uppercase tracking-widest">You&apos;ve reached the highest tier — Anime God!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: "Anime Watched", value: uniqueAnimeWatched, icon: <Tv2 className="w-4 h-4" />, note: "unique titles" },
                        { label: "Episodes Tracked", value: totalEpisodesWatched, icon: <Film className="w-4 h-4" />, note: "across all anime" },
                        { label: "Badges Earned", value: `${earnedBadges.length}/${totalTiers}`, icon: <Zap className="w-4 h-4" />, note: "tiers unlocked" },
                    ].map((stat) => (
                        <div key={stat.label} className="border border-[#1e1e1e] bg-[#0f0f0f] p-4 text-center">
                            <div className="flex justify-center mb-2" style={{ color: bannerColor }}>{stat.icon}</div>
                            <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{stat.value}</p>
                            <p
                                className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1"
                                style={{ color: bannerColor }}
                            >
                                {stat.label}
                            </p>
                            <p className="text-[8px] text-[#444] uppercase mt-0.5">{stat.note}</p>
                        </div>
                    ))}
                </div>

                {/* ── Badge Collection ── */}
                <div className="border border-[#1e1e1e] bg-[#0f0f0f] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest">Badge Collection</p>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                {earnedBadges.length} of {totalTiers} Unlocked
                            </h2>
                        </div>
                        {uniqueAnimeWatched === 0 && (
                            <Link
                                href="/search?sort=TRENDING_DESC"
                                className="flex items-center gap-1.5 text-xs font-black text-[#e8002d] hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Start watching <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {allBadges.map((badge) => (
                            <BadgeCard key={badge.id} badge={badge} size="md" />
                        ))}
                    </div>
                </div>

                {/* ── Points Breakdown ── */}
                <div className="mt-4 border border-[#1e1e1e] bg-[#0f0f0f] p-6">
                    <p className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-4">Points Breakdown</p>
                    <div className="space-y-2 text-xs font-mono">
                        {earnedBadges.map((b) => (
                            <div key={b.id} className="flex items-center justify-between border-b border-[#111] pb-2">
                                <span className="text-[#888]">{b.icon} {b.name} milestone</span>
                                <span className="text-white font-black">+{b.points.toLocaleString()} pts</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between border-b border-[#111] pb-2">
                            <span className="text-[#888]">📺 Unique anime bonus (×10 pts each)</span>
                            <span className="text-white font-black">+{(uniqueAnimeWatched * 10).toLocaleString()} pts</span>
                        </div>
                        <div className="flex items-center justify-between pb-2">
                            <span className="text-[#888]">🎞 Episode bonus (×2 pts each)</span>
                            <span className="text-white font-black">+{(totalEpisodesWatched * 2).toLocaleString()} pts</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t-2 border-[#e8002d]">
                            <span className="text-white font-black uppercase tracking-widest">Total</span>
                            <span className="text-[#e8002d] font-black text-base">{points.toLocaleString()} pts</span>
                        </div>
                    </div>
                </div>

                {/* ── Actions ── */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/search?sort=TRENDING_DESC"
                        className="flex items-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] text-white font-black text-xs uppercase tracking-widest px-5 py-3 transition-all"
                    >
                        <Tv2 className="w-3.5 h-3.5" />
                        Watch More Anime
                    </Link>
                    <Link
                        href="/watchlist"
                        className="flex items-center gap-2 border border-[#333] hover:border-[#e8002d] text-[#888] hover:text-white font-black text-xs uppercase tracking-widest px-5 py-3 transition-all"
                    >
                        My Watchlist
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 border border-[#333] hover:border-[#e8002d] text-[#888] hover:text-white font-black text-xs uppercase tracking-widest px-5 py-3 transition-all ml-auto"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>

            </div>
        </main>
    );
}
