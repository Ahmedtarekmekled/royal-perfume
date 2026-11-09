'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, FileText, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deletePriceList } from '@/app/admin/price-list/actions';

/**
 * PDF / Excel download link for a saved list. A file download never
 * navigates, so the spinner clears when the window regains focus (save
 * dialog closed) or after a fallback timeout.
 */
export function DownloadLink({
  params,
  format,
  compact = false,
}: {
  params: string;
  format: 'pdf' | 'xlsx';
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!busy) return;
    const clear = () => setBusy(false);
    const t = setTimeout(clear, 8000);
    window.addEventListener('focus', clear);
    return () => {
      clearTimeout(t);
      window.removeEventListener('focus', clear);
    };
  }, [busy]);

  const Icon = format === 'pdf' ? FileText : FileSpreadsheet;
  const label = format === 'pdf' ? 'PDF' : 'Excel';
  const primary = format === 'pdf';

  return (
    <a
      href={`/admin/price-list/export?${params}&format=${format}`}
      onClick={() => setBusy(true)}
      aria-busy={busy || undefined}
      title={`Download ${label}`}
      className={
        compact
          ? 'inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-700 transition hover:border-gray-900 hover:text-black'
          : `inline-flex h-9 items-center gap-2 rounded-md px-4 text-xs font-medium uppercase tracking-widest transition ${
              primary ? 'bg-black text-white hover:bg-black/85' : 'border border-gray-300 bg-white hover:border-black'
            }`
      }
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className={`h-3.5 w-3.5 ${format === 'xlsx' ? 'text-emerald-700' : ''}`} />
      )}
      {label}
    </a>
  );
}

export function DeletePriceListButton({
  id,
  title,
  redirectTo,
  compact = false,
}: {
  id: string;
  title: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const onDelete = () => {
    if (!confirm(`Delete the price list "${title}"? This can't be undone.`)) return;
    start(async () => {
      const res = await deletePriceList(id);
      if (!res.success) {
        toast.error(res.error || 'Could not delete the price list.');
        return;
      }
      toast.success('Price list deleted');
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      title="Delete"
      className={
        compact
          ? 'inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60'
          : 'inline-flex h-9 items-center gap-2 rounded-md border border-transparent px-3 text-xs font-medium uppercase tracking-widest text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60'
      }
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      {compact ? <span className="sr-only">Delete price list</span> : 'Delete'}
    </button>
  );
}
