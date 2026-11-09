'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ADJUST_MAX, ADJUST_MIN } from '@/lib/price-adjust';

const PRESETS = [-10, -5, 5, 10];

const money = (n: number) => `$${n.toFixed(2)}`;

interface PriceAdjustFieldProps {
  /** Raw input text, so "-" or "" can be typed mid-edit. */
  value: string;
  onChange: (value: string) => void;
  /** Subtotal before / after the adjustment, shown as a live preview. */
  subtotal: number;
  adjustedSubtotal: number;
  className?: string;
}

/** Staff-only "+/- %" control for invoice prices. The percentage only changes
 *  the numbers on the generated PDF — it is never printed on it. */
export default function PriceAdjustField({
  value,
  onChange,
  subtotal,
  adjustedSubtotal,
  className,
}: PriceAdjustFieldProps) {
  const numeric = Number(value) || 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Adjust prices %</Label>
        {numeric !== 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-muted-foreground underline hover:text-foreground"
          >
            reset
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          step={0.5}
          min={ADJUST_MIN}
          max={ADJUST_MAX}
          value={value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          className="w-24"
        />
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(String(p))}
            className={cn(
              'h-9 rounded-md border px-2 text-xs tabular-nums transition hover:border-foreground',
              numeric === p && 'border-foreground bg-foreground text-background'
            )}
          >
            {p > 0 ? `+${p}` : p}%
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {numeric === 0 ? (
          <>Every item price is shifted — e.g. 10 = 10% higher, -10 = 10% lower. Only the new prices appear on the PDF.</>
        ) : (
          <>
            Items subtotal {money(subtotal)} → <span className="font-medium text-foreground">{money(adjustedSubtotal)}</span>
          </>
        )}
      </p>
    </div>
  );
}
