'use client';

import { Minus, Plus, X } from 'lucide-react';
import ImageWithFallback from '@/components/shared/ImageWithFallback';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCartStore } from '@/hooks/use-cart';
import { useStore } from '@/hooks/use-store';
import { useSettings } from '@/components/providers/SettingsProvider';
import MinOrderNotice from '@/components/cart/min-order-notice';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const items = useStore(useCartStore, (state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());
  const { hidePrices, minOrderQuantity } = useSettings();

  // Handle hydration - don't render if items is undefined
  if (!items) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent aria-describedby={undefined} className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-heading text-2xl px-1 sm:px-2">Your Royal Collection</SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const isEmpty = items.length === 0;
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const meetsMinimum = totalQuantity >= minOrderQuantity;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined} className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl px-1 sm:px-2">Your Royal Collection</SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-lg font-medium">Your Royal Collection is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add some luxurious perfumes to get started
              </p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="mt-4"
              asChild
            >
              <Link href="/shop">Browse Collection</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.variantId || 'base'}`}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {(item.images?.[0] || item.image) ? (
                      <ImageWithFallback
                        src={item.images?.[0] || item.image || ''}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    {item.variantName && (
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                    {item.category && (
                      <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                    )}
                    {!hidePrices && (
                      <p className="text-sm font-medium mt-2">${item.price.toFixed(2)}</p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => removeItem(item.id, item.variantId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-5 sm:px-6 pt-4 pb-5 space-y-4">
              <MinOrderNotice totalQuantity={totalQuantity} minOrderQuantity={minOrderQuantity} />
              <div className="flex items-baseline justify-between font-heading">
                <span className="text-base">
                  {hidePrices ? 'Your Order' : 'Total'}{' '}
                  <span className="text-xs font-body font-light text-muted-foreground">
                    ({items.length} {items.length === 1 ? 'fragrance' : 'fragrances'})
                  </span>
                </span>
                <span className="text-base font-bold">
                  {hidePrices
                    ? `${totalQuantity} ${totalQuantity === 1 ? 'Piece' : 'Pieces'}`
                    : `$${getTotalPrice.toFixed(2)}`}
                </span>
              </div>
              {meetsMinimum ? (
                <Button
                  className="w-full h-11 rounded-none bg-black hover:bg-black/85 text-white text-xs uppercase tracking-widest font-body font-medium"
                  onClick={() => {
                    onOpenChange(false);
                    // Navigate to checkout will be handled by Link
                  }}
                  asChild
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-none border-black text-black hover:bg-black hover:text-white text-xs uppercase tracking-widest font-body font-medium transition-colors"
                  onClick={() => onOpenChange(false)}
                  asChild
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
