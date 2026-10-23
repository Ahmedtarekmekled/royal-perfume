'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/hooks/use-cart';
import { useStore } from '@/hooks/use-store';
import CheckoutForm from '@/components/checkout/checkout-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Headset } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from '@/components/shared/ImageWithFallback';
import { CheckoutProvider, useCheckout } from '@/contexts/checkout-context';
import { useSettings } from '@/components/providers/SettingsProvider';
import Container from '@/components/shared/Container';
import MinOrderNotice from '@/components/cart/min-order-notice';

function CheckoutContent() {
  const router = useRouter();
  const items = useStore(useCartStore, (state) => state.items);
  const totalPrice = useStore(useCartStore, (state) => state.getTotalPrice());
  const { shippingFee } = useCheckout();
  const { hidePrices, minOrderQuantity } = useSettings();
  const grandTotal = hidePrices ? 0 : ((totalPrice || 0) + shippingFee);
  const totalQuantity = items ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  // Redirect if cart is empty
  if (items !== undefined && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-heading">Your cart is empty</h2>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-32 md:py-12">
      <Container className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-heading font-medium">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Checkout Form */}
          <div>
            <CheckoutForm />
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="sticky top-24 border rounded-lg p-5 md:p-6 space-y-6">
              <h2 className="text-2xl font-heading font-medium">Order Summary</h2>

              {items !== undefined && (
                <MinOrderNotice totalQuantity={totalQuantity} minOrderQuantity={minOrderQuantity} />
              )}

              {/* Items */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items?.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      {(item.images?.[0] || item.image) ? (
                        <ImageWithFallback
                          src={item.images?.[0] || item.image || ''}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    {!hidePrices && (
                      <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals */}
              {hidePrices ? (
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-baseline justify-between font-heading">
                    <span className="text-lg">
                      Your Order{' '}
                      <span className="text-xs font-body font-light text-muted-foreground">
                        ({items?.length ?? 0} {items?.length === 1 ? 'fragrance' : 'fragrances'})
                      </span>
                    </span>
                    <span className="text-lg font-bold">
                      {totalQuantity} {totalQuantity === 1 ? 'Piece' : 'Pieces'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 border-l-2 border-black bg-neutral-50 px-4 py-3">
                    <Headset className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-body font-medium uppercase tracking-[0.2em]">
                        Personal Confirmation
                      </p>
                      <p className="text-xs font-body font-light leading-relaxed text-muted-foreground">
                        Our team will contact you shortly to confirm your order and final pricing.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{totalPrice !== undefined ? `$${totalPrice.toFixed(2)}` : '$0.00'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  {totalQuantity >= 500 ? (
                      <span className="text-xs font-medium text-black">Calculated via WhatsApp</span>
                  ) : shippingFee > 0 ? (
                    <span>${shippingFee.toFixed(2)}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Select country</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-lg font-heading pt-2 border-t">
                  <span>Total</span>
                  <span className="font-bold">${grandTotal.toFixed(2)}</span>
                </div>

                {/* Wholesale Note */}
                {totalQuantity >= 500 && (
                    <div className="bg-black text-white p-4 rounded-sm mt-6">
                        <p className="text-xs font-light leading-relaxed">
                            <strong className="block mb-1 font-medium text-sm">Wholesale Order (500+ Units)</strong>
                            You have qualified for a wholesale shipping quote. We will calculate the best rate and contact you via WhatsApp to finalize the shipping cost before payment.
                        </p>
                    </div>
                )}
              </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
