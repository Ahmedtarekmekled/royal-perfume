'use client';

interface BrandTickerProps {
  brands?: { name: string }[];
}

export default function BrandTicker({ brands = [] }: BrandTickerProps) {
  // Fallback if no brands provided (though page should provide them)
  const displayBrands = brands.length > 0 
    ? brands.map(b => b.name) 
    : ["CHANEL", "DIOR", "CREED", "TOM FORD", "GUCCI", "VERSACE", "YSL", "ARMANI"];

  return (
    <div className="w-full bg-white border-b border-gray-100 overflow-hidden py-6 md:py-8">
      <div className="flex whitespace-nowrap animate-scroll">
        {/* First Loop */}
        <div className="flex items-center gap-16 md:gap-24 px-8 md:px-12 animate-marquee">
          {displayBrands.map((brand, index) => (
            <span key={`${brand}-1-${index}`} className="text-xl md:text-2xl font-heading font-medium tracking-widest text-gray-900 opacity-80 uppercase">
              {brand}
            </span>
          ))}
        </div>
        {/* Second Loop (Duplicate for seamless scroll) */}
        <div className="flex items-center gap-16 md:gap-24 px-8 md:px-12 animate-marquee" aria-hidden="true">
          {displayBrands.map((brand, index) => (
            <span key={`${brand}-2-${index}`} className="text-xl md:text-2xl font-heading font-medium tracking-widest text-gray-900 opacity-80 uppercase">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
