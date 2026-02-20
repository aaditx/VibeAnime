export default function AnimeDetailLoading() {
  return (
    <div className="min-h-screen pt-14 animate-pulse">
      {/* Banner skeleton */}
      <div className="relative h-56 sm:h-72 w-full bg-[#111]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-28 relative z-10">
        <div className="flex gap-4 sm:gap-6 mb-8">
          {/* Cover skeleton */}
          <div className="flex-none w-24 sm:w-44 aspect-[2/3] bg-[#1a1a1a]" />

          {/* Info skeleton */}
          <div className="flex-1 pt-12 sm:pt-24 space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-12 bg-[#1a1a1a] rounded" />
              <div className="h-5 w-16 bg-[#1a1a1a] rounded" />
            </div>
            <div className="h-8 bg-[#1a1a1a] rounded w-2/3" />
            <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
            <div className="h-4 bg-[#1a1a1a] rounded w-full" />
            <div className="h-4 bg-[#1a1a1a] rounded w-5/6" />
          </div>
        </div>

        {/* Episodes skeleton */}
        <div className="mt-6 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-[#1a1a1a] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
