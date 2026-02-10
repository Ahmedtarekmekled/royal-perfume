
import { createClient } from '@/utils/supabase/server';
import ShopClientWrapper from '@/components/shop/ShopClientWrapper';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every minute, or 0 for dynamic

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ShopPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  // Params
  const categorySlug = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const audience = typeof searchParams.audience === 'string' ? searchParams.audience : undefined;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1. Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (!categories) {
      return <div>Error loading categories</div>;
  }

  // 2. Determine Category ID if slug is present
  let categoryId: string | undefined;
  if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
          categoryId = category.id;
      } else {
          notFound();
      }
  }

  // 3. Build Product Query
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  if (categoryId) {
      query = query.eq('category_id', categoryId);
  }

  if (audience) {
      if (audience === 'Men') {
         query = query.in('target_audience', ['Men', 'Unisex']);
      } else if (audience === 'Women') {
         query = query.in('target_audience', ['Women', 'Unisex']);
      } else {
         query = query.eq('target_audience', audience);
      }
  }

  if (searchQuery) {
      query = query.or(`name_en.ilike.%${searchQuery}%,description_en.ilike.%${searchQuery}%`);
  }

  // 4. Pagination
  query = query.range(from, to).order('created_at', { ascending: false });

  const { data: products, count, error } = await query;

  if (error) {
      console.error("Shop Query Error:", error);
      return <div>Error loading products</div>;
  }

  const totalProducts = count || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  // 5. Fetch Product Counts for Sidebar
  const { data: allProductsForCounts } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_active', true);

  const productCounts: Record<string, number> = {};
  if (allProductsForCounts) {
      allProductsForCounts.forEach(p => {
          if (p.category_id) {
              productCounts[p.category_id] = (productCounts[p.category_id] || 0) + 1;
          }
      });
  }

  return (
    <div className="container py-8 md:py-12">
      <ShopClientWrapper
        products={products || []}
        categories={categories}
        productCounts={productCounts}
        initialCategorySlug={categorySlug}
        initialAudience={audience}
        pagination={{
            page,
            totalPages,
            hasMore: page < totalPages
        }}
      />
    </div>
  );
}
