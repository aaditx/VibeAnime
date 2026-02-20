import HeroSection from "@/components/HeroSection";
import AnimeRow from "@/components/AnimeRow";
import AnimeTicker from "@/components/AnimeTicker";
import GenreGrid from "@/components/GenreGrid";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import RecentlyViewedRow from "@/components/RecentlyViewedRow";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopRatedAnime,
  getSeasonalAnime,
} from "@/lib/anilist";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

export default async function HomePage() {
  const { season, year } = getCurrentSeason();

  const [trending, popular, topRated, seasonal] = await Promise.all([
    getTrendingAnime(1, 15),
    getPopularAnime(1, 15),
    getTopRatedAnime(1, 15),
    getSeasonalAnime(season, year, 1, 15),
  ]);

  const heroAnimes = trending.media.slice(0, 6).filter((a) => a.bannerImage);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection animes={heroAnimes.length >= 3 ? heroAnimes : trending.media.slice(0, 6)} />

      {/* Trending ticker */}
      <AnimeTicker animes={trending.media} />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-2">
        {/* Continue Watching — client component, only renders if localStorage has data */}
        <ContinueWatchingRow />

        {/* Recently Viewed — client component */}
        <RecentlyViewedRow />

        <AnimeRow
          title="Trending Now"
          animes={trending.media}
          viewAllHref="/search?sort=TRENDING_DESC"
        />

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

        <AnimeRow
          title={`${season.charAt(0) + season.slice(1).toLowerCase()} ${year}`}
          animes={seasonal.media}
          viewAllHref={`/search?season=${season}&year=${year}`}
        />
        <AnimeRow
          title="Most Popular"
          animes={popular.media}
          viewAllHref="/search?sort=POPULARITY_DESC"
        />
        <AnimeRow
          title="Top Rated"
          animes={topRated.media}
          viewAllHref="/search?sort=SCORE_DESC"
          showRank
        />
      </div>
    </div>
  );
}
