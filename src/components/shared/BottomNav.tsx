
'use client';

import Link from 'next/link';
import { Home, Grid, ShoppingBag, MessageCircle, Send } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart';
import { useStore } from '@/hooks/use-store';
import CartSheet from '@/components/cart/cart-sheet';
import { useState } from 'react';
import { WHATSAPP_URL, TELEGRAM_URL } from '@/lib/social';

export default function BottomNav() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemCount = useStore(useCartStore, (state) => state.getItemCount());

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t h-14 flex items-center justify-around pb-safe">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors">
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 leading-none">Home</span>
        </Link>
        
        <Link href="/shop" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors">
          <Grid className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 leading-none">Shop</span>
        </Link>

        {/* Cart Button: raised semicircle above the bar */}
        <div className="relative flex w-full h-full justify-center">
          {/* Dome: same background as the bar, covering its top border */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-[22px] left-1/2 -translate-x-1/2 h-[38px] w-[76px] rounded-t-full bg-background border border-b-0"
          />
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open cart${itemCount ? `, ${itemCount} items` : ''}`}
            className="relative flex flex-col items-center justify-end h-full w-full pb-1.5 text-foreground"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-md active:scale-95 transition-transform">
              <ShoppingBag className="h-6 w-6" strokeWidth={1.75} />
              {itemCount !== undefined && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black ring-1 ring-black">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="text-[10px] leading-none font-medium">Cart</span>
          </button>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 leading-none">Chat</span>
        </a>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <Send className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 leading-none">Telegram</span>
        </a>
      </div>

      {/* Cart Sheet */}
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
