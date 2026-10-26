// Skeleton that mirrors the real price-list layout (options panel + preview).
const bar = 'animate-pulse rounded bg-gray-200/70';

export default function PriceListLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading price list">
      <div className="space-y-2">
        <div className={`${bar} h-2.5 w-16`} />
        <div className={`${bar} h-8 w-44`} />
        <div className={`${bar} h-3.5 w-full max-w-md`} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-xl border border-gray-200 bg-white">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className="space-y-3 border-b border-gray-100 p-4 last:border-0">
              <div className={`${bar} h-3 w-20`} />
              <div className={`${bar} h-9 w-full`} />
              {s !== 3 && <div className={`${bar} h-9 w-full`} />}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 border-t border-gray-100 p-3">
            <div className={`${bar} h-10`} />
            <div className={`${bar} h-10`} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="h-[3px] rounded-t-xl bg-gray-200" />
          <div className="mx-6 flex items-center gap-3 border-b border-gray-200 py-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200/70" />
            <div className="space-y-1.5">
              <div className={`${bar} h-3.5 w-28`} />
              <div className={`${bar} h-2 w-36`} />
            </div>
          </div>
          <div className="space-y-2 px-6 py-5">
            <div className={`${bar} mb-4 h-6 w-56`} />
            <div className="h-8 animate-pulse rounded-md bg-gray-800/80" />
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className={`${bar} h-7 ${i % 4 === 0 ? 'bg-gray-200' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
