import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image - Cinematic B&W Luxury */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed filter brightness-[0.7] contrast-[1.1]"
        style={{
          backgroundImage: "url('/images/hero-luxury.png')"
        }}
      />
      
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 z-[1] bg-black/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading text-white font-medium tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Essence of Royalty
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 font-body font-light max-w-2xl mx-auto tracking-wide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Timeless elegance captured in every drop.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <Link href="/shop">
            <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-200 text-lg px-10 py-6 rounded-none font-body tracking-wider transition-all duration-300 transform hover:scale-105"
            >
              Shop Collection
            </Button>
          </Link>
          <Link href="/about">
            <Button 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none font-body tracking-wider transition-all duration-300"
            >
              Our Story
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
