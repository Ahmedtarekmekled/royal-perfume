import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative flex h-[80vh] w-full items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Overlay - Replace with actual image later */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1595123550441-d377e017de6a?q=80&w=2673&auto=format&fit=crop')] bg-cover bg-center" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container flex flex-col items-center text-center gap-6">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-semibold tracking-tight animate-fade-in-up">
          Royal Perfumes
        </h1>
        <p className="text-xl md:text-2xl font-light text-gray-200 max-w-2xl animate-fade-in-up delay-100">
          Discover the essence of elegance. Handcrafted scents for the distinguished.
        </p>
        <div className="flex gap-4 mt-8 animate-fade-in-up delay-200">
          <Link href="/shop">
            <Button size="lg" className="px-8 py-6 text-lg bg-white text-black hover:bg-gray-200 transition-colors">
              Shop Collection
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-white text-white hover:bg-white hover:text-black transition-colors">
              Our Story
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
