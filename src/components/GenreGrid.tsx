import Link from "next/link";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mecha", "Music", "Mystery", "Psychological",
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

interface GenreGridProps {
  compact?: boolean;
}

export default function GenreGrid({ compact = false }: GenreGridProps) {
  const genres = compact ? GENRES.slice(0, 8) : GENRES;

  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-8" : "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"}`}>
      {genres.map((genre) => (
        <Link
          key={genre}
          href={`/search?genre=${encodeURIComponent(genre)}`}
          className="group relative bg-[#111] border border-[#1e1e1e] hover:border-[#e8002d] aspect-[3/2] flex items-center justify-center transition-all duration-200 hover:bg-[#e8002d]/5 overflow-hidden"
        >
          {/* Left accent bar on hover */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e8002d] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200" />
          <span className="text-[10px] sm:text-xs font-black text-[#555] group-hover:text-white uppercase tracking-widest text-center px-2 transition-colors duration-200">
            {genre}
          </span>
        </Link>
      ))}
    </div>
  );
}
