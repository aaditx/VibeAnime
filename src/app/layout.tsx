import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://vibeanime.app"),
  title: {
    default: "VibeAnime - Stream Anime Online",
    template: "%s | VibeAnime",
  },
  description:
    "Watch trending and popular anime for free. Discover thousands of anime series and movies on VibeAnime.",
  keywords: ["anime", "streaming", "watch anime", "anime online", "free anime"],
  openGraph: {
    type: "website",
    siteName: "VibeAnime",
    title: "VibeAnime - Stream Anime Online",
    description: "Watch trending and popular anime for free. Discover thousands of anime series and movies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeAnime - Stream Anime Online",
    description: "Watch trending and popular anime for free.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "b2E--9fmmFxSbWCSpuJ5BdCGH4V_0rNjGpKaHhCR2dU",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
