import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/userDb";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://vibe-anime.vercel.app";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const token = await createPasswordResetToken(email);

    // Always return success to avoid revealing if email exists
    if (!token) {
      return NextResponse.json({ success: true });
    }

    const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;

    await resend.emails.send({
      from: "VibeAnime <onboarding@resend.dev>",
      to: email,
      subject: "Reset your VibeAnime password",
      html: `
        <div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:40px;max-width:480px;margin:0 auto;">
          <div style="border:2px solid #fff;padding:8px 16px;display:inline-block;margin-bottom:24px;">
            <span style="font-weight:900;font-size:20px;letter-spacing:-1px;">VIBE</span><span style="font-weight:900;font-size:20px;color:#e8002d;letter-spacing:-1px;">ANIME</span>
          </div>
          <h2 style="margin:0 0 8px;font-size:14px;letter-spacing:4px;text-transform:uppercase;">Password Reset</h2>
          <div style="width:100%;height:1px;background:#222;margin-bottom:24px;"></div>
          <p style="color:#aaa;font-size:14px;line-height:1.6;">
            Someone requested a password reset for your account. Click the button below to set a new password. This link expires in <strong style="color:#fff;">1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;margin:24px 0;background:#e8002d;color:#fff;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;">
            RESET PASSWORD
          </a>
          <p style="color:#555;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
          <div style="margin-top:32px;padding-top:16px;border-top:1px solid #222;color:#444;font-size:11px;">
            © 2026 VibeAnime — For educational purposes only
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
