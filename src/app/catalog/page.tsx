import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import CatalogRequest from '@/components/catalog/CatalogRequest';
import { getBestSellers } from '@/lib/best-sellers';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Request Our Wholesale Catalog',
  description:
    'Request the Royal Perfumes wholesale catalog. Our full fragrance range with wholesale pricing, sent to you on WhatsApp or Telegram.',
  alternates: { canonical: '/catalog' },
  // Soft launch: reachable by direct link only. Remove this (and add the page
  // to sitemap.ts) once the page is approved for public launch.
  robots: { index: false, follow: false },
};

export default async function CatalogPage() {
  // Cookie-free client so the page stays ISR-cacheable (see home page).
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [bestSellers, products, brands, zones] = await Promise.all([
    getBestSellers(supabase, 10),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('brands').select('id', { count: 'exact', head: true }),
    supabase.from('shipping_zones').select('id', { count: 'exact', head: true }),
  ]);

  // The fanned cards need a photo, so skip best sellers without one.
  const bottles = bestSellers
    .filter((p) => p.images?.[0])
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: p.name_en, image: p.images![0] }));

  return (
    <CatalogRequest
      bottles={bottles}
      stats={{
        products: products.count ?? 0,
        brands: brands.count ?? 0,
        countries: zones.count ?? 0,
      }}
    />
  );
}
