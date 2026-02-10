
'use client';

import { useState, useMemo } from 'react';
import { Product, Category } from '@/types';
import ShopSidebar from '@/components/shop/ShopSidebar';
import ProductCard from '@/components/shared/ProductCard';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

interface ShopClientWrapperProps {
  products: Product[];
  categories: Category[];
  productCounts: Record<string, number>;
  initialCategorySlug?: string;
}

export default function ShopClientWrapper({
  products,
  categories,
  productCounts,
  initialCategorySlug,
}: ShopClientWrapperProps) {
  const [searchQuery, setSearchQuery] = useState('');
  // We use URL searchParams for category, but we can also sync local state if needed.
  // Ideally, the sidebar links update the URL, and the page component re-renders. 
  // However, since we're client-side filtering the *text* search, let's combine logic.
  
  // Note: The parent Page component passes `initialCategorySlug`. 
  // If we navigate, the Page re-renders, updates `initialCategorySlug`.

  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Text Search Filter (Client-side)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name_en?.toLowerCase().includes(query) || 
        p.name_ar?.toLowerCase().includes(query) ||
        p.description_en?.toLowerCase().includes(query)
      );
    }

    // 2. Category Filter (Client-side logic if we wanted, but currently URL driven for SEO)
    // The Parent Page component ALREADY filtered by category ID via Supabase? 
    // Wait, in my proposed Page.tsx, I fetched ALL products to allow client-side search across ALL categories instantly?
    // Let's check the Page.tsx proposal.
    // YES: "Fetch All Active Products" -> then pass to ClientWrapper.
    // So we MUST filter by category here in ClientWrapper too if we want to honor the URL param 
    // OR we rely on the URL param to have filtered the data `products` passed in?
    
    // CORRECTION: In the Page.tsx propsoal, I fetched *ALL* products.
    // So I need to filter by category HERE.
    if (initialCategorySlug) {
        const category = categories.find(c => c.slug === initialCategorySlug);
        if (category) {
            result = result.filter(p => p.category_id === category.id);
        }
    }

    return result;
  }, [products, searchQuery, initialCategorySlug, categories]);

  const selectedCategoryName = initialCategorySlug 
    ? categories.find(c => c.slug === initialCategorySlug)?.name 
    : 'All Collection';

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Mobile Filter Trigger */}
      <div className="md:hidden mb-4 flex justify-between items-center">
         <h1 className="text-2xl font-heading">{selectedCategoryName}</h1>
         <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="py-6 h-full">
                    <ShopSidebar
                        categories={categories}
                        selectedCategory={initialCategorySlug || null}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        productCounts={productCounts}
                        totalProducts={products.length}
                    />
                </div>
            </SheetContent>
         </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="sticky top-24">
            <ShopSidebar
                categories={categories}
                selectedCategory={initialCategorySlug || null}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                productCounts={productCounts}
                totalProducts={products.length}
            />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-0"> {/* min-h-0 crucial for scroll areas inside flex */}
         <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-heading mb-2">{selectedCategoryName}</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} products found
            </p>
         </div>

         {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
               ))}
            </div>
         ) : (
            <div className="text-center py-20 bg-gray-50 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                No products found matching your criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className={!searchQuery ? 'hidden' : ''}
              >
                Clear Search
              </Button>
              {!searchQuery && initialCategorySlug && (
                  <Link href="/shop">
                    <Button variant="outline">View All Products</Button>
                  </Link>
              )}
            </div>
         )}
      </div>
    </div>
  );
}
