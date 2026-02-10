
'use client';

import Link from 'next/link';
import { Home, Grid, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
// import { usePathname } from 'next/navigation'; // Optional for active state

export default function BottomNav() {
  const cartItems = useCartStore((state) => state.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t h-16 flex items-center justify-around pb-safe">
      <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground">
        <Home className="h-5 w-5" />
        <span className="text-[10px] mt-1">Home</span>
      </Link>
      
      <Link href="/shop" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground">
        <Grid className="h-5 w-5" />
        <span className="text-[10px] mt-1">Shop</span>
      </Link>

      <div className="relative w-full h-full"> 
         {/* Cart Drawer Trigger is usually inside Navbar/CartDrawer. 
             Since `CartDrawer` uses a Trigger, we can reuse it OR just link to /cart if we had a page. 
             But we have a Drawer. 
             To open the drawer from here without prop drilling, we might need a global state or just use a Link to /cart if it existed.
             HOWEVER, `CartDrawer` is a client component in Navbar.
             Let's try to simulate the trigger or just duplicate the Drawer here? 
             Duplicating the Drawer here is the easiest way to ensure it opens.
         */}
         {/* actually, simpler: Just import CartDrawer and use custom trigger? 
             CartDrawer in `src/components/shared/CartDrawer.tsx` has its own trigger button.
             We need to customize that trigger to look like a bottom nav item.
             OR we create a `CartNavTrigger`?
             
             Let's look at `CartDrawer.tsx`. It exports `CartDrawer`. 
             It renders `<SheetTrigger><Button .../></SheetTrigger>`.
             We can't easily replace the trigger button from outside unless we modify CartDrawer to accept a `customTrigger` prop.
             
             Strategy: Modify `CartDrawer` to accept `trigger` prop? 
             Or just create a local sheet here? No, duplicate state.
             
             Let's use a Link to `/checkout` or just make a new `BottomCartDrawer`?
             Wait, `CartDrawer.tsx` is self-contained. 
             If I render `<CartDrawer />` here, it will render the Button.
             I should modify `CartDrawer` to allow custom trigger or just refactor.
             
             Quickest fix: Render `CartDrawer` but hide the default button via CSS? No.
             
             Let's UPDATE `CartDrawer.tsx` to accept a `customTrigger` ReactNode.
         */}
         <Link href="/checkout" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground">
             <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                    {itemCount}
                    </span>
                )}
             </div>
             <span className="text-[10px] mt-1">Cart</span>
         </Link>
      </div>

      <a 
        href="https://wa.me/96512345678" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-[10px] mt-1">Chat</span>
      </a>
    </div>
  );
}
