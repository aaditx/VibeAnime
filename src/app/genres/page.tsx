import GenreGrid from "@/components/GenreGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse by Genre - VibeAnime",
  description: "Explore anime by genre — from Action to Romance, find your next favorite.",
};

export default function GenresPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-widest mb-3 font-display">
            Browse by <span className="text-[#e8002d]">Genre</span>
          </h1>
          <p className="text-[#8888aa] text-lg max-w-xl mx-auto">
            Dive into any genre and discover thousands of anime to watch.
          </p>
        </div>

        {/* Full genre grid */}
        <GenreGrid />
      </div>
    </div>
  );
}
