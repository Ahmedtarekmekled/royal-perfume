'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import LightRays from './LightRays';
import { GridBackground } from '@/components/ui/grid-background';
import { motion } from 'framer-motion';

export default function Hero() {
  const headingText = "Essence of Royalty";
  const letters = Array.from(headingText);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08, 
        delayChildren: 0.6 
      },
    },
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(4px)',
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <section className="relative h-[65vh] md:h-[75vh] min-h-[440px] md:min-h-[520px] w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Grid Background (base layer) + Light Rays (animated, on top) */}
      <GridBackground />
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-55">
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-full text-center w-full px-4 gap-1 pb-6 md:pb-12 mt-0">
        {/* Logo Image */}
        <div className="relative w-44 sm:w-56 md:w-80 lg:w-96 mb-0 animate-in fade-in duration-1000 pointer-events-none">
          <Image
            src="/images/hero1.PNG"
            alt="Royal Perfumes Logo"
            width={400}
            height={400}
            className="w-full h-auto object-contain drop-shadow-2xl"
            priority
            fetchPriority="high"
          />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center gap-4 max-w-3xl">
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-heading text-white font-medium tracking-tight drop-shadow-2xl flex"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {letters.map((letter, index) => (
              <motion.span variants={childVariants} key={index}>
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-xs md:text-base text-gray-300 font-body font-light tracking-wide"
          >
            Premium Fragrance Manufacturer &amp; Wholesale Supplier
          </motion.p>
        </div>
        
        {/* Buttons */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 1 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4 relative z-20"
        >
          <Link href="/shop">
            <Button
                size="default"
                className="bg-white text-black hover:bg-gray-200 text-sm px-6 py-4 rounded-none font-body tracking-wider transition-all duration-300 transform hover:scale-105"
            >
              Wholesale Collection
            </Button>
          </Link>
          <Link href="/about">
            <Button
                variant="outline"
                size="default"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black text-sm px-6 py-4 rounded-none font-body tracking-wider transition-all duration-300"
            >
              Our Story
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
