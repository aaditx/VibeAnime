/**
 * Skeleton placeholder for an AnimeRow while data streams in.
 */
export default function RowSkeleton({ title }: { title?: string }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-[#e8002d]" />
        <div
          className={
            title
              ? "text-base font-black text-white uppercase tracking-widest"
              : "h-4 w-40 bg-[#1a1a1a] animate-pulse rounded"
          }
        >
          {title ?? ""}
        </div>
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-none w-36 sm:w-44">
            <div className="aspect-[2/3] bg-[#1a1a1a] animate-pulse" />
            <div className="mt-2 h-3 bg-[#1a1a1a] animate-pulse rounded w-3/4" />
            <div className="mt-1 h-2 bg-[#1a1a1a] animate-pulse rounded w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}
