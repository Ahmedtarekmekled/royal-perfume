import { PRICE_LIST_COLUMNS, cellText, type PriceGroup, type PriceListColumnId, type PriceListConfig } from '@/lib/price-list/config';
import { isSupabaseStorageUrl, toProxiedObjectUrl } from '@/lib/images';

/**
 * The on-screen price list, styled to mirror the PDF. Shared by the builder
 * (live preview, capped at `limit` rows) and the saved-list viewer (all rows).
 * Never shows the price adjustment — only the resulting prices.
 */
export default function PriceListPreview({
  config,
  groups,
  rowCount,
  limit,
  className = '',
}: {
  config: PriceListConfig;
  groups: PriceGroup[];
  rowCount: number;
  limit?: number;
  className?: string;
}) {
  const columns = PRICE_LIST_COLUMNS.filter((c) => config.columns.includes(c.id));

  // First `limit` rows, keeping group bands (with their full counts).
  const shown: (PriceGroup & { total: number })[] = [];
  for (let i = 0, remaining = limit ?? Infinity; i < groups.length && remaining > 0; i++) {
    const g = groups[i];
    const rows = g.rows.slice(0, remaining);
    remaining -= rows.length;
    if (rows.length) shown.push({ ...g, total: g.rows.length, rows });
  }

  return (
    <section className={`min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      <div className="h-[3px] bg-red-900" />
      <div className="mx-3 flex items-center justify-between gap-4 border-b border-gray-900 py-3 sm:mx-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black font-playfair text-sm font-bold text-white">R</div>
          <div className="min-w-0">
            <p className="font-playfair text-base font-bold leading-none">Royal Perfumes</p>
            <p className="mt-1 text-[9px] tracking-[0.2em] text-gray-500">PREMIUM QUALITY WHOLESALE</p>
          </div>
        </div>
        <p className="hidden truncate text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:block">{config.title}</p>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2 px-3 pb-3 pt-3 sm:px-6 sm:pt-4">
        <h2 className="break-words font-playfair text-lg sm:text-xl md:text-2xl">{config.title}</h2>
        <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">{rowCount.toLocaleString()} products</p>
      </div>
      {config.note && <p className="px-4 pb-3 text-sm text-gray-600 sm:px-6">{config.note}</p>}

      {rowCount === 0 ? (
        <div className="px-6 py-20 text-center text-sm text-gray-500">No products match these filters.</div>
      ) : (
        <div className="px-3 pb-4 sm:px-6 sm:pb-6">
          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full border-separate border-spacing-0 text-[10.5px] leading-snug sm:min-w-[520px] sm:text-[13px]">
              <thead className="lg:sticky lg:top-0 lg:z-10">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.id}
                      className={`whitespace-nowrap bg-black px-1.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-white first:rounded-l-md last:rounded-r-md sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.14em] ${alignClass(c.align)}`}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((g, gi) => (
                  <PreviewGroup key={g.title ?? gi} title={g.title} total={g.total} span={columns.length}>
                    {g.rows.map((r, i) => (
                      <tr key={r.productId} className={i % 2 ? 'bg-gray-50/70' : ''}>
                        {columns.map((c) => (
                          <td
                            key={c.id}
                            className={`border-b border-gray-100 px-1.5 py-1 align-middle sm:px-3 sm:py-1.5 ${alignClass(c.align)} ${cellClass(c.id, r.inStock)}`}
                          >
                            {c.id === 'image' ? (
                              r.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={isSupabaseStorageUrl(r.image) ? toProxiedObjectUrl(r.image) : r.image}
                                  alt=""
                                  loading="lazy"
                                  className="mx-auto h-6 w-6 object-contain sm:h-8 sm:w-8"
                                />
                              ) : (
                                <span className="text-gray-300">—</span>
                              )
                            ) : c.id === 'description' ? (
                              <span className="line-clamp-2 text-gray-500">{r.description || '—'}</span>
                            ) : (
                              cellText(r, c.id, config.currency)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </PreviewGroup>
                ))}
              </tbody>
            </table>
          </div>
          {limit !== undefined && rowCount > limit && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Previewing {limit} of {rowCount.toLocaleString()} — the download includes every product.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function PreviewGroup({
  title,
  total,
  span,
  children,
}: {
  title: string | null;
  total: number;
  span: number;
  children: React.ReactNode;
}) {
  return (
    <>
      {title && (
        <tr>
          <td colSpan={span} className="border-b border-gray-200 bg-gray-100/80 px-1.5 py-1 shadow-[inset_2px_0_0_#000] sm:px-3 sm:py-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-playfair text-[11.5px] font-bold sm:text-sm">{title}</span>
              <span className="text-[8px] uppercase tracking-[0.14em] text-gray-500 sm:text-[10px]">{total} items</span>
            </div>
          </td>
        </tr>
      )}
      {children}
    </>
  );
}

function alignClass(align: 'left' | 'right' | 'center') {
  return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
}

function cellClass(id: PriceListColumnId, inStock: boolean) {
  if (id === 'name') return 'font-medium text-gray-900';
  if (id === 'final') return 'whitespace-nowrap font-medium text-gray-900';
  if (id === 'ref') return 'font-mono text-[9px] text-gray-500 sm:text-[11px]';
  if (id === 'discount') return 'text-gray-500';
  if (id === 'stock') return inStock ? 'whitespace-nowrap text-gray-600' : 'whitespace-nowrap text-red-800';
  if (id === 'price') return 'whitespace-nowrap';
  return 'text-gray-700';
}
