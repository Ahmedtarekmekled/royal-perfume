
'use client';

import { Category } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming you have a utility for merging classes

interface ShopSidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  productCounts: Record<string, number>;
  totalProducts: number;
}

export default function ShopSidebar({
  categories,
  selectedCategory,
  searchQuery,
  setSearchQuery,
  productCounts,
  totalProducts,
}: ShopSidebarProps) {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-heading font-semibold">Search</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search perfumes..."
            className="pl-9 font-body"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col space-y-2">
        <h3 className="text-lg font-heading font-semibold">Collections</h3>
        <ScrollArea className="flex-1 w-full rounded-md border p-4 bg-muted/10 h-[calc(100vh-300px)]">
          <div className="flex flex-col space-y-1">
             <Link href="/shop" scroll={false}>
                <Button
                  variant={!selectedCategory ? 'secondary' : 'ghost'}
                  className={cn("w-full justify-between font-body", !selectedCategory && "font-bold")}
                >
                  All Products
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {totalProducts}
                  </span>
                </Button>
             </Link>
            {categories.map((category) => {
               const count = productCounts[category.id] || 0;
               if (count === 0) return null; // Smart Filter: Hide empty categories

               return (
                  <Link key={category.id} href={`/shop?category=${category.slug}`} scroll={false}>
                    <Button
                      variant={selectedCategory === category.slug ? 'secondary' : 'ghost'}
                      className={cn(
                        "w-full justify-between font-body", 
                        selectedCategory === category.slug && "font-bold"
                      )}
                    >
                      {category.name}
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </Button>
                  </Link>
               );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
