'use client';

import { Category, Brand } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // Ensure this exists or use standard label
import { Search, User, UserCircle2, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

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
}: ShopSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBrandToggle = (brandSlug: string) => {
     const params = new URLSearchParams(searchParams.toString());
     const currentBrands = params.get('brands')?.split(',') || [];
     
     let newBrands;
     if (currentBrands.includes(brandSlug)) {
        newBrands = currentBrands.filter(b => b !== brandSlug);
     } else {
        newBrands = [...currentBrands, brandSlug];
     }

     if (newBrands.length > 0) {
        params.set('brands', newBrands.join(','));
     } else {
        params.delete('brands');
     }
     params.set('page', '1'); // Reset pagination
     
     router.push(`/shop?${params.toString()}`, { scroll: false });
  };

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

      <div className="space-y-4">
        {/* Gender/Audience */}
        <div className="space-y-3">
            <h3 className="text-lg font-heading font-semibold">Collection For</h3>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Men', value: 'Men', icon: User },
                    { label: 'Women', value: 'Women', icon: UserCircle2 },
                    { label: 'Unisex', value: 'Unisex', icon: Users },
                ].map((item) => {
                    const isSelected = selectedAudience === item.value;
                    const Icon = item.icon;
                    
                    return (
                        <Link 
                            key={item.value} 
                            href={`/shop?audience=${isSelected ? '' : item.value}`} 
                            scroll={false}
                            className="block"
                        >
                            <div className={cn(
                                "flex flex-col items-center justify-center gap-2 p-3 rounded-md border transition-all duration-200 aspect-square hover:border-black",
                                isSelected 
                                    ? "bg-black text-white border-black" 
                                    : "bg-white text-gray-900 border-gray-200"
                            )}>
                                <Icon className={cn("h-6 w-6", isSelected ? "text-white" : "text-gray-900")} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
            {/* Clear Filter Button if audience selected */}
            {selectedAudience && (
                <Link href="/shop" scroll={false} className="block">
                     <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-8">
                        Clear Gender Filter
                     </Button>
                </Link>
            )}
        </div>

        {/* Categories */}
        <div className="space-y-3">
            <h3 className="text-lg font-heading font-semibold">Categories</h3>
            <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="flex flex-col space-y-1">
                    <Link href="/shop" scroll={false}>
                        <Button
                        variant={!selectedCategory ? 'secondary' : 'ghost'}
                        className={cn("w-full justify-between font-body h-8 px-2 text-sm", !selectedCategory && "font-bold")}
                        >
                        All Categories
                        </Button>
                    </Link>
                    {categories.map((category) => {
                        const count = productCounts[category.id] || 0;
                        // Optional: Hide if 0 count? For now show all.
                        
                        return (
                            <Link key={category.id} href={`/shop?category=${category.slug}`} scroll={false}>
                                <Button
                                variant={selectedCategory === category.slug ? 'secondary' : 'ghost'}
                                className={cn(
                                    "w-full justify-between font-body h-8 px-2 text-sm", 
                                    selectedCategory === category.slug && "font-bold"
                                )}
                                >
                                {category.name}
                                <span className="text-xs text-muted-foreground ml-2">
                                    ({count})
                                </span>
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>

        {/* Brands */}
        <div className="space-y-3">
            <h3 className="text-lg font-heading font-semibold">Brands</h3>
             <ScrollArea className="h-[200px] border rounded-md p-2">
                 <div className="space-y-3 p-1">
                     {brands.length === 0 && <p className="text-sm text-muted-foreground">No brands available.</p>}
                     {brands.map((brand) => (
                         <div key={brand.id} className="flex items-center space-x-2">
                             <Checkbox 
                                id={`brand-${brand.id}`} 
                                checked={selectedBrands.includes(brand.slug)}
                                onCheckedChange={() => handleBrandToggle(brand.slug)}
                             />
                             <label 
                                htmlFor={`brand-${brand.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                             >
                                 {brand.name}
                             </label>
                         </div>
                     ))}
                 </div>
             </ScrollArea>
        </div>

      </div>
    </div>
  );
}
