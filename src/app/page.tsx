import { Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import { getTrendingAnime } from "@/lib/anilist";

export const revalidate = 3600;

async function LandingHero() {
  const trending = await getTrendingAnime(1, 15);
  const heroAnimes = trending.media.slice(0, 6).filter((a) => a.bannerImage);
  return (
    <HeroSection animes={heroAnimes.length >= 3 ? heroAnimes : trending.media.slice(0, 6)} />
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Suspense
        fallback={
          <div className="w-full min-h-screen bg-[#0d0d14] animate-pulse" />
        }
      >
        <LandingHero />
      </Suspense>

      <FeaturesSection />
    </div>
  );
}
