import { NextRequest, NextResponse } from "next/server";
import { verifyAndConsumeResetToken, updateUserPassword } from "@/lib/userDb";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const email = await verifyAndConsumeResetToken(token);
    if (!email) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    await updateUserPassword(email, password);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
