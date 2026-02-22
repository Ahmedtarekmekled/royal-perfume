import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import LightRays from './LightRays';

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Light Rays Background */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffffff"
          raysSpeed={1}
          lightSpread={1}
          rayLength={4}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center w-full px-4 gap-1 pb-24 md:pb-40 mt-0">
        {/* Logo Image */}
        <div className="relative w-72 sm:w-80 md:w-[30rem] lg:w-[34rem] mb-0 animate-in fade-in duration-1000 pointer-events-none">
          <Image 
            src="/images/majed.png" 
            alt="Royal Perfumes Logo" 
            width={400}
            height={400}
            className="w-full h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center gap-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading text-white font-medium tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Essence of Royalty
          </h1>
          <p className="text-sm md:text-lg text-gray-300 font-body font-light tracking-wide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Timeless elegance captured in every drop.
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 relative z-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
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
