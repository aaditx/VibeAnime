import { Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import AnimeRow from "@/components/AnimeRow";
import AnimeTicker from "@/components/AnimeTicker";
import GenreGrid from "@/components/GenreGrid";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import RecentlyViewedRow from "@/components/RecentlyViewedRow";
import RowSkeleton from "@/components/RowSkeleton";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopRatedAnime,
  getSeasonalAnime,
} from "@/lib/anilist";
import Link from "next/link";

export const revalidate = 3600; // revalidate every hour

function getCurrentSeason(): { season: string; year: number } {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  let season = "WINTER";
  if (month >= 4 && month <= 6) season = "SPRING";
  else if (month >= 7 && month <= 9) season = "SUMMER";
  else if (month >= 10 && month <= 12) season = "FALL";
  return { season, year };
}

// ─── Async streaming row components ─────────────────────────────────────────

async function HeroAndTicker() {
  const trending = await getTrendingAnime(1, 15);
  const heroAnimes = trending.media.slice(0, 6).filter((a) => a.bannerImage);
  return (
    <>
      <HeroSection animes={heroAnimes.length >= 3 ? heroAnimes : trending.media.slice(0, 6)} />
      <AnimeTicker animes={trending.media} />
    </>
  );
}

async function TrendingRow() {
  const trending = await getTrendingAnime(1, 15);
  return (
    <AnimeRow
      title="Trending Now"
      animes={trending.media}
      viewAllHref="/search?sort=TRENDING_DESC"
    />
  );
}

async function SeasonalRow() {
  const { season, year } = getCurrentSeason();
  const seasonal = await getSeasonalAnime(season, year, 1, 15);
  return (
    <AnimeRow
      title={`${season.charAt(0) + season.slice(1).toLowerCase()} ${year}`}
      animes={seasonal.media}
      viewAllHref={`/search?season=${season}&year=${year}`}
    />
  );
}

async function PopularRow() {
  const popular = await getPopularAnime(1, 15);
  return (
    <AnimeRow
      title="Most Popular"
      animes={popular.media}
      viewAllHref="/search?sort=POPULARITY_DESC"
    />
  );
}

async function TopRatedRow() {
  const topRated = await getTopRatedAnime(1, 15);
  return (
    <AnimeRow
      title="Top Rated"
      animes={topRated.media}
      viewAllHref="/search?sort=SCORE_DESC"
      showRank
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero + Ticker — streams in first */}
      <Suspense
        fallback={
          <div className="w-full h-[60vh] sm:h-[85vh] min-h-[420px] sm:min-h-[560px] max-h-[820px] bg-[#0d0d0d] animate-pulse" />
        }
      >
        <HeroAndTicker />
      </Suspense>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-2">
        {/* Continue Watching — client component, only renders if localStorage has data */}
        <ContinueWatchingRow />

        {/* Recently Viewed — client component */}
        <RecentlyViewedRow />

        {/* Trending — streamed */}
        <Suspense fallback={<RowSkeleton title="Trending Now" />}>
          <TrendingRow />
        </Suspense>

        {/* Browse by Genre */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#e8002d]" />
              <h2 className="text-base font-black text-white uppercase tracking-widest">Browse by Genre</h2>
            </div>
            <Link
              href="/genres"
              className="text-[10px] font-black uppercase tracking-widest text-[#888] hover:text-[#e8002d] border border-[#333] hover:border-[#e8002d] px-3 py-1.5 transition-all"
            >
              All Genres →
            </Link>
          </div>
          <GenreGrid compact />
        </section>

        {/* Seasonal — streamed */}
        <Suspense fallback={<RowSkeleton />}>
          <SeasonalRow />
        </Suspense>

        {/* Popular — streamed */}
        <Suspense fallback={<RowSkeleton title="Most Popular" />}>
          <PopularRow />
        </Suspense>

        {/* Top Rated — streamed */}
        <Suspense fallback={<RowSkeleton title="Top Rated" />}>
          <TopRatedRow />
        </Suspense>
      </div>
    </div>
  );
}

