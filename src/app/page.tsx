

import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Hero from "@/components/shared/Hero";
import BrandTicker from '@/components/home/brand-ticker';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, Shield, Clock, Package, Crown } from 'lucide-react';
import CategoryCarousel from '@/components/home/category-carousel';
import dynamic from 'next/dynamic';
import ShinyText from '@/components/ui/shiny-text';
import { StarBorder } from '@/components/ui/star-border';
import SeasonalCollectionSection from '@/components/home/seasonal-collection-section';
import Container from '@/components/shared/Container';
import {
  getActiveSeasonalCollections,
  getSeasonalSectionSettings,
  resolveVisibleSeasonalCollections,
} from '@/lib/seasonal-collections-data';

const ProductCarousel = dynamic(() => import('@/components/home/product-carousel'), {
  loading: () => <div className="h-[400px] flex items-center justify-center">Loading...</div>,
  ssr: true,
});

const RoyalBreaker = dynamic(() => import('@/components/home/royal-breaker'), {
  ssr: true,
});
import ElegantSeparator from '@/components/ui/elegant-separator';

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function Home() {
  // Cookie-free client: this page only reads public data, and cookies() would
  // force fully dynamic (uncached) rendering, overriding `revalidate` above.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // These 4 queries are fully independent — run them concurrently instead of
  // awaiting each one in sequence.
  const [
    { data: bestSellers },
    { data: newArrivals },
    { data: categories },
    { data: brands },
    { data: shippingZones },
    seasonalCollections,
    seasonalSettings,
  ] = await Promise.all([
    // Best Sellers (top 8 active products by sales_count)
    supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('is_active', true)
      .order('sales_count', { ascending: false })
      .limit(8),
    // New Arrivals (last 8 created)
    supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    // Categories
    supabase.from('categories').select('*').order('name'),
    // Brands — no brands are currently flagged is_featured in the DB, which
    // silently emptied this ticker down to the hardcoded fallback names.
    // Use the same "has active products" pattern as the shop page's brand
    // list instead, so this shows real catalog data.
    supabase.from('brands').select('name, slug, products!inner(id)').eq('products.is_active', true).order('name').limit(24),
    // Country coverage for the tilted map in the Royal Breaker section.
    supabase.from('shipping_zones').select('country'),
    getActiveSeasonalCollections(),
    getSeasonalSectionSettings(),
  ]);

  const shippingCountries = (shippingZones || []).map((z) => z.country.toLowerCase());

  const visibleSeasonalCollections = resolveVisibleSeasonalCollections(
    seasonalCollections,
    seasonalSettings.seasonal_collections_multi_active
  );
  const seasonalPosition = seasonalSettings.seasonal_section_position;
  const seasonalSection = visibleSeasonalCollections.length > 0 ? (
    <SeasonalCollectionSection collections={visibleSeasonalCollections} />
  ) : null;

  const collections = [
    {
      label: "Men's Collection",
      audience: 'Men',
      image: '/images/mens-collection.png',
    },
    {
      label: "Women's Collection",
      audience: 'Women',
      image: '/images/womens-collection.png',
    },
    {
      label: 'Unisex Collection',
      audience: 'Unisex',
      image: '/images/unisex-collection.png',
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Royal Perfumes",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.royalperfumes.company",
    description: "Discover our exclusive collection of premium perfumes. Handcrafted scents for men and women.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.royalperfumes.company"}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── 1. Hero Section (Full Screen) ── */}
      <Hero />
      {seasonalPosition === 'after_hero' && seasonalSection}

      {/* ── 2. Brand Ticker (Infinite Loop) ── */}
      <BrandTicker brands={brands || []} />
      {seasonalPosition === 'after_brand_ticker' && seasonalSection}

      {/* ── 3. Gender Collection (Men / Women / Unisex) ── */}
      <section className="py-16 md:py-24 w-full">
        <h2 className="sr-only">Our Collections</h2>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((item) => (
              <Link
                key={item.label}
                href={`/shop?audience=${item.audience}`}
                className="group relative aspect-[3/4] overflow-hidden block"
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-all duration-700 group-hover:scale-105 filter grayscale contrast-125 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-3xl md:text-4xl font-heading text-white font-medium drop-shadow-md">
                    {item.label}
                  </h3>
                  <span className="mt-4 px-6 py-2 border border-white text-white text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                    Explore
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      {seasonalPosition === 'after_gender_collection' && seasonalSection}

      <ElegantSeparator />

      {/* ── 4. Shop by Category (Carousel) ── */}
      <section className="py-16 md:py-24 w-full bg-gray-50">
        <Container>
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-5xl font-heading font-medium">
              Shop by Category
            </h2>
            <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
              Explore our exquisite range of fragrances and body care products.
            </p>
          </div>

          {categories && categories.length > 0 ? (
            <CategoryCarousel categories={categories} />
          ) : (
            <div className="text-center text-muted-foreground py-10">
              No categories found.
            </div>
          )}
        </Container>
      </section>
      {seasonalPosition === 'after_category_carousel' && seasonalSection}

      <ElegantSeparator />

      {/* ── 5. Best Sellers (Product Carousel) ── */}
      <section className="py-16 md:py-24 w-full">
        <Container>
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-heading font-medium">
                Best Sellers
              </h2>
              <p className="text-muted-foreground font-body text-lg">
                Our most loved fragrances.
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {bestSellers && bestSellers.length > 0 ? (
            <ProductCarousel products={bestSellers} />
          ) : (
            <div className="text-center text-muted-foreground py-10">
              No products yet.
            </div>
          )}

          <div className="mt-12 flex justify-center md:hidden w-full max-w-sm mx-auto">
            <Link href="/shop" className="w-full">
              <StarBorder as="div" color="#000000" speed="3s" thickness={3} className="uppercase tracking-widest text-sm font-medium">
                View All Products
              </StarBorder>
            </Link>
          </div>
        </Container>
      </section>
      {seasonalPosition === 'after_best_sellers' && seasonalSection}

      <ElegantSeparator />

      {/* ── 7. New Arrivals (Product Carousel) ── */}
      <section className="py-16 md:py-24 w-full bg-gray-50">
        <Container>
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-heading font-medium">
                Just Arrived
              </h2>
              <p className="text-muted-foreground font-body text-lg">
                The latest additions to our collection.
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {newArrivals && newArrivals.length > 0 ? (
            <ProductCarousel products={newArrivals} />
          ) : (
            <div className="text-center text-muted-foreground py-10">
              No products yet.
            </div>
          )}

          <div className="mt-12 flex justify-center md:hidden w-full max-w-sm mx-auto">
            <Link href="/shop" className="w-full">
              <StarBorder as="div" color="#000000" speed="4s" thickness={2} className="uppercase tracking-widest text-sm font-medium">
                Shop New Arrivals
              </StarBorder>
            </Link>
          </div>
        </Container>
      </section>
      {seasonalPosition === 'after_new_arrivals' && seasonalSection}

      <ElegantSeparator className="opacity-30" />

      {/* ── 8. Wholesale Banner ── */}
      <section className="bg-black text-white py-8 md:py-10 relative overflow-hidden">
        {/* Subtle top decoration line */}
        <div className="absolute top-0 inset-x-0 h-[3px] md:h-[4px] bg-gradient-to-r from-red-900 via-red-800 to-red-900 opacity-60"></div>
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-red-900/10 blur-3xl rounded-full pointer-events-none"></div>

        <Container className="max-w-4xl flex flex-col items-center text-center space-y-5 md:space-y-6 relative z-10">

          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-heading font-medium tracking-wide flex justify-center">
              <ShinyText
                text="Volume Discounts"
                speed={2.5}
                color="#a3a3a3"
                shineColor="#ffffff"
                pauseOnHover={true}
              />
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-body font-light tracking-wide">
              More Volume &bull; Better Pricing &bull; Higher Margins
            </p>
          </div>

          {/* Tier grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 w-full">
            {[
              { pieces: '30+', label: 'PIECES', detail: 'Standard Wholesale Pricing', highlight: false },
              { pieces: '100+', label: 'PIECES', detail: '2.5% OFF', highlight: false },
              { pieces: '300+', label: 'PIECES', detail: '5% OFF', highlight: false },
              { pieces: '500+', label: 'PIECES', detail: '9% OFF Niche · 12% OFF Designer', highlight: true },
            ].map((tier) => (
              <div
                key={tier.pieces}
                className={`flex flex-col items-center justify-center gap-1 rounded-sm border px-2 py-3 md:py-4 transition-colors ${
                  tier.highlight
                    ? 'border-red-800/70 bg-gradient-to-b from-red-950/40 to-black'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <Package className={`h-4 w-4 mb-0.5 ${tier.highlight ? 'text-red-400' : 'text-gray-400'}`} strokeWidth={1.5} />
                <p className="font-heading text-base md:text-lg font-medium tracking-wide">
                  {tier.pieces} <span className="text-[10px] md:text-xs font-body font-normal tracking-widest text-gray-400">{tier.label}</span>
                </p>
                <p className={`text-[10px] md:text-xs font-body leading-snug ${tier.highlight ? 'text-red-300' : 'text-gray-400'}`}>
                  {tier.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Pallet orders & custom deals */}
          <div className="w-full max-w-xl border-t border-white/10 pt-4 space-y-1">
            <p className="font-heading text-xs md:text-sm uppercase tracking-widest text-gray-100">
              Pallet Orders &amp; Custom Deals
            </p>
            <p className="text-xs md:text-sm text-gray-400 font-body font-light leading-relaxed">
              Planning a larger order? Contact us directly for tailored pallet pricing and priority service.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-center gap-1.5 text-gray-200">
              <Crown className="h-3.5 w-3.5 text-red-400" strokeWidth={1.5} />
              <span className="font-heading text-xs md:text-sm tracking-widest uppercase">Royal Perfumes</span>
            </div>
            <p className="text-[11px] md:text-xs text-gray-400 font-body font-light tracking-wide">
              Premium Supply &bull; Higher Margins &bull; Built for Serious Wholesale Buyers
            </p>

            <div className="pt-1">
              <Button
                variant="outline"
                className="bg-gray-200 hover:bg-white text-black border-none rounded-none px-5 py-3 text-xs tracking-widest uppercase font-medium font-body transition-colors w-full sm:w-auto"
                asChild
              >
                <Link href="/shipping">PARTNER WITH ROYAL PERFUMES</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 9. Shipping Info ── */}
      <Link href="/shipping" className="block">
        <section className="py-16 w-full bg-white transition-colors cursor-pointer group">
          <h2 className="sr-only">Shipping & Delivery Information</h2>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              
              {/* Item 1 */}
              <div className="flex flex-col items-center text-center space-y-4 py-8 md:py-0 px-4">
                <Truck className="h-10 w-10 text-black stroke-[1.5] group-hover:scale-110 transition-transform duration-500" />
                <div className="space-y-2">
                  <h3 className="font-heading text-xl md:text-2xl font-medium tracking-wide">Worldwide Shipping</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs mx-auto">
                    We deliver our signature scents to your doorstep, wherever you are.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center text-center space-y-4 py-8 md:py-0 px-4">
                <Shield className="h-10 w-10 text-black stroke-[1.5] group-hover:scale-110 transition-transform duration-500" />
                <div className="space-y-2">
                  <h3 className="font-heading text-xl md:text-2xl font-medium tracking-wide">Secure Packaging</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs mx-auto">
                    Every bottle is encased in our premium protective packaging.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col items-center text-center space-y-4 py-8 md:py-0 px-4">
                <Clock className="h-10 w-10 text-black stroke-[1.5] group-hover:scale-110 transition-transform duration-500" />
                <div className="space-y-2">
                  <h3 className="font-heading text-xl md:text-2xl font-medium tracking-wide">Fast Delivery</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs mx-auto">
                    Express shipping options available for urgent gifts.
                  </p>
                </div>
              </div>

            </div>
            
            <div className="mt-12 text-center">
              <span className="inline-flex items-center text-sm font-medium border-b border-black pb-1 group-hover:text-gray-600 transition-colors">
                View Full Shipping Policy <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </div>
          </Container>
        </section>
      </Link>

       {/* ── 6. The Royal Breaker ── */}
      <RoyalBreaker shippingCountries={shippingCountries} />
      {seasonalPosition === 'before_footer' && seasonalSection}
    </div>
  );
}
