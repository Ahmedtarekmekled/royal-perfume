'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ShippingFeeFields from './ShippingFeeFields';
import PriceAdjustField from './PriceAdjustField';
import { adjustPrice, clampAdjust } from '@/lib/price-adjust';

interface ShippingCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Suggested shipping rate per product for the order's destination country. */
  defaultPerProductRate: number;
  totalQuantity: number;
  /** When set (priced PDF), shows the "Adjust prices %" control. Each entry
   *  is one line item's unit price and quantity, for the live preview. */
  priceLines?: { unitPrice: number; quantity: number }[];
  isGenerating?: boolean;
  onConfirm: (shippingCost: number, adjustPercent: number) => void;
}

export default function ShippingCostDialog({
  open,
  onOpenChange,
  defaultPerProductRate,
  totalQuantity,
  priceLines,
  isGenerating = false,
  onConfirm,
}: ShippingCostDialogProps) {
  const [shippingCost, setShippingCost] = useState(defaultPerProductRate * totalQuantity);
  const [adjustInput, setAdjustInput] = useState('');

  const adjustPercent = clampAdjust(Number(adjustInput) || 0);
  const valid = Number.isFinite(shippingCost) && shippingCost >= 0;

  const subtotal = (priceLines ?? []).reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const adjustedSubtotal = (priceLines ?? []).reduce(
    (s, l) => s + adjustPrice(l.unitPrice, adjustPercent) * l.quantity,
    0
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Closing clears the adjustment so it never carries over to the next download.
        if (!next) setAdjustInput('');
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{priceLines ? 'Invoice Options' : 'Shipping Fee'}</DialogTitle>
          <DialogDescription>
            Shipping is suggested from the order&apos;s destination country. These changes only
            affect the downloaded invoice — the saved order is unchanged.
          </DialogDescription>
        </DialogHeader>

        <ShippingFeeFields
          defaultPerProductRate={defaultPerProductRate}
          totalQuantity={totalQuantity}
          resetSignal={open}
          onTotalChange={setShippingCost}
        />

        {priceLines && (
          <PriceAdjustField
            value={adjustInput}
            onChange={setAdjustInput}
            subtotal={subtotal}
            adjustedSubtotal={adjustedSubtotal}
            className="border-t pt-4"
          />
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!valid || isGenerating}
            onClick={() => {
              onConfirm(shippingCost, adjustPercent);
              setAdjustInput('');
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              'Generate & Download PDF'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
