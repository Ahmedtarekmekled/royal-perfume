'use client';

import { useEffect, useRef, useState } from 'react';
import RoyalWorldMap from './RoyalWorldMap';
import Container from '@/components/shared/Container';

interface RoyalBreakerProps {
  /** Lowercased country names we ship to (from shipping_zones), used to
   *  highlight coverage in gold on the tilted map. */
  shippingCountries?: string[];
}

export default function RoyalBreaker({ shippingCountries = [] }: RoyalBreakerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="royal-breaker"
      className="relative flex flex-col justify-center md:flex-row md:items-center md:justify-start py-10 md:py-0 min-h-[300px] md:min-h-[440px] overflow-hidden bg-black"
    >
      {/* Background with parallax. `bg-fixed` is scrolled (not fixed) on
         mobile — background-attachment:fixed is unreliable inside an
         overflow-hidden, non-viewport-height element on mobile browsers
         and can render as a blank/white gap instead of the gradient. */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-scroll md:bg-fixed"
        style={{
          backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0a0a0a"/><stop offset="50%" style="stop-color:#1a1a1a"/><stop offset="100%" style="stop-color:#0d0d0d"/></linearGradient></defs><rect fill="url(#g)" width="800" height="600"/><circle cx="200" cy="300" r="250" fill="#111" opacity="0.5"/><circle cx="600" cy="200" r="300" fill="#000" opacity="0.4"/><circle cx="400" cy="500" r="200" fill="#151515" opacity="0.3"/></svg>`
          )}')`
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Mobile: a flat, uniform, very-low-opacity map sitting behind the
         text as a background watermark — no highlighting, no glow, no
         box. Oversized (scale-110) so it extends past the section's own
         edges instead of ending at a visible boundary, and masked with a
         soft radial vignette so it reads as atmosphere rather than a
         crisp, fully-legible political map. */}
      <div
        className={`md:hidden absolute inset-0 scale-110 transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 35%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 35%, transparent 85%)',
        }}
      >
        <RoyalWorldMap shippedCountries={shippingCountries} subtle />
      </div>

      {/* Desktop: white world map, flat/horizontal, filling the right
         side. The left fade is a CSS mask on the map itself (not a
         stacked gradient div on top of it), so the map's own pixels
         genuinely become transparent — no rectangle edge is ever
         composited. A blurred duplicate sits behind the sharp map so
         the glow blooms directly out of the highlighted countries. */}
      <div
        className={`hidden md:block md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[62%] transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="relative w-full h-full [mask-image:linear-gradient(to_right,transparent_0%,transparent_15%,black_55%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,transparent_15%,black_55%)]">
          <div className="absolute inset-0 blur-3xl scale-105 opacity-80">
            <RoyalWorldMap shippedCountries={shippingCountries} />
          </div>
          <div className="absolute inset-0 opacity-80">
            <RoyalWorldMap shippedCountries={shippingCountries} />
          </div>
        </div>
      </div>

      {/* Wholesale statement — routed through the site's shared Container
         so its left edge lines up with every other section's content
         (headings, product grids, etc.) instead of using its own ad-hoc
         padding. The map/background stay full-bleed; only this content
         is grid-aligned. */}
      <Container
        className={`relative z-10 text-center md:text-left transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="md:max-w-md lg:max-w-lg">
          <p className="text-xl md:text-2xl lg:text-3xl font-heading text-[#D4AF37] leading-snug">
            Wholesale fragrance delivered without borders, trusted by partners on every continent.
          </p>
          <span className="block mt-6 text-sm uppercase tracking-[0.3em] text-white/50">
            Royal Perfumes
          </span>
        </div>
      </Container>
    </section>
  );
}
