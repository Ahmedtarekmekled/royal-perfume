'use client';

import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import CartSheet from '@/components/cart/cart-sheet';
import { useCartStore } from '@/hooks/use-cart';
import { useStore } from '@/hooks/use-store';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface NavbarProps {
  categories?: Category[];
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true); // Default open
  const itemCount = useStore(useCartStore, (state) => state.getItemCount());
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60" suppressHydrationWarning>
      <div className="container flex h-16 items-center justify-between">
        
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-4">
          
          {/* Mobile Menu - "Royal" Redesign */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent side="left" showCloseButton={false} className="w-full max-w-none sm:max-w-none h-full border-none p-0 bg-white text-black flex flex-col">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                
                {/* 1. Header: Close Button Only (Minimalist) */}
                <div className="flex justify-end p-6">
                     <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-transparent">
                            <X className="h-8 w-8 text-black" />
                            <span className="sr-only">Close</span>
                        </Button>
                     </SheetClose>
                </div>

                {/* 2. Main Navigation Links */}
                <div className="flex-1 overflow-y-auto px-8 py-4">
                    <nav className="flex flex-col space-y-6">
                        {/* 1. Home */}
                        <Link 
                            href="/" 
                            onClick={() => setIsOpen(false)}
                            className="text-4xl font-light font-heading text-black hover:text-gray-600 transition-colors border-b border-gray-50 pb-4"
                        >
                            Home
                        </Link>

                         {/* 2. About */}
                         <Link 
                            href="/about" 
                            onClick={() => setIsOpen(false)}
                            className="text-4xl font-light font-heading text-black hover:text-gray-600 transition-colors border-b border-gray-50 pb-4"
                        >
                            About
                        </Link>

                         {/* 3. Shop */}
                         <Link 
                            href="/shop" 
                            onClick={() => setIsOpen(false)}
                            className="text-4xl font-light font-heading text-black hover:text-gray-600 transition-colors border-b border-gray-50 pb-4"
                        >
                            Shop
                        </Link>

                        {/* 4. Collections (Accordion - Default Open) */}
                        <div className="border-b border-gray-50 pb-4">
                            <div className="flex items-center justify-between">
                                <Link 
                                    href="/categories" 
                                    onClick={() => setIsOpen(false)}
                                    className="text-4xl font-light font-heading text-black hover:text-gray-600 transition-colors"
                                >
                                    Collections
                                </Link>
                                <button 
                                    onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
                                    className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                                >
                                    {isCollectionsOpen ? <ChevronUp className="h-6 w-6 text-gray-400" /> : <ChevronDown className="h-6 w-6 text-gray-400" />}
                                </button>
                            </div>
                            
                            {/* Sub-links (Categories) */}
                            {isCollectionsOpen && (
                                <div className="flex flex-col space-y-3 pl-4 mt-4 animate-in slide-in-from-top-2 duration-300">
                                    {categories?.map((cat) => (
                                        <Link 
                                            key={cat.id}
                                            href={`/shop?category=${cat.slug}`}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "text-lg font-body text-gray-500 hover:text-black transition-colors",
                                                activeCategory === cat.slug && "text-black font-medium"
                                            )}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

                {/* 3. Footer Area */}
                <div className="p-8 mt-auto bg-white border-t border-gray-50">
                    <div className="flex flex-col items-center space-y-6">
                        
                        {/* WhatsApp / Contact */}
                        <Link 
                            href="https://wa.me/" // Placeholder
                            target="_blank"
                            className="text-sm font-body uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                        >
                            WhatsApp Us
                        </Link>

                        {/* Settings / Account */}
                        <div className="flex items-center space-x-6 text-sm font-body text-gray-400">
                             <Link href="/account" onClick={() => setIsOpen(false)} className="hover:text-black">Account</Link>
                             <span>|</span>
                             <button className="hover:text-black">EN / USD</button>
                        </div>
                    </div>
                </div>

            </SheetContent>
          </Sheet>

          {/* Logo - visible on mobile */}
          <Link href="/" className="md:hidden flex items-center space-x-2">
            <span className="text-2xl font-heading font-bold tracking-tight">
              Royal Perfumes
            </span>
          </Link>
        </div>

        {/* Center Logo - Desktop Only */}
        <Link href="/" className="hidden md:flex mr-6 items-center space-x-2">
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
          <Button variant="ghost" size="icon" aria-label="Search" className="hidden md:inline-flex">
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Cart Button - Desktop Only */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cart"
            className="relative hidden md:inline-flex"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount !== undefined && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium">
                {itemCount}
              </span>
            )}
          </Button>
          
          {/* Cart Sheet */}
          <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
        </div>
      </div>
    </nav>
  );
}
