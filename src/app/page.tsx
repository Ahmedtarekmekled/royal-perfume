

import { createClient } from '@/utils/supabase/server';
import Hero from "@/components/shared/Hero";
import BrandTicker from '@/components/home/brand-ticker';
import Link from 'next/link';
import Image from 'next/image';
import ProductCarousel from '@/components/home/product-carousel';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, Truck, Shield, Clock } from 'lucide-react';
import CategoryCarousel from '@/components/home/category-carousel';
import RoyalBreaker from '@/components/home/royal-breaker';

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  // Fetch Best Sellers (random 8 active products)
  const { data: bestSellers } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(8);

  // Fetch New Arrivals (last 8 created)
  const { data: newArrivals } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  // Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // Fetch Brands (Featured)
  const { data: brands } = await supabase
    .from('brands')
    .select('name')
    .eq('is_featured', true)
    .order('name');

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── 1. Hero Section (Full Screen) ── */}
      <Hero />

      {/* ── 2. Brand Ticker (Infinite Loop) ── */}
      <BrandTicker brands={brands || []} />

      {/* ── 3. Gender Collection (Men / Women / Unisex) ── */}
      <section className="py-24 md:py-32 w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      {/* ── 4. Shop by Category (Carousel) ── */}
      <section className="py-24 md:py-32 w-full bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      {/* ── 5. Best Sellers (Product Carousel) ── */}
      <section className="py-24 md:py-32 w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="mt-12 flex justify-center md:hidden">
            <Link href="/shop">
              <Button variant="outline" className="w-full">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. The Royal Breaker ── */}
      <RoyalBreaker />

      {/* ── 7. New Arrivals (Product Carousel) ── */}
      <section className="py-24 md:py-32 w-full bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="mt-12 flex justify-center md:hidden">
            <Link href="/shop">
              <Button variant="outline" className="w-full">
                Shop New Arrivals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Royal Gifts Banner ── */}
      <section className="bg-black text-white py-16 md:py-20">
        <div className="container flex flex-col items-center text-center space-y-6">
          <Gift className="h-12 w-12 text-white/90" />
          <h2 className="text-3xl md:text-4xl font-heading font-medium tracking-wide">
            Complimentary Royal Gifts
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl font-body font-light">
            Receive an exclusive travel-size perfume with every order over $500.
          </p>
        </div>
      </section>

      {/* ── 9. Shipping Info ── */}
      <Link href="/shipping" className="block">
        <section className="py-12 md:py-16 w-full border-y border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div className="flex flex-col items-center text-center space-y-3">
                <Truck className="h-8 w-8 md:h-10 md:w-10 text-black" />
                <div>
                  <h3 className="font-heading text-sm md:text-base font-medium">Worldwide Shipping</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">
                    We deliver to your doorstep
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <Shield className="h-8 w-8 md:h-10 md:w-10 text-black" />
                <div>
                  <h3 className="font-heading text-sm md:text-base font-medium">Secure Packaging</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">
                    Premium protection guaranteed
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <Clock className="h-8 w-8 md:h-10 md:w-10 text-black" />
                <div>
                  <h3 className="font-heading text-sm md:text-base font-medium">Fast Delivery</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">
                    Express shipping available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Link>
    </div>
  );
}
