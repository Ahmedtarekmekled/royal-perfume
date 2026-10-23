'use client';

import { cn } from '@/lib/utils';

interface MinOrderNoticeProps {
  totalQuantity: number;
  minOrderQuantity: number;
  className?: string;
}

/** Compact progress toward the store's minimum order quantity (pieces). */
export default function MinOrderNotice({ totalQuantity, minOrderQuantity, className }: MinOrderNoticeProps) {
  const remaining = Math.max(minOrderQuantity - totalQuantity, 0);
  const met = remaining === 0;
  const progress = Math.min((totalQuantity / minOrderQuantity) * 100, 100);

  return (
    <div role={met ? 'status' : 'alert'} className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-body font-medium uppercase tracking-[0.2em] text-foreground">
          Minimum {minOrderQuantity} Pieces
        </span>
        <span className="text-[11px] font-body text-muted-foreground whitespace-nowrap">
          {met ? (
            'Minimum reached'
          ) : (
            <>
              Add <span className="font-medium text-foreground">{remaining} more</span>
            </>
          )}
        </span>
      </div>

      <div
        className="h-[2px] w-full bg-black/10 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={minOrderQuantity}
        aria-valuenow={Math.min(totalQuantity, minOrderQuantity)}
        aria-label="Minimum order progress"
      >
        <div
          className="h-full bg-black transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
