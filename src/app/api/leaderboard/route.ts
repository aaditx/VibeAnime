import { getLeaderboard } from "@/lib/userDb";
import { NextResponse } from "next/server";

// 5-minute cache so the public leaderboard doesn't hammer MongoDB
export const revalidate = 300;

export async function GET() {
    try {
        const entries = await getLeaderboard(50);
        return NextResponse.json(entries);
    } catch (err) {
        console.error("[leaderboard]", err);
        return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
    }
}
