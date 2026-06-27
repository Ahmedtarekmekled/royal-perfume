import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import ProductGallery from '@/components/shop/ProductGallery';
import ProductActions from '@/components/shop/ProductActions';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const revalidate = 60;

interface PageProps {
  params: {
    slug: string;
  };
}

/** Resolve a product by slug first, fall back to UUID for backward compat */
async function getProduct(slugOrId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Try slug first
  const { data: bySlug } = await supabase
    .from('products')
    .select('*, product_variants(*), categories(name)')
    .eq('slug', slugOrId)
    .single();

  if (bySlug) return bySlug;

  // Fallback: try by UUID (handles old bookmarked / shared links)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (isUuid) {
    const { data: byId } = await supabase
      .from('products')
      .select('*, product_variants(*), categories(name)')
      .eq('id', slugOrId)
      .single();

    // If the product has a slug now, redirect to the canonical URL
    if (byId?.slug) return { ...byId, _redirect: byId.slug };
    return byId;
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: product } = await supabase
    .from('products')
    .select('name_en, description_en, images, slug')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single();

  if (!product) return { title: 'Product Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.royalperfumes.company';
  const ogImage = product.images?.[0];

  return {
    title: product.name_en,
    description: product.description_en?.substring(0, 160) || 'Explore our luxury perfumes.',
    alternates: {
      canonical: `${siteUrl}/shop/${product.slug || slug}`,
    },
    openGraph: {
      title: product.name_en,
      description: product.description_en?.substring(0, 160) || 'Explore our luxury perfumes.',
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name_en,
      description: product.description_en?.substring(0, 160) || 'Explore our luxury perfumes.',
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  // Redirect old UUID links to the slug URL
  if ((product as any)._redirect) {
    redirect(`/shop/${(product as any)._redirect}`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch Hide Prices Setting
  const { data: settings } = await supabase
    .from('system_settings')
    .select('hide_prices')
    .eq('id', 'global')
    .single();

  const hidePrices = settings?.hide_prices || false;

  // Determine Price Display
  let priceDisplay = null;
  let hasDiscount = false;
  let finalPrice = product.price;

  if (product.has_variants && product.product_variants && product.product_variants.length > 0) {
    const prices = product.product_variants.map((v: any) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    priceDisplay =
      minPrice === maxPrice ? (
        <span className="text-2xl font-medium">{formatCurrency(minPrice)}</span>
      ) : (
        <span className="text-2xl font-medium">
          {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
        </span>
      );
  } else {
    hasDiscount = product.discount > 0;
    finalPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

    priceDisplay = hasDiscount ? (
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground line-through text-xl">
          {formatCurrency(product.price)}
        </span>
        <span className="text-2xl font-medium">{formatCurrency(finalPrice)}</span>
      </div>
    ) : (
      <span className="text-2xl font-medium">{formatCurrency(product.price)}</span>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.royalperfumes.company';
  const canonicalSlug = product.slug || product.id;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_en,
    image: product.images?.[0] ? `${siteUrl}${product.images[0]}` : undefined,
    description: product.description_en,
    url: `${siteUrl}/shop/${canonicalSlug}`,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/shop/${canonicalSlug}`,
      priceCurrency: 'QAR',
      price: finalPrice,
      availability: product.stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-12 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
          {/* Left: Gallery */}
          <div>
            <ProductGallery images={product.images || []} name={product.name_en} />
          </div>

          {/* Right: Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                {hasDiscount && <Badge variant="destructive">Sale {product.discount}% OFF</Badge>}
                {!product.stock && <Badge variant="secondary">Out of Stock</Badge>}
              </div>

              <h1 className="text-4xl md:text-5xl font-heading font-medium text-foreground mb-2">
                {product.name_en}
              </h1>

              {product.categories && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {product.categories.name}
                  </span>
                </div>
              )}

              <div>
                {hidePrices ? (
                  <span className="text-xl text-muted-foreground italic">Contact for price</span>
                ) : (
                  priceDisplay
                )}
              </div>
            </div>

            <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground">
              <p>{product.description_en}</p>
            </div>

            <div className="pt-8 border-t">
              <ProductActions
                product={{
                  id: product.id,
                  name: product.name_en,
                  price: finalPrice,
                  images: product.images || [],
                  stock: product.stock,
                  has_variants: product.has_variants,
                }}
                initialVariants={product.product_variants || []}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
