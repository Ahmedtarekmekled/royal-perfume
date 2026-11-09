import Link from 'next/link';
import { Database, FilePlus2, Pencil } from 'lucide-react';
import { parsePriceListParams, type PriceListConfig } from '@/lib/price-list/config';
import { listSavedPriceLists, paramsToRecord, type SavedPriceList } from '@/lib/price-list/saved';
import { DeletePriceListButton, DownloadLink } from '@/components/admin/price-list/PriceListActions';

export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function PriceListsPage() {
  const { lists, missingTable } = await listSavedPriceLists();

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">Exports</p>
          <h1 className="mt-1 font-playfair text-2xl font-bold md:text-3xl">Price Lists</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your saved price lists, always built from today&apos;s catalog. Open one to view it, download it, or make a new one.
          </p>
        </div>
        <Link
          href="/admin/price-list/new"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-black px-5 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-black/85"
        >
          <FilePlus2 className="h-4 w-4" />
          New price list
        </Link>
      </div>

      {missingTable && (
        <div role="alert" className="flex gap-3 rounded-lg border-l-2 border-amber-600 bg-white px-4 py-3 text-sm shadow-sm">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p>
            Saving price lists needs a one-time database update. Run{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">supabase/migrations/20261109_saved_price_lists.sql</code>{' '}
            in the Supabase SQL editor. You can still create and download price lists in the meantime.
          </p>
        </div>
      )}

      {lists.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400">
            {lists.length} saved {lists.length === 1 ? 'list' : 'lists'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lists.map((list) => (
              <PriceListCard key={list.id} list={list} />
            ))}
            <Link
              href="/admin/price-list/new"
              className="group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white/50 p-6 text-center transition hover:border-gray-900 hover:bg-white"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition group-hover:border-black group-hover:bg-black group-hover:text-white">
                <FilePlus2 className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-gray-600 group-hover:text-black">
                Create another
              </span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function PriceListCard({ list }: { list: SavedPriceList }) {
  const config = parsePriceListParams(paramsToRecord(list.params));
  const chips = summarize(config);
  const href = `/admin/price-list/${list.id}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]">
      <div className="h-[3px] bg-red-900" />

      {/* Miniature of the document — purely decorative */}
      <Link href={href} className="block border-b border-gray-100 bg-gray-50/60 px-5 pb-4 pt-5" aria-label={`Open ${list.title}`}>
        <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm transition group-hover:shadow">
          <div className="flex items-center gap-2 border-b border-gray-900 pb-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black font-playfair text-[8px] font-bold text-white">R</span>
            <span className="h-1.5 w-16 rounded bg-gray-800" />
          </div>
          <div className="mt-2 h-2 w-full rounded-sm bg-black" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mt-1.5 flex gap-2">
              <span className={`h-1.5 rounded bg-gray-200 ${i % 2 ? 'w-2/5' : 'w-1/2'}`} />
              <span className="ml-auto h-1.5 w-8 rounded bg-gray-300" />
            </div>
          ))}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-w-0">
          <Link href={href} className="block">
            <h2 className="truncate font-playfair text-lg font-bold leading-tight after:absolute after:inset-0 after:content-['']">
              {list.title}
            </h2>
          </Link>
          {list.note ? (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{list.note}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-400">No note</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-600">
              {c}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <span className="text-[11px] text-gray-400">Updated {dateFmt.format(new Date(list.updated_at))}</span>
          {/* Above the card's stretched link so the buttons stay clickable */}
          <div className="relative z-10 flex items-center gap-1">
            <DownloadLink params={list.params} format="pdf" compact />
            <DownloadLink params={list.params} format="xlsx" compact />
            <Link
              href={`/admin/price-list/new?list=${list.id}`}
              title="Edit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-black"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Link>
            <DeletePriceListButton id={list.id} title={list.title} compact />
          </div>
        </div>
      </div>
    </article>
  );
}

/** Short, admin-facing description of a list's settings (never the price adjustment). */
function summarize(config: PriceListConfig): string[] {
  const chips: string[] = [];
  chips.push(config.brandIds.length ? `${config.brandIds.length} brand${config.brandIds.length > 1 ? 's' : ''}` : 'All brands');
  if (config.categoryIds.length)
    chips.push(`${config.categoryIds.length} categor${config.categoryIds.length > 1 ? 'ies' : 'y'}`);
  if (config.audience !== 'all') chips.push(config.audience);
  if (config.q) chips.push(`“${config.q}”`);
  if (config.inStockOnly) chips.push('In stock');
  if (config.groupBy !== 'none') chips.push(`By ${config.groupBy}`);
  chips.push(`${config.columns.length} columns`);
  return chips;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
      <div className="relative mb-6 h-28 w-24">
        <div className="absolute inset-0 translate-x-3 rotate-6 rounded-md border border-gray-200 bg-gray-50" />
        <div className="absolute inset-0 rounded-md border border-gray-200 bg-white p-2.5 shadow-sm">
          <div className="h-[2px] -mx-2.5 -mt-2.5 mb-2 rounded-t-md bg-red-900" />
          <div className="flex items-center gap-1.5 border-b border-gray-900 pb-1.5">
            <span className="h-3 w-3 rounded-full bg-black" />
            <span className="h-1 w-10 rounded bg-gray-800" />
          </div>
          <div className="mt-1.5 h-1.5 rounded-sm bg-black" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="mt-1.5 flex gap-1.5">
              <span className="h-1 w-1/2 rounded bg-gray-200" />
              <span className="ml-auto h-1 w-4 rounded bg-gray-300" />
            </div>
          ))}
        </div>
      </div>
      <h2 className="font-playfair text-xl font-bold">No saved price lists yet</h2>
      <p className="mt-1.5 max-w-sm text-sm text-gray-500">
        Build a price list once — brands, columns, prices — save it, and it&apos;ll be here to view or download any time.
      </p>
      <Link
        href="/admin/price-list/new"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-black px-5 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-black/85"
      >
        <FilePlus2 className="h-4 w-4" />
        Create your first price list
      </Link>
    </div>
  );
}
