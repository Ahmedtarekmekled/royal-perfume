import Link from 'next/link';
import { ArrowLeft, ChevronDown, FileSpreadsheet, FileText, Loader2, RotateCcw } from 'lucide-react';
import { PRICE_LIST_COLUMNS, parsePriceListParams } from '@/lib/price-list/config';
import { getPriceListGroups, getPriceListOptions, type PriceListOption } from '@/lib/price-list/data';
import { getSavedPriceList, paramsToRecord } from '@/lib/price-list/saved';
import LivePriceListForm from '@/components/admin/price-list/LivePriceListForm';
import PriceListPreview from '@/components/admin/price-list/PriceListPreview';
import SavePriceListButtons from '@/components/admin/price-list/SavePriceListButtons';

export const dynamic = 'force-dynamic';

const PREVIEW_LIMIT = 120;

const fieldLabel = 'text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500';
const control =
  'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-black/5';
const checkbox = 'h-4 w-4 shrink-0 rounded border-gray-300 accent-black cursor-pointer';

export default async function PriceListBuilderPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.searchParams;
  const listParam = typeof params.list === 'string' ? params.list : undefined;
  const saved = listParam ? await getSavedPriceList(listParam) : null;
  // Editing a saved list: its settings apply until the form is changed.
  const config = parsePriceListParams(saved && params.s !== '1' ? paramsToRecord(saved.params) : params);
  const exportFailed = params.error === 'export';
  const resetHref = saved ? `/admin/price-list/new?list=${saved.id}` : '/admin/price-list/new';

  const [{ categories, brands }, { groups, rowCount }] = await Promise.all([
    getPriceListOptions(),
    getPriceListGroups(config),
  ]);

  const columns = PRICE_LIST_COLUMNS.filter((c) => config.columns.includes(c.id));

  return (
    <LivePriceListForm className="space-y-5">
      <input type="hidden" name="s" value="1" />
      {saved && <input type="hidden" name="list" value={saved.id} />}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link
            href={saved ? `/admin/price-list/${saved.id}` : '/admin/price-list'}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500 transition hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {saved ? 'Back to list' : 'Price lists'}
          </Link>
          <h1 className="mt-1.5 truncate text-2xl md:text-3xl font-playfair font-bold">
            {saved ? `Edit · ${saved.title}` : 'New price list'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Pick what to include — the preview updates as you go. Save it to reuse later, or download it right away.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 group-data-[pending]/live:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="group-data-[pending]/live:hidden">Live · {rowCount.toLocaleString()} products</span>
            <span className="hidden group-data-[pending]/live:inline">Updating…</span>
          </span>
          <SavePriceListButtons listId={saved?.id} />
        </div>
      </div>

      {exportFailed && (
        <div role="alert" className="rounded-lg border-l-2 border-red-800 bg-white px-4 py-3 text-sm shadow-sm">
          The export couldn&apos;t be generated. Please try again — if you included images, try without them.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* ── Options: sticky, scrolls on its own, downloads pinned ── */}
        <aside className="flex flex-col rounded-xl border border-gray-200 bg-white lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-hidden">
          <div className="flex-1 divide-y divide-gray-100 lg:overflow-y-auto lg:overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Section title="Document" meta={config.title}>
              <label className="block space-y-1.5">
                <span className={fieldLabel}>Title</span>
                <input type="text" name="title" defaultValue={config.title} maxLength={80} className={control} />
              </label>
              <label className="block space-y-1.5">
                <span className={fieldLabel}>Note (optional)</span>
                <textarea
                  name="note"
                  defaultValue={config.note}
                  maxLength={300}
                  rows={2}
                  placeholder="e.g. Prices valid until 30 November."
                  className={`${control} h-auto resize-none py-2`}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className={fieldLabel}>Currency</span>
                  <input type="text" name="currency" defaultValue={config.currency} maxLength={4} className={control} />
                </label>
                <label className="block space-y-1.5">
                  <span className={fieldLabel}>Adjust %</span>
                  <input
                    type="number"
                    name="adjust"
                    step="0.5"
                    min={-90}
                    max={500}
                    defaultValue={config.adjustPercent || ''}
                    placeholder="0"
                    className={control}
                  />
                </label>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-500">
                Adjust shifts every price — <b className="font-medium text-gray-700">10</b> = +10%,{' '}
                <b className="font-medium text-gray-700">-5</b> = 5% lower.
              </p>
            </Section>

            <Section title="Columns" open meta={`${columns.length} selected`}>
              <div className="grid grid-cols-2 gap-1.5">
                {PRICE_LIST_COLUMNS.map((c) => (
                  <label
                    key={c.id}
                    title={c.hint}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-2.5 py-2 text-sm transition hover:border-gray-400 has-[:checked]:border-gray-900 has-[:checked]:bg-gray-50"
                  >
                    <input type="checkbox" name="cols" value={c.id} defaultChecked={config.columns.includes(c.id)} className={checkbox} />
                    <span className="truncate">{c.label}</span>
                    {c.pdfOnly && <span className="ml-auto text-[9px] uppercase tracking-wider text-gray-400">PDF</span>}
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Products" open meta={`${rowCount.toLocaleString()} match`}>
              <label className="block space-y-1.5">
                <span className={fieldLabel}>Search name</span>
                <input type="text" name="q" defaultValue={config.q} placeholder="e.g. Oud" className={control} />
              </label>
              <label className="block space-y-1.5">
                <span className={fieldLabel}>Audience</span>
                <select name="audience" defaultValue={config.audience} className={control}>
                  <option value="all">Everyone</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </label>
              <MultiPick label="Brands" name="brand" options={brands} selected={config.brandIds} />
              <MultiPick label="Categories" name="category" options={categories} selected={config.categoryIds} />
              <div className="space-y-2.5 pt-1">
                <Toggle name="active" checked={config.activeOnly} label="Active products only" />
                <Toggle name="instock" checked={config.inStockOnly} label="In-stock only" />
              </div>
            </Section>

            <Section title="Layout" meta={`${config.groupBy === 'none' ? 'No grouping' : `By ${config.groupBy}`}`}>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className={fieldLabel}>Group by</span>
                  <select name="group" defaultValue={config.groupBy} className={control}>
                    <option value="none">None</option>
                    <option value="brand">Brand</option>
                    <option value="category">Category</option>
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className={fieldLabel}>Sort by</span>
                  <select name="sort" defaultValue={config.sortBy} className={control}>
                    <option value="name">Name A–Z</option>
                    <option value="brand">Brand</option>
                    <option value="price_asc">Price ↑</option>
                    <option value="price_desc">Price ↓</option>
                  </select>
                </label>
              </div>
            </Section>
          </div>

          {/* Downloads — always visible at the bottom of the panel */}
          <div className="space-y-2 border-t border-gray-100 bg-gray-50/60 p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                name="format"
                value="pdf"
                formAction="/admin/price-list/export"
                className="flex h-10 items-center justify-center gap-2 rounded-md bg-black text-xs font-medium uppercase tracking-widest text-white transition hover:bg-black/85"
              >
                <FileText className="h-4 w-4 group-data-[downloading=pdf]/live:hidden" />
                <Loader2 className="hidden h-4 w-4 animate-spin group-data-[downloading=pdf]/live:block" />
                PDF
              </button>
              <button
                type="submit"
                name="format"
                value="xlsx"
                formAction="/admin/price-list/export"
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white text-xs font-medium uppercase tracking-widest transition hover:border-black"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-700 group-data-[downloading=xlsx]/live:hidden" />
                <Loader2 className="hidden h-4 w-4 animate-spin group-data-[downloading=xlsx]/live:block" />
                Excel
              </button>
            </div>
            <div className="flex items-center justify-between px-0.5 text-[11px] text-gray-500">
              <span className="group-data-[downloading]/live:hidden">Built on the server from live data</span>
              <span className="hidden text-gray-700 group-data-[downloading]/live:inline">Preparing your file…</span>
              <Link href={resetHref} className="inline-flex items-center gap-1 hover:text-black">
                <RotateCcw className="h-3 w-3" /> Reset
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Preview (mirrors the PDF) ───────────────────────── */}
        <PriceListPreview
          config={config}
          groups={groups}
          rowCount={rowCount}
          limit={PREVIEW_LIMIT}
          className="transition-opacity duration-300 group-data-[pending]/live:opacity-55"
        />
      </div>
    </LivePriceListForm>
  );
}

function Section({
  title,
  meta,
  open,
  children,
}: {
  title: string;
  meta?: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="fold group/section">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 transition select-none hover:bg-gray-50 active:bg-gray-100 [&::-webkit-details-marker]:hidden">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">{title}</span>
        <span className="flex min-w-0 items-center gap-2.5 text-[11px] text-gray-400">
          {meta && <span className="truncate transition-opacity group-open/section:opacity-0 max-w-[140px]">{meta}</span>}
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-all duration-300 group-open/section:rotate-180 group-open/section:border-gray-900 group-open/section:bg-black group-open/section:text-white">
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </span>
      </summary>
      <div className="space-y-3.5 px-4 pb-4 pt-1">{children}</div>
    </details>
  );
}

function Toggle({ name, checked, label }: { name: string; checked: boolean; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} className={checkbox} />
      {label}
    </label>
  );
}

function MultiPick({
  label,
  name,
  options,
  selected,
}: {
  label: string;
  name: string;
  options: PriceListOption[];
  selected: string[];
}) {
  return (
    <details className="fold group/pick rounded-md border border-gray-200" open={selected.length > 0}>
      <summary className="flex h-9 cursor-pointer list-none items-center justify-between px-3 text-sm [&::-webkit-details-marker]:hidden">
        <span>
          {label}{' '}
          <span className="text-gray-400">({selected.length ? `${selected.length} selected` : 'all'})</span>
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 transition group-open/pick:rotate-180" />
      </summary>
      <div className="max-h-52 space-y-2 overflow-y-auto border-t border-gray-100 px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.length === 0 && <p className="text-xs text-gray-400">None found.</p>}
        {options.map((o) => (
          <label key={o.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" name={name} value={o.id} defaultChecked={selected.includes(o.id)} className={checkbox} />
            <span className="truncate">{o.name}</span>
          </label>
        ))}
      </div>
    </details>
  );
}
