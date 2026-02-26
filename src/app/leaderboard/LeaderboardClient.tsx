"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Crown, Flame, Tv2, Zap, Trophy } from "lucide-react";
import { type LeaderboardEntry } from "@/lib/userDb";
import { type Badge } from "@/lib/badges";

interface Props {
    entries: LeaderboardEntry[];
    currentUserId: string | null;
    badgeTiers: Badge[];
}

function AvatarDisplay({ avatarId, name, size = 40 }: { avatarId?: string; name: string; size?: number }) {
    const isSvg = avatarId && parseInt(avatarId.split("-")[1]) > 5;
    const ext = isSvg ? "svg" : "png";
    return (
        <div
            className="rounded-full overflow-hidden border-2 border-[#1e1e1e] flex-none flex items-center justify-center bg-[#111] font-black text-white"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {avatarId ? (
                <Image src={`/avatars/${avatarId}.${ext}`} alt={name} width={size} height={size} className="object-cover w-full h-full" />
            ) : (
                name.charAt(0).toUpperCase()
            )}
        </div>
    );
}

const RANK_COLORS: Record<number, string> = {
    1: "text-[#fbbf24]",   // gold
    2: "text-[#94a3b8]",   // silver
    3: "text-[#cd7f32]",   // bronze
};

export default function LeaderboardClient({ entries, currentUserId, badgeTiers }: Props) {
    const { data: session } = useSession();

    const badgeMap = new Map(badgeTiers.map((b) => [b.id, b]));

    return (
        <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="mb-10 text-center">
                    <p className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-2">Global</p>
                    <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                        Leaderboard
                    </h1>
                    <p className="text-sm text-[#555] mt-3 max-w-sm mx-auto">
                        The top anime watchers on VibeAnime, ranked by total points.
                    </p>
                </div>

                {/* Top 3 podium */}
                {entries.length >= 3 && (
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
                            const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
                            const heights = ["h-24", "h-32", "h-20"];
                            const badge = entry.highestBadgeId ? badgeMap.get(entry.highestBadgeId) : null;
                            const isMe = entry.userId === currentUserId;
                            return (
                                <div key={entry.userId} className={`flex flex-col items-center gap-2 ${podiumIdx === 1 ? "order-2" : podiumIdx === 0 ? "order-1" : "order-3"}`}>
                                    {rank === 1 && <Crown className="w-6 h-6 text-[#fbbf24]" />}
                                    <AvatarDisplay avatarId={entry.avatarId} name={entry.name} size={podiumIdx === 1 ? 64 : 48} />
                                    <p className="text-xs font-black text-white uppercase tracking-wide text-center truncate max-w-[80px]">
                                        {entry.displayName || entry.name}
                                    </p>
                                    {badge && <span className="text-base">{badge.icon}</span>}
                                    <div
                                        className={`w-full ${heights[podiumIdx]} flex flex-col items-center justify-center gap-1 border ${rank === 1 ? "border-[#fbbf24]/40 bg-[#fbbf24]/5" : "border-[#1e1e1e] bg-[#0f0f0f]"
                                            } ${isMe ? "ring-2 ring-[#e8002d]" : ""}`}
                                    >
                                        <span className={`text-xl font-black ${RANK_COLORS[rank] ?? "text-white"}`}>#{rank}</span>
                                        <span className="text-xs font-bold text-[#888]">{entry.totalPoints.toLocaleString()} pts</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Full table */}
                <div className="border border-[#1e1e1e] bg-[#0f0f0f] overflow-hidden">
                    <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 sm:gap-x-4 px-3 sm:px-4 py-2 border-b border-[#1a1a1a] text-[9px] font-black text-[#555] uppercase tracking-widest">
                        <span>#</span>
                        <span>Player</span>
                        <span className="text-right">Anime</span>
                        <span className="hidden sm:block text-right">Streak</span>
                        <span className="text-right">Points</span>
                    </div>

                    {entries.length === 0 && (
                        <div className="py-16 text-center text-[#444] text-xs uppercase tracking-widest font-bold">
                            No players have points yet — go watch some anime!
                        </div>
                    )}

                    {entries.map((entry) => {
                        const badge = entry.highestBadgeId ? badgeMap.get(entry.highestBadgeId) : null;
                        const isMe = entry.userId === currentUserId;
                        const rankColor = RANK_COLORS[entry.rank] ?? "text-[#555]";
                        return (
                            <div
                                key={entry.userId}
                                className={`grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 sm:gap-x-4 items-center px-3 sm:px-4 py-3 border-b border-[#111] hover:bg-white/[0.02] transition-colors ${isMe ? "bg-[#e8002d]/5 border-l-2 border-l-[#e8002d]" : ""
                                    }`}
                            >
                                {/* Rank */}
                                <span className={`text-sm font-black w-7 ${rankColor}`}>#{entry.rank}</span>

                                {/* Player */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <AvatarDisplay avatarId={entry.avatarId} name={entry.name} size={32} />
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-white uppercase tracking-wide truncate">
                                            {entry.displayName || entry.name}
                                            {isMe && <span className="ml-2 text-[#e8002d] text-[9px]">YOU</span>}
                                        </p>
                                        {badge && (
                                            <p className="text-[9px] text-[#555] uppercase tracking-wider">
                                                {badge.icon} {badge.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Anime count */}
                                <div className="flex items-center gap-1 text-xs font-bold text-[#888] justify-end">
                                    <Tv2 className="w-3 h-3 text-[#555]" />
                                    {entry.uniqueAnimeWatched}
                                </div>

                                {/* Streak */}
                                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#888] justify-end">
                                    <Flame className="w-3 h-3 text-[#555]" />
                                    {entry.loginStreak}d
                                </div>

                                {/* Points */}
                                <div className="flex items-center gap-1 text-xs font-black text-white justify-end">
                                    <Zap className="w-3 h-3 text-[#e8002d]" />
                                    {entry.totalPoints.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!session && (
                    <div className="mt-8 border border-[#e8002d]/20 bg-[#e8002d]/5 p-6 text-center">
                        <Trophy className="w-8 h-8 text-[#e8002d] mx-auto mb-3" />
                        <p className="text-sm font-bold text-white mb-1">Want to appear on the leaderboard?</p>
                        <p className="text-xs text-[#555] mb-4">Create an account and start watching anime to earn points!</p>
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] text-white font-black text-xs uppercase tracking-widest px-6 py-2.5 transition-all"
                        >
                            Join VibeAnime
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
