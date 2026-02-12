'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/hooks/use-cart';
import { useStore } from '@/hooks/use-store';
import CheckoutForm from '@/components/checkout/checkout-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckoutProvider, useCheckout } from '@/contexts/checkout-context';

function CheckoutContent() {
  const router = useRouter();
  const items = useStore(useCartStore, (state) => state.items);
  const totalPrice = useStore(useCartStore, (state) => state.getTotalPrice());
  const { shippingFee } = useCheckout();
  const grandTotal = (totalPrice || 0) + shippingFee;

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
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
          <h1 className="text-4xl font-heading font-medium">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Checkout Form */}
          <div>
            <CheckoutForm />
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="sticky top-24 border rounded-lg p-6 space-y-6">
              <h2 className="text-2xl font-heading font-medium">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
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
                    <p className="font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{totalPrice !== undefined ? `$${totalPrice.toFixed(2)}` : '$0.00'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  {shippingFee > 0 ? (
                    <span>${shippingFee.toFixed(2)}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Select country</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-lg font-heading pt-2 border-t">
                  <span>Total</span>
                  <span className="font-bold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
