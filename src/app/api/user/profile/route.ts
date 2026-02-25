import { auth } from "@/auth";
import { getUserProfile, updateUserProfile } from "@/lib/userDb";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const profile = await getUserProfile(session.user.id);
    return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { avatarId, displayName, bio, bannerColor } = body;

    // Validate avatar ID
    const validAvatarIds = ["avatar-1", "avatar-2", "avatar-3", "avatar-4", "avatar-5",
        "avatar-6", "avatar-7", "avatar-8", "avatar-9", "avatar-10"];
    if (avatarId !== undefined && !validAvatarIds.includes(avatarId)) {
        return NextResponse.json({ error: "Invalid avatarId" }, { status: 400 });
    }
    // Validate bio length
    if (bio !== undefined && bio.length > 160) {
        return NextResponse.json({ error: "Bio too long" }, { status: 400 });
    }
    // Validate display name
    if (displayName !== undefined && displayName.length > 30) {
        return NextResponse.json({ error: "Display name too long" }, { status: 400 });
    }
    // Validate color (must be a hex color or empty)
    if (bannerColor !== undefined && bannerColor !== "" && !/^#[0-9a-fA-F]{6}$/.test(bannerColor)) {
        return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }

    await updateUserProfile(session.user.id, { avatarId, displayName, bio, bannerColor });
    return NextResponse.json({ ok: true });
}
