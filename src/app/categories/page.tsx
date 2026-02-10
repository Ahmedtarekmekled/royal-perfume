

import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export default async function CategoriesPage() {
  const supabase = await createClient();

  // 1. Fetch Categories with their active products (limit 1 to get an image)
  // Supabase doesn't support complex joins in one simple SDK call easily for "has at least one",
  // so we might need a workaround or specific query.
  // Best approach with simple SDK: Fetch categories, then fetch a map of images/counts?
  // Or: Fetch all active products (lightweight selection) and aggregate in JS?
  // Given standard product counts (<1000), fetching all active products 'id, category_id, image_url' is efficient enough.

  // Fetch all active products to determine populated categories and get an image
  const { data: products } = await supabase
    .from('products')
    .select('category_id, images, is_active')
    .eq('is_active', true);

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (!categories || !products) {
    return <div className="p-12 text-center">Error loading categories.</div>;
  }

  // 2. Filter Categories & Assign Images
  const populatedCategories = categories
    .map(category => {
      // Find products in this category
      const categoryProducts = products.filter(p => p.category_id === category.id);
      
      // If no active products, return null (to be filtered out)
      if (categoryProducts.length === 0) return null;

      // Get first image from first product as cover
      // Handle the fact that 'images' is an array of strings in JSONB or text[]
      let coverImage = null;
      if (categoryProducts[0].images && Array.isArray(categoryProducts[0].images) && categoryProducts[0].images.length > 0) {
          coverImage = categoryProducts[0].images[0];
      } else if (typeof categoryProducts[0].images === 'string') {
          // Fallback if somehow stored as string
          coverImage = categoryProducts[0].images;
      }

      // Default fallback if no product has image
      if (!coverImage) {
          coverImage = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop';
      }

      return {
        ...category,
        coverImage
      };
    })
    .filter(Boolean) as (typeof categories[0] & { coverImage: string })[];

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-heading font-medium">Our Collections</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
          Explore our exclusive range of fragrances, crafted for every personality and occasion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {populatedCategories.map((category) => (
          <Link 
            key={category.id} 
            href={`/shop?category=${category.slug}`}
            className="group relative aspect-square w-full overflow-hidden block bg-gray-100"
          >
            <Image
              src={category.coverImage}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Black Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 border-white/0 transition-all duration-300 group-hover:border-[1px] group-hover:border-white/20 m-4">
              <h2 className="text-3xl md:text-4xl font-heading text-white mb-4 tracking-wide drop-shadow-md">
                {category.name}
              </h2>
              <Button 
                variant="outline" 
                className="mt-4 border-white text-white hover:bg-white hover:text-black transition-colors opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 duration-500"
              >
                Explore Collection
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
