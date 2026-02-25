"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Check } from "lucide-react";
import Image from "next/image";

interface Profile {
    avatarId?: string;
    displayName?: string;
    bio?: string;
    bannerColor?: string;
}

interface Props {
    user: { name: string; email: string };
    profile: Profile;
}

const AVATARS = [
    "avatar-1", "avatar-2", "avatar-3", "avatar-4", "avatar-5",
    "avatar-6", "avatar-7", "avatar-8", "avatar-9", "avatar-10"
];

const COLORS = [
    "#e8002d", // VibeAnime Red
    "#f97316", // Orange
    "#fbbf24", // Yellow
    "#84cc16", // Lime
    "#10b981", // Emerald
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
    "#d946ef", // Fuchsia
    "#1a1a1a", // Dark Grey
];

export default function SettingsClient({ user, profile }: Props) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form state
    const [avatarId, setAvatarId] = useState(profile.avatarId || "");
    const [displayName, setDisplayName] = useState(profile.displayName || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [bannerColor, setBannerColor] = useState(profile.bannerColor || "#e8002d");

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    avatarId: avatarId || undefined,
                    displayName: displayName || undefined,
                    bio: bio || undefined,
                    bannerColor,
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                router.refresh(); // refresh data
            } else {
                alert("Failed to save profile. Please try again.");
            }
        } catch {
            alert("Network error.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link
                            href="/profile"
                            className="inline-flex items-center gap-1.5 text-xs font-black text-[#888] hover:text-[#e8002d] uppercase tracking-widest transition-colors mb-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
                        </Link>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                            Edit Profile
                        </h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 bg-[#e8002d] hover:bg-[#c8001d] disabled:bg-[#333] disabled:text-[#888] text-white font-black text-xs uppercase tracking-widest px-6 py-3 transition-all min-w-[140px]"
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : success ? (
                            <><Check className="w-4 h-4" /> Saved</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Changes</>
                        )}
                    </button>
                </div>

                <div className="space-y-8">

                    {/* ── Avatar Picker ── */}
                    <section className="border border-[#1e1e1e] bg-[#0f0f0f] p-6">
                        <h2 className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-4">Choose Avatar</h2>
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
                            {/* Default option (no avatar) */}
                            <button
                                onClick={() => setAvatarId("")}
                                className={`aspect-square w-full flex items-center justify-center text-xl font-black bg-[#1a1a1a] transition-all ${avatarId === "" ? "border-2 border-[#e8002d] ring-2 ring-[#e8002d]/20" : "border border-[#333] hover:border-[#888]"
                                    }`}
                                title="Use Default Letter"
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </button>

                            {AVATARS.map((id) => {
                                const isSvg = parseInt(id.split("-")[1]) > 5;
                                const ext = isSvg ? "svg" : "png";
                                return (
                                    <button
                                        key={id}
                                        onClick={() => setAvatarId(id)}
                                        className={`relative aspect-square w-full overflow-hidden transition-all ${avatarId === id ? "border-2 border-[#e8002d] ring-2 ring-[#e8002d]/20 scale-105" : "border border-[#333] hover:border-[#888] hover:scale-105"
                                            }`}
                                    >
                                        <Image
                                            src={`/avatars/${id}.${ext}`}
                                            alt={id}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 20vw, 10vw"
                                        />
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-[10px] text-[#555] mt-4 uppercase tracking-wider">
                            Select an anime avatar or stick with your initial.
                        </p>
                    </section>

                    {/* ── Basic Info ── */}
                    <section className="border border-[#1e1e1e] bg-[#0f0f0f] p-6 space-y-5">
                        <h2 className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest">Profile Details</h2>

                        <div>
                            <label className="block text-xs font-bold text-[#888] uppercase tracking-wider mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                maxLength={30}
                                placeholder={user.name}
                                className="w-full bg-[#111] border-2 border-[#222] focus:border-[#e8002d] text-white px-4 py-3 text-sm font-bold transition-colors outline-none"
                            />
                            <p className="text-[10px] text-[#555] mt-1.5 uppercase tracking-wider">
                                This will replace your registered name on your profile. ({displayName.length}/30)
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#888] uppercase tracking-wider mb-2">
                                Bio
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={160}
                                placeholder="List your favorite anime, genres, or anything else..."
                                className="w-full bg-[#111] border-2 border-[#222] focus:border-[#e8002d] text-white px-4 py-3 text-sm resize-none h-24 transition-colors outline-none"
                            />
                            <div className="flex justify-end mt-1">
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${bio.length >= 160 ? "text-[#e8002d]" : "text-[#555]"}`}>
                                    {bio.length}/160
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* ── Theme Color ── */}
                    <section className="border border-[#1e1e1e] bg-[#0f0f0f] p-6">
                        <h2 className="text-[10px] font-black text-[#e8002d] uppercase tracking-widest mb-4">Profile Accent Color</h2>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setBannerColor(c)}
                                    className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${bannerColor === c ? "ring-2 ring-white scale-110" : "hover:scale-110 border-2 border-[#0f0f0f]"
                                        }`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                >
                                    {bannerColor === c && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-[#555] mt-4 uppercase tracking-wider">
                            This color dictates the glowing gradient behind your profile header.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}
