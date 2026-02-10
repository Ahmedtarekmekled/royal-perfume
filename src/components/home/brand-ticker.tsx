
'use client';

export default function BrandTicker() {
  const brands = [
    "CHANEL", "DIOR", "CREED", "TOM FORD", "GUCCI", "VERSACE", 
    "YSL", "ARMANI", "GIVENCHY", "HERMÈS", "ROJA", "XERJOFF"
  ];

  return (
    <div className="w-full bg-white border-b border-gray-100 overflow-hidden py-6 md:py-8">
      <div className="flex whitespace-nowrap animate-scroll">
        {/* First Loop */}
        <div className="flex items-center gap-16 md:gap-24 px-8 md:px-12">
          {brands.map((brand, index) => (
            <span key={`${brand}-1-${index}`} className="text-xl md:text-2xl font-heading font-medium tracking-widest text-gray-900 opacity-80">
              {brand}
            </span>
          ))}
        </div>
        {/* Second Loop (Duplicate for seamless scroll) */}
        <div className="flex items-center gap-16 md:gap-24 px-8 md:px-12">
          {brands.map((brand, index) => (
            <span key={`${brand}-2-${index}`} className="text-xl md:text-2xl font-heading font-medium tracking-widest text-gray-900 opacity-80">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
