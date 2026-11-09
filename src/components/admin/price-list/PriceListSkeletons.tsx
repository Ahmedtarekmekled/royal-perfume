// Loading skeletons for the price-list pages. Each mirrors its real layout
// (same grid, card and document proportions) so nothing jumps on load.
const bar = 'animate-pulse rounded bg-gray-200/70';

function HeaderSkeleton({ back = false, actions = 1 }: { back?: boolean; actions?: number }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <div className={`${bar} h-2.5 ${back ? 'w-24' : 'w-16'}`} />
        <div className={`${bar} h-8 w-52`} />
        <div className={`${bar} h-3.5 w-72 max-w-full`} />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: actions }, (_, i) => (
          <div key={i} className={`h-10 animate-pulse rounded-md ${i === actions - 1 ? 'w-40 bg-gray-800/80' : 'w-24 bg-gray-200/70'}`} />
        ))}
      </div>
    </div>
  );
}

/** The document preview (letterhead, title, table). */
export function DocumentSkeleton({ rows = 14 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="h-[3px] bg-red-900/30" />
      <div className="mx-3 flex items-center gap-3 border-b border-gray-200 py-4 sm:mx-6">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300/80" />
        <div className="space-y-1.5">
          <div className={`${bar} h-3.5 w-28`} />
          <div className={`${bar} h-2 w-36`} />
        </div>
        <div className={`${bar} ml-auto hidden h-2.5 w-32 sm:block`} />
      </div>
      <div className="space-y-1.5 px-3 py-5 sm:px-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div className={`${bar} h-6 w-56`} />
          <div className={`${bar} h-2.5 w-20`} />
        </div>
        <div className="h-8 animate-pulse rounded-md bg-gray-800/80" />
        {Array.from({ length: rows }, (_, i) =>
          i % 5 === 0 ? (
            <div key={i} className="flex h-7 items-center justify-between rounded-sm bg-gray-100 px-3 shadow-[inset_2px_0_0_#d1d5db]">
              <div className={`${bar} h-3 w-24 bg-gray-300/70`} />
              <div className={`${bar} h-2 w-10`} />
            </div>
          ) : (
            <div key={i} className="flex h-7 items-center gap-4 px-3" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`${bar} h-2.5`} style={{ width: `${38 + ((i * 17) % 30)}%` }} />
              <div className={`${bar} ml-auto h-2.5 w-14`} />
              <div className={`${bar} h-2.5 w-12`} />
            </div>
          )
        )}
      </div>
    </div>
  );
}

/** /admin/price-list — saved lists grid. */
export function LibrarySkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading price lists">
      <HeaderSkeleton />
      <div className={`${bar} h-2.5 w-24`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white" style={{ animationDelay: `${i * 120}ms` }}>
            <div className="h-[3px] bg-red-900/30" />
            <div className="border-b border-gray-100 bg-gray-50/60 px-5 pb-4 pt-5">
              <div className="space-y-1.5 rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-gray-300/80" />
                  <div className={`${bar} h-1.5 w-16`} />
                </div>
                <div className="h-2 animate-pulse rounded-sm bg-gray-700/70" />
                {[0, 1, 2, 3].map((r) => (
                  <div key={r} className="flex gap-2">
                    <div className={`${bar} h-1.5 ${r % 2 ? 'w-2/5' : 'w-1/2'}`} />
                    <div className={`${bar} ml-auto h-1.5 w-8`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div className={`${bar} h-5 w-3/5`} />
              <div className={`${bar} h-3 w-4/5`} />
              <div className="flex gap-1.5">
                {[14, 20, 16].map((w) => (
                  <div key={w} className="h-5 animate-pulse rounded-full bg-gray-100" style={{ width: `${w * 4}px` }} />
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className={`${bar} h-2.5 w-24`} />
                <div className="flex gap-1">
                  <div className={`${bar} h-8 w-14`} />
                  <div className={`${bar} h-8 w-16`} />
                  <div className={`${bar} h-8 w-8`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** /admin/price-list/[id] — one saved list. */
export function ViewerSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading price list">
      <HeaderSkeleton back actions={4} />
      <DocumentSkeleton rows={18} />
    </div>
  );
}

/** /admin/price-list/new — options panel + live preview. */
export function BuilderSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading price list builder">
      <HeaderSkeleton back actions={2} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {[3, 2, 4, 1].map((fields, s) => (
            <div key={s} className="space-y-3 border-b border-gray-100 p-4 last:border-0">
              <div className="flex items-center justify-between">
                <div className={`${bar} h-3 w-20`} />
                <div className="h-6 w-6 animate-pulse rounded-full border border-gray-200 bg-gray-100" />
              </div>
              {s === 1 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className={`${bar} h-9`} />
                  ))}
                </div>
              ) : (
                Array.from({ length: fields }, (_, i) => <div key={i} className={`${bar} h-9 w-full`} />)
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 border-t border-gray-100 bg-gray-50/60 p-3">
            <div className="h-10 animate-pulse rounded-md bg-gray-800/80" />
            <div className={`${bar} h-10`} />
          </div>
        </div>
        <DocumentSkeleton />
      </div>
    </div>
  );
}
