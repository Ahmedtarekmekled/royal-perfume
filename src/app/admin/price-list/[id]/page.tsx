import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { parsePriceListParams } from '@/lib/price-list/config';
import { getPriceListGroups } from '@/lib/price-list/data';
import { getSavedPriceList, paramsToRecord } from '@/lib/price-list/saved';
import PriceListPreview from '@/components/admin/price-list/PriceListPreview';
import { DeletePriceListButton, DownloadLink } from '@/components/admin/price-list/PriceListActions';

export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function SavedPriceListPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const list = await getSavedPriceList(id);
  if (!list) notFound();

  const config = parsePriceListParams(paramsToRecord(list.params));
  const { groups, rowCount } = await getPriceListGroups(config);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin/price-list"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500 transition hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Price lists
          </Link>
          <h1 className="mt-1.5 truncate font-playfair text-2xl font-bold md:text-3xl">{list.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Saved {dateFmt.format(new Date(list.updated_at))} · {rowCount.toLocaleString()} products · prices are live from
            your catalog
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DeletePriceListButton id={list.id} title={list.title} redirectTo="/admin/price-list" />
          <Link
            href={`/admin/price-list/new?list=${list.id}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-xs font-medium uppercase tracking-widest transition hover:border-black"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <DownloadLink params={list.params} format="xlsx" />
          <DownloadLink params={list.params} format="pdf" />
        </div>
      </div>

      <PriceListPreview config={config} groups={groups} rowCount={rowCount} />
    </div>
  );
}
