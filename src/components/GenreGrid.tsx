import Link from "next/link";

const GENRES_WITH_EMOJI: { name: string; emoji: string }[] = [
  { name: "Action", emoji: "⚔️" },
  { name: "Adventure", emoji: "🗺️" },
  { name: "Comedy", emoji: "😂" },
  { name: "Drama", emoji: "🎭" },
  { name: "Fantasy", emoji: "🧙" },
  { name: "Horror", emoji: "👻" },
  { name: "Mecha", emoji: "🤖" },
  { name: "Music", emoji: "🎵" },
  { name: "Mystery", emoji: "🔍" },
  { name: "Psychological", emoji: "🧠" },
  { name: "Romance", emoji: "💕" },
  { name: "Sci-Fi", emoji: "🚀" },
  { name: "Slice of Life", emoji: "🌸" },
  { name: "Sports", emoji: "⚽" },
  { name: "Supernatural", emoji: "✨" },
  { name: "Thriller", emoji: "😰" },
];

interface GenreGridProps {
  compact?: boolean;
}

export default function GenreGrid({ compact = false }: GenreGridProps) {
  const genres = compact ? GENRES_WITH_EMOJI.slice(0, 8) : GENRES_WITH_EMOJI;

  return (
    <div
      className={`grid gap-2 ${compact
          ? "grid-cols-4 sm:grid-cols-8"
          : "grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8"
        }`}
    >
      {genres.map(({ name, emoji }) => (
        <Link
          key={name}
          href={`/search?genre=${encodeURIComponent(name)}`}
          className="group relative bg-[#111] border border-[#1e1e1e] hover:border-[#e8002d] hover:bg-[#e8002d]/5 aspect-square flex flex-col items-center justify-center gap-1.5 transition-all duration-200 overflow-hidden"
        >
          {/* Red left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e8002d] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200" />
          {/* Red glow on hover */}
          <div className="absolute inset-0 bg-[#e8002d]/0 group-hover:bg-[#e8002d]/5 transition-colors duration-200" />
          <span className="text-xl sm:text-2xl select-none">{emoji}</span>
          <span className="text-[9px] sm:text-[10px] font-black text-[#555] group-hover:text-white uppercase tracking-widest text-center px-1 leading-tight transition-colors duration-200">
            {name}
          </span>
        </Link>
      ))}
    </div>
  );
}
