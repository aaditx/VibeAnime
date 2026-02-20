import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Red top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "#e8002d" }} />
        {/* Red bottom bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "#e8002d" }} />

        {/* Background grid lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(90deg, #1a1a1a 0, #1a1a1a 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, #1a1a1a 0, #1a1a1a 1px, transparent 1px, transparent 80px)",
          opacity: 0.4,
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{
            border: "4px solid white",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
          }}>
            <span style={{ color: "white", fontSize: 80, fontWeight: 900, letterSpacing: "-2px", textTransform: "uppercase" }}>
              Vibe
            </span>
            <span style={{ color: "#e8002d", fontSize: 80, fontWeight: 900, letterSpacing: "-2px", textTransform: "uppercase" }}>
              Anime
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p style={{ color: "#555", fontSize: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: "8px", margin: 0 }}>
          Stream · Discover · Track
        </p>
      </div>
    ),
    { ...size }
  );
}
