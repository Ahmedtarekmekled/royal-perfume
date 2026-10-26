'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Live wrapper around the (server-rendered) price-list GET form: any change
 * re-requests the page with the new query, debounced, without a full reload
 * or scroll jump — the server re-renders the preview, this only navigates.
 * Download buttons still submit natively to the export route via formAction.
 * `data-pending` lets the preview dim itself while the update is in flight.
 */
export default function LivePriceListForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // A file download doesn't navigate, so clear the "preparing" state when the
  // window regains focus (save dialog closed) or after a fallback timeout.
  useEffect(() => {
    if (!downloading) return;
    const clear = () => setDownloading(null);
    const t = setTimeout(clear, 8000);
    window.addEventListener('focus', clear);
    return () => {
      clearTimeout(t);
      window.removeEventListener('focus', clear);
    };
  }, [downloading]);

  const refresh = (delay: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      const qs = new URLSearchParams();
      new FormData(form).forEach((value, key) => {
        if (typeof value === 'string') qs.append(key, value);
      });
      startTransition(() => {
        router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
      });
    }, delay);
  };

  return (
    <form
      ref={formRef}
      action={pathname}
      method="GET"
      data-pending={isPending || undefined}
      data-downloading={downloading || undefined}
      className={`group/live ${className ?? ''}`}
      onChange={(e) => {
        const t = e.target as unknown as HTMLInputElement;
        // Typing is debounced; toggles/selects apply almost immediately.
        refresh(t.type === 'text' || t.type === 'number' || t.tagName === 'TEXTAREA' ? 500 : 120);
      }}
      onInput={(e) => {
        const t = e.target as unknown as HTMLInputElement;
        if (t.type === 'text' || t.type === 'number' || t.tagName === 'TEXTAREA') refresh(500);
      }}
      onSubmit={(e) => {
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        if (submitter?.formAction && submitter.name === 'format') {
          setDownloading(submitter.value); // native download via the export route
          return;
        }
        e.preventDefault(); // Enter key → live refresh instead of a full reload
        refresh(0);
      }}
    >
      {children}
    </form>
  );
}
