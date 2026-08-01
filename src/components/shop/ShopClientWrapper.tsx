
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category, Brand } from '@/types';
import ShopSidebar from '@/components/shop/ShopSidebar';
import ProductCard from '@/components/shared/ProductCard';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface ShopClientWrapperProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  productCounts: Record<string, number>;
  initialCategorySlug?: string;
  initialAudience?: string;
  initialPopular?: boolean;
  initialBrands?: string[];
  initialFilter?: string;
  initialSeason?: string;
  seasonTitle?: string;
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
  initialPopular,
  initialBrands = [],
  initialFilter,
  initialSeason,
  seasonTitle,
  pagination,
}: ShopClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Initialize search query from URL
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 500);
  const [filter, setFilter] = useState<string | null>(initialFilter || null);

  // Infinite scroll state
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    // `products` is now always the full cumulative list from page 1 through
    // the current page, so we can just replace state directly.
    setAllProducts(products);
    setIsLoadingMore(false);
  }, [products]);

  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (isLoadingMore || isPending || !pagination.hasMore) return;

        setIsLoadingMore(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', (pagination.page + 1).toString());
        startTransition(() => {
          router.push(`/shop?${params.toString()}`, { scroll: false });
        });
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isLoadingMore, isPending, pagination.hasMore, pagination.page, router, searchParams]);

  // Debounced Search Update
  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (debouncedQuery !== currentQ) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedQuery) {
        params.set('q', debouncedQuery);
      } else {
        params.delete('q');
      }
      params.set('page', '1'); // Reset to page 1 on search
      
      startTransition(() => {
        router.push(`/shop?${params.toString()}`);
      });
    }
  }, [debouncedQuery, router, searchParams]);


  const selectedCategoryName = seasonTitle
    ? seasonTitle
    : initialCategorySlug
    ? categories.find(c => c.slug === initialCategorySlug)?.name
    : 'All Collection';

  const handleOptimisticNavigation = (url: string, options?: { scroll?: boolean }) => {
      startTransition(() => {
          router.push(url, options);
      });
  };

  const handleFilterChange = (url: string) => {
    startTransition(() => {
      router.push(url);
    });
  };

  const handleClearSeason = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('season');
    params.set('page', '1');
    startTransition(() => {
      router.push(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
    });
  };



  return (
    <div className="flex flex-col md:flex-row gap-8 pb-24 md:pb-0">
      {/* Mobile Filter Trigger */}
      <div className="md:hidden mb-4 flex justify-between items-center">
         <div className="text-2xl font-heading">{selectedCategoryName}</div>
         <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent 
                side="left" 
                className="w-[300px] sm:w-[400px]"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <SheetTitle className="sr-only">Filters</SheetTitle>
                <div className="py-6 h-[calc(100vh-100px)] overflow-y-auto">
                    <ShopSidebar
                        categories={categories}
                        brands={brands}
                        selectedCategory={initialCategorySlug || null}
                        selectedAudience={initialAudience || null}
                        selectedPopular={initialPopular || false}
                        selectedBrands={selectedBrands}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        productCounts={productCounts}
                        totalProducts={pagination.totalPages * 12} // Approximate or pass total count if needed
                        onNavigate={handleFilterChange}
                        selectedFilter={filter}
                    />
                </div>
            </SheetContent>
         </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <ShopSidebar
                categories={categories}
                brands={brands}
                selectedCategory={initialCategorySlug || null}
                selectedAudience={initialAudience || null}
                selectedPopular={initialPopular || false}
                selectedBrands={selectedBrands}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              productCounts={productCounts}
              totalProducts={pagination.totalPages * 12} // approximate
              onNavigate={handleFilterChange}
              selectedFilter={filter}
            />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
         {initialSeason && seasonTitle && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-4 py-2.5 text-sm">
               <span>
                  Viewing: <span className="font-medium">{seasonTitle}</span>
               </span>
               <button
                  type="button"
                  onClick={handleClearSeason}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
               >
                  <X className="h-3.5 w-3.5" />
                  Clear
               </button>
            </div>
         )}

         <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-heading mb-2">{selectedCategoryName}</h1>
            <p className="text-muted-foreground">
               Showing {allProducts.length} results
            </p>
         </div>

         <div className={`transition-opacity duration-300 ${isPending && !isLoadingMore ? 'opacity-50' : 'opacity-100'}`}>
             {allProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-6 px-3 md:px-0">
                    {allProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    </div>

                    {/* Sentinel for infinite scroll — observed instead of a scroll listener */}
                    {pagination.hasMore && <div ref={loadMoreSentinelRef} className="h-1" />}

                    {/* Loading Indicator for Infinite Scroll */}
                    {isLoadingMore && (
                        <div className="mt-12 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
