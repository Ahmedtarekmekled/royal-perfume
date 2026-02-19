"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartItemCompact from '@/components/cart/CartItemCompact';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/lib/utils';

import { useState } from 'react';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-md">
        <SheetHeader className="px-1">
          <SheetTitle className="flex items-center justify-between">
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>
        
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto pr-4 -mr-4">
              <div className="flex flex-col py-2">
                {items.map((item) => (
                  <CartItemCompact
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4 pr-6">
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-lg font-medium">Subtotal</span>
                <span className="text-lg font-bold">{formatCurrency(getTotalPrice())}</span>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Link href="/checkout" className="w-full">
                    <Button className="w-full py-6 text-lg" size="lg">
                      Checkout
                    </Button>
                  </Link>
                </SheetClose>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-2 pr-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <span className="text-lg font-medium text-muted-foreground">
              Your cart is empty
            </span>
            <SheetClose asChild>
              <Link href="/shop">
                <Button variant="outline" className="mt-4">
                  Continue Shopping
                </Button>
              </Link>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
