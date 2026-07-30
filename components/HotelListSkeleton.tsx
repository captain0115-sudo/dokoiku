/** 検索結果を待っている間に表示するスケルトンUI(HotelCard/HotelListの構造に合わせた形) */
export default function HotelListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm animate-pulse"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div className="h-4 w-28 bg-line rounded" />
        <div className="h-3 w-20 bg-line rounded" />
      </div>
      <div className="px-3 divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-3 sm:gap-4 items-center py-4 px-2"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-line" />
            <div className="min-w-0 flex flex-col gap-2">
              <div className="h-4 w-3/4 bg-line rounded" />
              <div className="h-3 w-1/2 bg-line rounded" />
            </div>
            <div className="hidden sm:flex flex-col items-end gap-2 pl-4 border-l border-dashed border-line">
              <div className="h-5 w-20 bg-line rounded" />
              <div className="h-3 w-16 bg-line rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
