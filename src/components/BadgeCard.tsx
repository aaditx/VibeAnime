"use client";

import { type EarnedBadge } from "@/lib/badges";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
    badge: EarnedBadge;
    size?: "sm" | "md" | "lg";
}

export default function BadgeCard({ badge, size = "md" }: BadgeCardProps) {
    const earned = badge.earnedAt === "earned";

    const sizeConfig = {
        sm: { card: "p-3", icon: "text-2xl", name: "text-[9px]", pts: "text-[8px]" },
        md: { card: "p-4", icon: "text-3xl", name: "text-[10px]", pts: "text-[9px]" },
        lg: { card: "p-5", icon: "text-4xl", name: "text-xs", pts: "text-[10px]" },
    }[size];

    return (
        <div
            className={cn(
                "relative flex flex-col items-center gap-2 border transition-all duration-300 group",
                sizeConfig.card,
                earned
                    ? "border-[#333] hover:border-opacity-80 bg-[#111]"
                    : "border-[#1a1a1a] bg-[#0d0d0d] opacity-50"
            )}
            style={
                earned
                    ? {
                        borderColor: badge.color,
                        boxShadow: `0 0 12px ${badge.color}30, inset 0 0 20px ${badge.color}08`,
                    }
                    : {}
            }
            title={badge.description}
        >
            {/* Glow on hover */}
            {earned && (
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${badge.color}15 0%, transparent 70%)` }}
                />
            )}

            {/* Icon */}
            <div className="relative">
                <span className={cn("block leading-none select-none", sizeConfig.icon)}>
                    {earned ? badge.icon : "🔒"}
                </span>
                {earned && (
                    <div
                        className="absolute inset-0 blur-md opacity-60 -z-10 select-none"
                        aria-hidden
                    >
                        <span className={cn("block leading-none", sizeConfig.icon)}>{badge.icon}</span>
                    </div>
                )}
            </div>

            {/* Name */}
            <p
                className={cn(
                    "font-black uppercase tracking-widest text-center leading-tight",
                    sizeConfig.name,
                    earned ? "text-white" : "text-[#444]"
                )}
            >
                {badge.name}
            </p>

            {/* Threshold hint */}
            <p className={cn("font-bold text-center", sizeConfig.pts, earned ? "text-[#666]" : "text-[#333]")}>
                {earned ? `+${badge.points.toLocaleString()} pts` : `${badge.threshold} anime`}
            </p>

            {/* Earned shimmer border effect */}
            {earned && (
                <div
                    className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${badge.color}, transparent)` }}
                />
            )}
        </div>
    );
}
