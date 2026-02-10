
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-24 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
          The Essence of Royalty
        </h1>
        <p className="text-xl text-muted-foreground font-light leading-relaxed">
          Crafting exclusive fragrances for those who appreciate the finer things in life.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative h-[400px] md:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
             {/* Placeholder for About Image - Using a colored div/text if no image */}
             <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                <span className="font-heading text-lg">Our Heritage</span>
             </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-heading font-semibold">Our Story</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Founded with a passion for perfumery, Royal Perfumes has dedicated itself to the art of scent. 
            We believe that a fragrance is more than just a smell; it is an identity, a memory, and a statement.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our master perfumers travel the globe to source the rarest ingredients—from the oud of the East 
            to the florals of the West. Each bottle is a testament to our commitment to quality, luxury, 
            and timeless elegance.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="grid md:grid-cols-3 gap-8 pt-12">
        <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-heading font-medium">Authenticity</h3>
            <p className="text-gray-500">100% original and ethically sourced ingredients.</p>
        </div>
        <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-heading font-medium">Craftsmanship</h3>
            <p className="text-gray-500">Blended by expert noses with decades of experience.</p>
        </div>
        <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-heading font-medium">Exclusivity</h3>
            <p className="text-gray-500">Limited edition collections for the discerning few.</p>
        </div>
      </div>
    </div>
  );
}
