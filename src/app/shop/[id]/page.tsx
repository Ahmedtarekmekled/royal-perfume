import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import ProductGallery from '@/components/shop/ProductGallery';
import ProductActions from '@/components/shop/ProductActions';
import { Badge } from '@/components/ui/badge';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*)
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    console.error('Error fetching product:', error);
    notFound();
  }

  // Determine Price Display
  let priceDisplay = null;
  let hasDiscount = false;
  let finalPrice = product.price;

  if (product.has_variants && product.product_variants && product.product_variants.length > 0) {
      const prices = product.product_variants.map((v: any) => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
          priceDisplay = <span className="text-2xl font-medium">{formatCurrency(minPrice)}</span>;
      } else {
          priceDisplay = (
              <span className="text-2xl font-medium">
                  {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
              </span>
          );
      }
      // Check if any variant is in stock for global stock status
      if (!product.stock) {
           // Should we override product.stock based on variants?
           // The import logic sets product.stock = true if any variant is in stock.
           // So relying on product.stock *should* be fine if data is consistent.
           // Let's trust product.stock for now.
      }
  } else {
      // Standard Product Logic
      hasDiscount = product.discount > 0;
      finalPrice = hasDiscount 
        ? product.price * (1 - product.discount / 100)
        : product.price;

      priceDisplay = hasDiscount ? (
        <div className="flex items-center gap-4">
           <span className="text-muted-foreground line-through text-xl">
            {formatCurrency(product.price)}
           </span>
           <span className="text-2xl font-medium">{formatCurrency(finalPrice)}</span>
        </div>
      ) : (
        <span className="text-2xl font-medium">{formatCurrency(product.price)}</span>
      );
  }

  return (
    <div className="container py-12 md:py-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
        {/* Left: Gallery */}
        <div>
           <ProductGallery images={product.images || []} name={product.name_en} />
        </div>

        {/* Right: Details */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
               {hasDiscount && <Badge variant="destructive">Sale {product.discount}% OFF</Badge>}
               {!product.stock && <Badge variant="secondary">Out of Stock</Badge>}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-medium text-foreground mb-4">
              {product.name_en}
            </h1>
            
            <div>
              {priceDisplay}
            </div>
          </div>

          <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground">
            <p>{product.description_en}</p>
          </div>

          <div className="pt-8 border-t">
            <ProductActions 
              product={{
                id: product.id,
                name: product.name_en,
                price: finalPrice, // Base price for actions
                images: product.images || [],
                stock: product.stock,
                has_variants: product.has_variants
              }} 
              initialVariants={product.product_variants || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
