
import { createClient } from '@/utils/supabase/server';
import ProductCard from '@/components/shared/ProductCard';
import ShopSidebar from '@/components/shop/ShopSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import ShopClientWrapper from '@/components/shop/ShopClientWrapper'; // Wrapper for client-side state

export const revalidate = 0;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = await createClient();

  // 1. Fetch All Active Products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // 2. Fetch All Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error || !products || !categories) {
    console.error('Error fetching shop data:', error);
    return <div>Error loading shop. Please try again later.</div>;
  }

  // 3. Smart Filter Logic (Server-Side Calculation)
  const productCounts: Record<string, number> = {};
  products.forEach(product => {
      if (product.category_id) {
          productCounts[product.category_id] = (productCounts[product.category_id] || 0) + 1;
      }
  });

  return (
    <div className="container py-8 md:py-12 min-h-screen">
       <ShopClientWrapper 
          products={products}
          categories={categories}
          productCounts={productCounts}
          initialCategorySlug={searchParams.category}
       />
    </div>
  );
}

