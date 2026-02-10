'use client';

import Link from 'next/link';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import CartDrawer from '@/components/shared/CartDrawer';
import { useState } from 'react';

export default function Navbar() {
  const cartItems = useCartStore((state) => state.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="w-full max-w-none sm:max-w-none h-full border-none p-0 bg-white dark:bg-black">
            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
            
            {/* Header: Logo & Close Button Space */}
            <div className="flex items-center justify-between p-6">
                 {/* Logo - Matching position */}
                 <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-2">
                    <span className="text-2xl font-heading font-bold tracking-tight">
                        Royal Perfumes
                    </span>
                 </Link>
                 
                 <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close</span>
                    </Button>
                 </SheetClose>
            </div>

            {/* Menu Links - Centered Column */}
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-10 animate-in fade-in duration-500">
              <Link 
                href="/shop" 
                onClick={() => setIsOpen(false)} 
                className="text-4xl font-heading font-medium hover:text-muted-foreground transition-colors"
                style={{ fontStyle: 'italic' }} 
              >
                Shop
              </Link>
              <Link 
                href="/categories" 
                onClick={() => setIsOpen(false)} 
                className="text-4xl font-heading font-medium hover:text-muted-foreground transition-colors"
              >
                Collections
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsOpen(false)} 
                className="text-4xl font-heading font-medium hover:text-muted-foreground transition-colors"
              >
                Our Story
              </Link>
            </div>

            {/* Footer - Minimal Account/Search */}
            <div className="absolute bottom-10 w-full flex justify-center gap-8 text-sm font-body text-gray-500 uppercase tracking-widest">
                <Link href="/account" onClick={() => setIsOpen(false)} className="hover:text-black dark:hover:text-white transition-colors">
                    Account
                </Link>
                <Link href="/search" onClick={() => setIsOpen(false)} className="hover:text-black dark:hover:text-white transition-colors">
                    Search
                </Link>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-2xl font-heading font-bold tracking-tight">
            Royal Perfumes
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-8">
          <Link href="/shop" className="text-sm font-medium transition-colors hover:text-muted-foreground">
            Shop
          </Link>
          <Link href="/categories" className="text-sm font-medium transition-colors hover:text-muted-foreground">
            Collections
          </Link>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-muted-foreground">
            Our Story
          </Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <div className="relative">
             <CartDrawer />
          </div>
        </div>
      </div>
    </nav>
  );
}
