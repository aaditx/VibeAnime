import { auth } from "@/auth";
import { updateUserStreak } from "@/lib/userDb";
import { NextResponse } from "next/server";

// POST /api/user/streak — call on each login/page load (idempotent per day)
export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const streak = await updateUserStreak(session.user.id);
    return NextResponse.json(streak);
}
