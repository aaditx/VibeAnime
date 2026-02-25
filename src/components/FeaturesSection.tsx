"use client";

import { Zap, Trophy, Flame, PlayCircle, Star, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FeaturesSection() {
    const features = [
        {
            icon: <PlayCircle className="w-8 h-8 text-[#e8002d]" />,
            title: "Watch & Earn",
            description: "Gain points automatically for every episode you complete. The more you watch, the more you level up your profile.",
        },
        {
            icon: <Trophy className="w-8 h-8 text-[#e8002d]" />,
            title: "Unlock Badges",
            description: "Complete secret milestones and collect exclusive profile badges to show off your dedication to fellow watchers.",
        },
        {
            icon: <Flame className="w-8 h-8 text-[#e8002d]" />,
            title: "Keep the Streak",
            description: "Login daily and keep your watching streak alive. Earn multiplier bonuses on your points the longer you go.",
        },
        {
            icon: <Zap className="w-8 h-8 text-[#e8002d]" />,
            title: "Compete Globally",
            description: "Climb the global leaderboards. See how your anime power level stacks up against other fans worldwide.",
        },
    ];

    return (
        <section className="relative w-full bg-[#0a0a0a] py-24 sm:py-32 overflow-hidden border-t border-white/5">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#e8002d]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#e8002d]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 sm:px-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#e8002d]/10 border border-[#e8002d]/20 mb-2">
                        <Sparkles className="w-4 h-4 text-[#e8002d]" />
                        <span className="text-xs font-bold text-[#e8002d] uppercase tracking-widest">More Than Just Streaming</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-bebas, 'Space Grotesk', sans-serif)" }}>
                        Level Up Your <span className="text-[#e8002d]">Anime Experience</span>
                    </h2>
                    <p className="text-[#888] text-base md:text-lg">
                        VibeAnime isn't just about watching shows. It's a gamified journey. Earn points, unlock exclusive badges, and flex your power level on the global stage.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="relative group bg-[#111] border border-white/5 hover:border-[#e8002d]/50 p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(232,0,45,0.15)] overflow-hidden"
                        >
                            {/* Hover Glow inside card */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#e8002d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex flex-col gap-5">
                                <div className="w-16 h-16 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-[#e8002d]/10 transition-all duration-300">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-[#888] leading-relaxed group-hover:text-[#aaa] transition-colors duration-300">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-20 flex flex-col items-center justify-center gap-6 text-center">
                    <div className="flex -space-x-4 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0a0a0a] overflow-hidden bg-[#222]">
                                <img
                                    src={`/avatars/avatar-${i}.png`}
                                    alt={`Avatar ${i}`}
                                    className="w-full h-full object-cover opacity-80"
                                    onError={(e) => {
                                        // Fallback to svg if png fails (handles avatar-1.svg vs png issue)
                                        (e.target as HTMLImageElement).src = `/avatars/avatar-${i}.svg`;
                                    }}
                                />
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-2 border-[#0a0a0a] bg-[#e8002d] flex items-center justify-center text-white text-xs font-bold z-10 shadow-[0_0_15px_rgba(232,0,45,0.5)]">
                            +10k
                        </div>
                    </div>
                    <p className="text-[#888] font-medium">
                        Join thousands of users already climbing the ranks.
                    </p>
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 bg-white text-[#0a0a0a] hover:bg-[#e8002d] hover:text-white font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(232,0,45,0.4)] hover:scale-105"
                    >
                        Start Your Journey
                        <Zap className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </section>
    );
}
