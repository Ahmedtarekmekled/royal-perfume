import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.royalperfumes.company';
  
  // Use a public client for sitemap generation to avoid cookie dependencies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Base Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 2. Fetch Dynamic Data
  const [
    { data: categories },
    { data: products }
  ] = await Promise.all([
    supabase.from('categories').select('id, slug, created_at'),
    supabase.from('products').select('id, slug, created_at').eq('is_active', true)
  ]);

  // 3. Map Dynamic Routes
  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${siteUrl}/categories/${cat.slug || cat.id}`,
    lastModified: cat.created_at ? new Date(cat.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${siteUrl}/shop/${product.slug || product.id}`,
    lastModified: product.created_at ? new Date(product.created_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 4. Combine and Return
  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
