'use client';

import { Category, Brand } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShopSidebarProps {
  categories: Category[];
  brands: Brand[];
  selectedCategory: string | null;
  selectedAudience: string | null;
  selectedBrands: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  productCounts: Record<string, number>;
  totalProducts: number;
  onNavigate: (url: string, options?: { scroll?: boolean }) => void;
}

export default function ShopSidebar({
  categories,
  brands,
  selectedCategory,
  selectedAudience,
  selectedBrands,
  searchQuery,
  setSearchQuery,
  productCounts,
  totalProducts,
  onNavigate,
}: ShopSidebarProps) {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const [brandSearch, setBrandSearch] = useState('');
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  // Optimistic State
  const [optimisticBrands, setOptimisticBrands] = useState(selectedBrands);
  const [optimisticCategory, setOptimisticCategory] = useState(selectedCategory);
  const [optimisticAudience, setOptimisticAudience] = useState(selectedAudience);

  // Sync with props (external navigation)
  useEffect(() => {
      setOptimisticBrands(selectedBrands);
  }, [selectedBrands]);

  useEffect(() => {
      setOptimisticCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    setOptimisticAudience(selectedAudience);
  }, [selectedAudience]);

  const handleBrandToggle = (brandSlug: string) => {
     const params = new URLSearchParams(searchParams.toString());
     
     // Calculate based on optimistic state to ensure toggle logic works on current view
     const currentBrands = optimisticBrands; 
     
     let newBrands;
     if (currentBrands.includes(brandSlug)) {
        newBrands = currentBrands.filter(b => b !== brandSlug);
     } else {
        newBrands = [...currentBrands, brandSlug];
     }

     // 1. Optimistic Update
     setOptimisticBrands(newBrands);

     // 2. Navigation
     if (newBrands.length > 0) {
        params.set('brands', newBrands.join(','));
     } else {
        params.delete('brands');
     }
     params.set('page', '1'); // Reset pagination
     
     onNavigate(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleAudienceChange = (audience: string | null) => {
      // Optimistic Update
      setOptimisticAudience(audience);

      const params = new URLSearchParams(searchParams.toString());
      if (audience) {
          params.set('audience', audience);
      } else {
          params.delete('audience');
      }
      params.set('page', '1');
      onNavigate(`/shop?${params.toString()}`, { scroll: false });
  };

  // Filter brands for the sidebar list based on local search
  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="h-full md:border-r md:border-gray-100 md:pr-8 px-4 md:px-0">
      {/* Search - Always visible at top */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-0 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-6 border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black font-body text-base placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['gender', 'categories', 'brands']} className="w-full space-y-4">
        
        {/* 1. Gender / Collection */}
        <AccordionItem value="gender" className="border-none">
          <AccordionTrigger className="text-lg font-playfair font-semibold hover:no-underline py-2">
            Collection
          </AccordionTrigger>
          <AccordionContent className="pt-2">
             <div className="flex w-full border border-gray-200 rounded-sm overflow-hidden">
                {['Men', 'Women', 'Unisex'].map((item) => {
                    const isSelected = optimisticAudience === item;
                    return (
                        <button
                            key={item}
                            onClick={() => handleAudienceChange(isSelected ? null : item)}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium transition-colors",
                                isSelected 
                                    ? "bg-black text-white" 
                                    : "bg-white text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            {item}
                        </button>
                    )
                })}
             </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Categories */}
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="text-lg font-playfair font-semibold hover:no-underline py-2">
            Categories
          </AccordionTrigger>
          <AccordionContent className="pt-2">
             <div className="space-y-1">
                <Link 
                    href="/shop" 
                    scroll={false} 
                    className="block"
                    onClick={(e) => {
                        e.preventDefault();
                        setOptimisticCategory(null);
                        onNavigate('/shop', { scroll: false });
                    }}
                >
                     <div className={cn(
                         "flex items-center justify-between py-1.5 px-2 rounded-sm text-sm transition-colors cursor-pointer",
                         !optimisticCategory ? "bg-gray-100 font-medium" : "hover:bg-gray-50 text-gray-600"
                     )}>
                         <span>All Categories</span>
                         <span className="text-xs text-gray-400">{productCounts['all'] || totalProducts}</span> 
                     </div>
                </Link>
                {categories.map((category) => {
                    const count = productCounts[category.id] || 0;
                    const href = `/shop?category=${category.slug}`;
                    return (
                        <Link 
                            key={category.id} 
                            href={href} 
                            scroll={false} 
                            className="block"
                            onClick={(e) => {
                                e.preventDefault();
                                setOptimisticCategory(category.slug);
                                onNavigate(href, { scroll: false });
                            }}
                        >
                             <div className={cn(
                                 "flex items-center justify-between py-1.5 px-2 rounded-sm text-sm transition-colors cursor-pointer",
                                 optimisticCategory === category.slug ? "bg-gray-100 font-medium" : "hover:bg-gray-50 text-gray-600"
                             )}>
                                 <span>{category.name}</span>
                                 <span className="text-xs text-gray-400">({count})</span>
                             </div>
                        </Link>
                    );
                })}
             </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Brands */}
        <AccordionItem value="brands" className="border-none">
          <AccordionTrigger className="text-lg font-playfair font-semibold hover:no-underline py-2">
            Brands
          </AccordionTrigger>
          <AccordionContent className="pt-2">
             
             {/* Brand Search */}
             <div className="relative mb-3">
                 <Search className="absolute left-0 top-2.5 h-3 w-3 text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Filter brands..." 
                    className="w-full pl-5 py-2 text-xs border-b border-gray-200 focus:outline-none focus:border-black placeholder:text-gray-400 bg-transparent"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                 />
             </div>

             <ScrollArea className="h-[300px] pr-3">
                 {filteredBrands.length === 0 && <p className="text-xs text-gray-400 py-2">No brands found.</p>}
                 <div className="space-y-3">
                     {filteredBrands.map((brand) => (
                         <div key={brand.id} className="flex items-center space-x-3 group cursor-pointer">
                             <Checkbox 
                                id={`brand-${brand.id}`} 
                                checked={optimisticBrands.includes(brand.slug)}
                                onCheckedChange={() => handleBrandToggle(brand.slug)}
                             />
                             <label 
                                htmlFor={`brand-${brand.id}`}
                                className="flex-1 text-sm text-gray-700 group-hover:text-black cursor-pointer leading-none flex justify-between"
                             >
                                 <span>{brand.name}</span>
                             </label>
                         </div>
                     ))}
                 </div>
             </ScrollArea>

             {/* View All Button */}
             {brands.length > 20 && (
                <Dialog open={isViewAllOpen} onOpenChange={setIsViewAllOpen}>
                    <DialogTrigger asChild>
                        <button className="text-xs font-bold underline mt-4 hover:text-gray-600">
                             + View all {brands.length} brands
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
                        <DialogHeader className="pb-4 border-b">
                            <DialogTitle className="text-3xl font-playfair">All Brands</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto py-6">
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
                                {brands.sort((a,b) => a.name.localeCompare(b.name)).map((brand) => (
                                     <div key={brand.id} className="flex items-center space-x-2">
                                     <Checkbox 
                                        id={`dialog-brand-${brand.id}`} 
                                        checked={optimisticBrands.includes(brand.slug)}
                                        onCheckedChange={() => handleBrandToggle(brand.slug)}
                                     />
                                     <label 
                                        htmlFor={`dialog-brand-${brand.id}`}
                                        className="text-sm cursor-pointer hover:underline"
                                     >
                                         {brand.name}
                                     </label>
                                 </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-4 border-t flex justify-end">
                            <Button onClick={() => setIsViewAllOpen(false)}>Done</Button>
                        </div>
                    </DialogContent>
                </Dialog>
             )}

          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
