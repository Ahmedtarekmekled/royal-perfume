
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category, Brand } from '@/types';
import ShopSidebar from '@/components/shop/ShopSidebar';
import ProductCard from '@/components/shared/ProductCard';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface ShopClientWrapperProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  productCounts: Record<string, number>;
  initialCategorySlug?: string;
  initialAudience?: string;
  initialBrands?: string[];
  pagination: {
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export default function ShopClientWrapper({
  products,
  categories,
  brands,
  productCounts,
  initialCategorySlug,
  initialAudience,
  initialBrands = [],
  pagination,
}: ShopClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Initialize search query from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Debounced Search Update
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get('q') || '';
      if (searchQuery !== currentQ) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
          params.set('q', searchQuery);
        } else {
          params.delete('q');
        }
        params.set('page', '1'); // Reset to page 1 on search
        
        startTransition(() => {
          router.push(`/shop?${params.toString()}`);
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, router, searchParams]);


  const selectedCategoryName = initialCategorySlug 
    ? categories.find(c => c.slug === initialCategorySlug)?.name 
    : 'All Collection';

  // Pagination Handlers
  const handlePageChange = (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/shop?${params.toString()}`);
  };

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
                <SheetTitle className="sr-only">Filters</SheetTitle>
                <div className="py-6 h-full overflow-y-auto">
                    <ShopSidebar
                        categories={categories}
                        brands={brands}
                        selectedCategory={initialCategorySlug || null}
                        selectedAudience={initialAudience || null}
                        selectedBrands={initialBrands}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        productCounts={productCounts}
                        totalProducts={pagination.totalPages * 12} // Approximate or pass total count if needed
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
                brands={brands}
                selectedCategory={initialCategorySlug || null}
                selectedAudience={initialAudience || null}
                selectedBrands={initialBrands}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                productCounts={productCounts}
                totalProducts={pagination.totalPages * 12} // Approximate
            />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
         <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-heading mb-2">{selectedCategoryName}</h1>
            <p className="text-muted-foreground">
               Showing {products.length} results
            </p>
         </div>

         <div className={`transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
             {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-6 px-3 md:px-0">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-12 flex justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                            <div className="flex items-center px-4 font-medium">
                                Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={!pagination.hasMore}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </>
             ) : (
                <div className="text-center py-20 bg-gray-50 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">
                    No products found matching your criteria.
                </p>
                <Button 
                    variant="outline" 
                    onClick={() => {
                        setSearchQuery('');
                        router.push('/shop');
                    }}
                >
                    Clear Filters
                </Button>
                </div>
             )}
         </div>
      </div>
    </div>
  );
}
