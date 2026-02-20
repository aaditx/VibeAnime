export default function WatchLoading() {
  return (
    <div className="min-h-screen pt-14 animate-pulse">
      {/* Video player skeleton */}
      <div className="w-full aspect-video bg-[#0d0d0d] max-h-[75vh]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Left: info */}
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-[#1a1a1a] rounded w-2/3" />
          <div className="h-4 bg-[#1a1a1a] rounded w-1/4" />
          <div className="flex gap-3 mt-4">
            <div className="h-9 w-28 bg-[#1a1a1a] rounded" />
            <div className="h-9 w-28 bg-[#1a1a1a] rounded" />
          </div>
        </div>
        {/* Right: episode list skeleton */}
        <div className="hidden lg:block w-72 space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#1a1a1a] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
