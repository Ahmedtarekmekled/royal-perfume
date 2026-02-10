

import { createClient } from '@/utils/supabase/server';
import Hero from "@/components/shared/Hero";
import BrandTicker from '@/components/home/brand-ticker';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift } from 'lucide-react';

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  // Fetch Best Sellers
  const { data: bestSellers } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .range(0, 3)
    .order('created_at', { ascending: false });

  const collections = [
      {
          label: 'Men\'s Collection',
          audience: 'Men',
          image: '/images/mens-collection.jpg',
      },
      {
          label: 'Women\'s Collection',
          audience: 'Women',
          image: '/images/womens-collection.jpg',
      },
      {
          label: 'Unisex Collection',
          audience: 'Unisex',
          image: '/images/unisex-collection.jpg',
      }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <Hero />
      
      {/* 2. Brand Ticker */}
      <BrandTicker />

      {/* 3. Gender Collections Grid */}
      <section className="py-20 container">
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
                  className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 group-hover:grayscale-0 transition-all"
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
      </section>

      {/* 4. Best Sellers */}
      <section className="py-20 md:py-28 bg-gray-50">
          <div className="container">
            <div className="flex items-end justify-between mb-12">
                <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-heading font-medium">Best Sellers</h2>
                    <p className="text-muted-foreground font-body text-lg">Our most loved fragrances.</p>
                </div>
                <Link href="/shop" className="hidden md:flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4">
                    View All <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
                {bestSellers?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

             <div className="mt-12 flex justify-center md:hidden">
                <Link href="/shop">
                    <Button variant="outline" className="w-full">View All Products</Button>
                </Link>
            </div>
          </div>
      </section>

      {/* 5. Gift Tier Banner */}
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

      {/* 6. The Art of Scent (About) */}
      <section className="py-24 md:py-32 bg-white">
          <div className="container max-w-4xl text-center space-y-8">
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Since 2024</span>
              <h2 className="text-4xl md:text-6xl font-heading font-medium leading-tight">
                  The Art of Scent
              </h2>
              <div className="space-y-6 text-lg md:text-xl text-gray-600 font-body leading-relaxed">
                  <p>
                      At Royal Perfumes, we believe that fragrance is more than just a scent—it is an emotion, a memory, and a statement of identity.
                  </p>
                  <p>
                      Our collections are meticulously crafted using the rarest ingredients from around the world, blending tradition with modern artistry to create olfactory masterpieces that linger on the skin and in the mind.
                  </p>
              </div>
              <div className="pt-8">
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="rounded-none px-10 py-6 border-black text-black hover:bg-black hover:text-white transition-colors text-lg">Our Story</Button>
                  </Link>
              </div>
          </div>
      </section>
    </div>
  );
}
