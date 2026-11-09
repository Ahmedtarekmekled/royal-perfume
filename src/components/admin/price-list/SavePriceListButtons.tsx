'use client';

import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CopyPlus, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { savePriceList } from '@/app/admin/price-list/actions';

/** Reads the surrounding builder form and saves it (new, or over `listId`). */
export default function SavePriceListButtons({ listId }: { listId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [pending, start] = useTransition();
  const [pendingNew, startNew] = useTransition();

  const save = (asNew: boolean) => {
    const form = ref.current?.closest('form');
    if (!form) return;
    const qs = new URLSearchParams();
    new FormData(form).forEach((v, k) => typeof v === 'string' && qs.append(k, v));
    (asNew ? startNew : start)(async () => {
      const res = await savePriceList(qs.toString(), asNew ? undefined : listId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(listId && !asNew ? 'Price list updated' : 'Price list saved');
      router.push(`/admin/price-list/${res.id}`);
    });
  };

  const busy = pending || pendingNew;

  return (
    <div ref={ref} className="flex items-center gap-2">
      {listId && (
        <button
          type="button"
          disabled={busy}
          onClick={() => save(true)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium uppercase tracking-widest transition hover:border-black disabled:opacity-60"
        >
          {pendingNew ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CopyPlus className="h-3.5 w-3.5" />}
          Save as new
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => save(false)}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-black px-4 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-black/85 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : listId ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Save className="h-3.5 w-3.5" />
        )}
        {listId ? 'Save changes' : 'Save price list'}
      </button>
    </div>
  );
}
