import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import ProductGallery from '@/components/shop/ProductGallery';
import ProductActions from '@/components/shop/ProductActions';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';

export const revalidate = 60;

interface PageProps {
  params: {
    slug: string;
  };
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Resolve a product by slug first, fall back to UUID for backward compat */
async function getProduct(slugOrId: string) {
  const supabase = getSupabase();

  // Try slug first
  const { data: bySlug } = await supabase
    .from('products')
    .select('*, product_variants(*), categories(name), brands(name)')
    .eq('slug', slugOrId)
    .single();

  if (bySlug) return bySlug;

  // Fallback: try by UUID (handles old bookmarked / shared links)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (isUuid) {
    const { data: byId } = await supabase
      .from('products')
      .select('*, product_variants(*), categories(name), brands(name)')
      .eq('id', slugOrId)
      .single();

    // If the product has a slug now, redirect to the canonical URL
    if (byId?.slug) return { ...byId, _redirect: byId.slug };
    return byId;
  }

  return null;
}

/** Cached version of getProduct — reuses data across generateMetadata + page render */
const getCachedProduct = (slugOrId: string) =>
  unstable_cache(
    () => getProduct(slugOrId),
    [`product-${slugOrId}`],
    { revalidate: 60 }
  )();

/** Cached hide_prices setting — shares the same cache key as the layout */
const getCachedSettings = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('system_settings')
      .select('hide_prices')
      .eq('id', 'global')
      .single();
    return data;
  },
  ['layout-settings'],
  { revalidate: 60 }
);

/** Ensure an image URL is always absolute */
function toAbsoluteUrl(url: string | undefined | null, siteUrl: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) return { title: 'Product Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.royalperfumes.company';
  const ogImageUrl = toAbsoluteUrl(product.images?.[0], siteUrl);

  return {
    title: product.name_en,
    description: product.description_en?.substring(0, 160) || 'Explore our luxury perfumes.',
    alternates: {
      canonical: `${siteUrl}/shop/${product.slug || slug}`,
    },
    openGraph: {
      title: product.name_en,
      description: product.description_en?.substring(0, 160) || 'Explore our luxury perfumes.',
      images: ogImageUrl ? [{ url: ogImageUrl, width: 800, height: 800, alt: product.name_en }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name_en,
      description: product.description_en?.substring(0, 160) || 'Explore our luxury perfumes.',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) notFound();

  // Redirect old UUID links to the slug URL
  if ((product as any)._redirect) {
    redirect(`/shop/${(product as any)._redirect}`);
  }

  const settings = await getCachedSettings();
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
    finalPrice = hasDiscount ? product.price - product.discount : product.price;

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
  const imageUrl = toAbsoluteUrl(product.images?.[0], siteUrl);
  const brandName = (product as any).brands?.name || 'Royal Perfumes';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_en,
    description: product.description_en || 'Luxury perfume from Royal Perfumes.',
    image: imageUrl,
    url: `${siteUrl}/shop/${canonicalSlug}`,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/shop/${canonicalSlug}`,
      priceCurrency: 'QAR',
      price: finalPrice,
      availability: product.stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Royal Perfumes',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'QA',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'QAR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'QA',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
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
                {hasDiscount && <Badge variant="destructive">Sale</Badge>}
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
