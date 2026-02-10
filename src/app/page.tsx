import Hero from "@/components/shared/Hero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      <section className="py-24 container">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-heading">Featured Collections</h2>
          <p className="text-muted-foreground">Curated for excellence.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Placeholder Categories - To be dynamic later */}
           {['Men', 'Women', 'Unisex'].map((category) => (
             <div key={category} className="group relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
               <div className="absolute inset-0 flex items-center justify-center z-20">
                 <h3 className="text-3xl font-heading text-white uppercase tracking-widest">{category}</h3>
               </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
