import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses with gzip/brotli
  compress: true,

  // Keep ESM-only / native packages as server-side externals
  serverExternalPackages: ["graphql-request", "mongodb", "aniwatch"],

  images: {
    unoptimized: true, // Disables Vercel Image Optimization to save free-tier quotas (Transformations & Origin Transfer)
    // Serve modern formats (AVIF first, then WebP)
    formats: ["image/avif", "image/webp"],
    // Cache aggressively — anime cover art rarely changes
    minimumCacheTTL: 86400, // 24 hours
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "img.anili.st" },
      { protocol: "https", hostname: "media.kitsu.io" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "gogocdn.net" },
      { protocol: "https", hostname: "cdn.noitatnemucod.net" },
    ],
    // Sizes matched to AnimeCard widths (sm: 144px, md: 176px, lg: 240px)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 144, 176, 256],
  },

  // Reduce source map size in dev for faster HMR
  productionBrowserSourceMaps: false,

  // Soft reverse proxy for Megaplay iframes to bypass Cross-Origin blocks
  async rewrites() {
    return [
      {
        source: "/embed-proxy/:path*",
        destination: "https://megaplay.buzz/:path*",
      },
    ];
  },

  // Allow the download site to call our streaming API cross-origin
  async headers() {
    return [
      {
        source: "/api/streaming/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;

