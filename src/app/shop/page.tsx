import { createClient } from '@supabase/supabase-js';
import ShopClientWrapper from '@/components/shop/ShopClientWrapper';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';

export const revalidate = 60; // Revalidate every minute, or 0 for dynamic

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Cache categories with active products (changes rarely)
const getCachedCategories = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, image_url, description, is_featured, products!inner(id)')
      .eq('products.is_active', true)
      .order('name');
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      image_url: item.image_url,
      description: item.description,
      is_featured: item.is_featured,
    }));
  },
  ['shop-categories'],
  { revalidate: 60 }
);

// Cache brands with active products (changes rarely)
const getCachedBrands = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('brands')
      .select('id, name, slug, image_url, is_featured, products!inner(id)')
      .eq('products.is_active', true)
      .order('name');
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      image_url: item.image_url,
      is_featured: item.is_featured,
    }));
  },
  ['shop-brands'],
  { revalidate: 60 }
);

// Cache all product category_ids for sidebar counts (changes rarely)
const getCachedProductCounts = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('products')
      .select('category_id')
      .eq('is_active', true);
    const counts: Record<string, number> = {};
    if (data) {
      data.forEach((p: any) => {
        if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      });
      counts['all'] = data.length;
    }
    return counts;
  },
  ['shop-product-counts'],
  { revalidate: 60 }
);

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug = typeof params.category === 'string' ? params.category : undefined;
  const audience = typeof params.audience === 'string' ? params.audience : undefined;
  const searchQuery = typeof params.q === 'string' ? params.q : undefined;

  let title = 'Shop All | Royal Perfumes';
  let description = 'Browse our extensive collection of luxury perfumes and body care products.';

  if (categorySlug) {
    const categories = await getCachedCategories();
    const category = categories.find((c: any) => c.slug === categorySlug);
    if (category) {
      title = `${category.name} | Royal Perfumes`;
      if (category.description) {
        description = category.description;
      }
    }
  } else if (audience) {
    title = `${audience}'s Collection | Royal Perfumes`;
    description = `Shop exclusive fragrances for ${audience}.`;
  } else if (searchQuery) {
    title = `Search Results for "${searchQuery}" | Royal Perfumes`;
    description = `Search results for ${searchQuery} at Royal Perfumes.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function ShopPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams;
  const supabase = getSupabase();

  // Params
  const categorySlug = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const audience = typeof searchParams.audience === 'string' ? searchParams.audience : undefined;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const filter = typeof searchParams.filter === 'string' ? searchParams.filter : undefined;
  const perfumeType = typeof searchParams.type === 'string' ? searchParams.type : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1. Load cached Categories, Brands, and product counts
  const [categories, brands] = await Promise.all([
    getCachedCategories(),
    getCachedBrands(),
  ]);

  if (!categories || !brands) {
      return <div>Error loading data</div>;
  }

  // 2. Determine Category ID if slug is present
  let categoryId: string | undefined;
  if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
          categoryId = category.id;
      } else {
          // Fallback: It might be a valid category but with no active products (filtered out above)
          const { data: fallbackCategory } = await supabase
             .from('categories')
             .select('id')
             .eq('slug', categorySlug)
             .single();
          
          if (fallbackCategory) {
              categoryId = fallbackCategory.id;
          } else {
              notFound();
          }
      }
  }

  // Determine Brand IDs from slugs
  const brandSlugs = typeof searchParams.brands === 'string' ? searchParams.brands.split(',') : [];
  let brandIds: string[] = [];
  if (brandSlugs.length > 0) {
      brandIds = brands.filter(b => brandSlugs.includes(b.slug)).map(b => b.id);
  }

  // 3. Build Product Query
  let query = supabase
    .from('products')
    .select('*, product_variants(*)', { count: 'exact' })
    .eq('is_active', true);

  if (categoryId) {
      query = query.eq('category_id', categoryId);
  }
  
  if (brandIds.length > 0) {
      query = query.in('brand_id', brandIds);
  }

  if (perfumeType) {
      query = query.eq('type', perfumeType);
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

  // 4. Pagination & Sorting
  query = query.range(from, to);
  
  if (filter === 'new') {
      query = query.order('created_at', { ascending: false });
  } else if (filter === 'best') {
      query = query.order('sales_count', { ascending: false });
  } else {
      query = query.order('created_at', { ascending: false }); // Default sorting
  }

  const { data: products, count, error } = await query;

  if (error) {
      console.error("Shop Query Error:", error);
      return <div>Error loading products</div>;
  }

  const totalProducts = count || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  // 5. Load cached product counts for Sidebar
  const productCounts = await getCachedProductCounts();

  return (
    <div className="container py-8 md:py-12">
      <ShopClientWrapper
        products={products || []}
        categories={categories}
        brands={brands}
        productCounts={productCounts}
        initialCategorySlug={categorySlug}
        initialAudience={audience}
        initialBrands={brandSlugs}
        initialType={perfumeType}
        initialFilter={filter}
        pagination={{
            page,
            totalPages,
            hasMore: page < totalPages
        }}
      />
    </div>
  );
}
