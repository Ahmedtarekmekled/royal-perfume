// Mirrors the catalog editor layout (step nav + section cards) while it loads.
const card = 'rounded-2xl border border-gray-200/80 bg-white';
const bar = 'animate-pulse rounded-md bg-gray-200/70';

export default function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-busy="true" aria-label="Loading catalog">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className={`${bar} h-2.5 w-16`} />
          <div className={`${bar} h-8 w-36`} />
          <div className={`${bar} h-3.5 w-72 max-w-full`} />
        </div>
        <div className="h-8 w-52 animate-pulse rounded-full bg-gray-200/70" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <div className="hidden space-y-3 lg:block">
          <div className={`${card} space-y-1 p-2`}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200/70" />
                <div className={`${bar} h-3 flex-1`} style={{ maxWidth: `${60 + ((i * 17) % 35)}%` }} />
              </div>
            ))}
          </div>
          <div className={`${card} space-y-2.5 p-4`}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className={`${bar} h-2.5 w-16`} />
                <div className={`${bar} h-2.5 w-10`} />
              </div>
            ))}
            <div className="!mt-4 h-11 w-full animate-pulse rounded-full bg-gray-300/70" />
          </div>
        </div>

        <div className="space-y-4">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`${card} p-5 sm:p-6`}>
              <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="h-7 w-7 animate-pulse rounded-full bg-gray-300/70" />
                <div className="space-y-1.5">
                  <div className={`${bar} h-4 w-40`} />
                  <div className={`${bar} h-2.5 w-56 max-w-full`} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <div className={`${bar} h-3 w-24`} />
                    <div className={`${bar} ${s === 0 && i < 2 ? 'h-24' : 'h-10'} w-full`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
