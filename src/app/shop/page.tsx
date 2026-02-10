import { createClient } from '@/utils/supabase/server';
import ProductCard from '@/components/shared/ProductCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const revalidate = 0; // Ensure fresh data on navigation

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = await createClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // Build Query
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Apply Filter
  const selectedCategorySlug = searchParams.category;
  let selectedCategoryName = 'All Collection';

  if (selectedCategorySlug && categories) {
    const category = categories.find((c) => c.slug === selectedCategorySlug);
    if (category) {
      query = query.eq('category_id', category.id);
      selectedCategoryName = category.name;
    }
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return <div>Error loading products. Please try again later.</div>;
  }

  return (
    <div className="container py-12 min-h-screen">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
          <div>
            <h3 className="font-heading text-xl mb-4">Categories</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/shop">
                <Button
                  variant={!selectedCategorySlug ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  All Products
                </Button>
              </Link>
              {categories?.map((cat) => (
                <Link key={cat.id} href={`/shop?category=${cat.slug}`}>
                  <Button
                    variant={
                      selectedCategorySlug === cat.slug ? 'default' : 'ghost'
                    }
                    className="w-full justify-start"
                  >
                    {cat.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-heading mb-2">{selectedCategoryName}</h1>
            <p className="text-muted-foreground">
              {products?.length} products found
            </p>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No products found in this category.
              </p>
              <Link href="/shop" className="mt-4 inline-block">
                <Button variant="outline">View all products</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
