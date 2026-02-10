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
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    console.error('Error fetching product:', error);
    notFound();
  }

  // Calculate price if discount exists
  const finalPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="container py-12 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        {/* Left: Gallery */}
        <div>
           <ProductGallery images={product.images || []} name={product.name} />
        </div>

        {/* Right: Details */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
               {product.discount > 0 && <Badge variant="destructive">Sale {product.discount}% OFF</Badge>}
               {!product.stock && <Badge variant="secondary">Out of Stock</Badge>}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-medium text-foreground mb-4">
              {product.name}
            </h1>
            
            <div className="text-2xl font-medium flex items-center gap-4">
              {product.discount > 0 ? (
                <>
                  <span className="text-muted-foreground line-through text-xl">
                    {formatCurrency(product.price)}
                  </span>
                  <span>{formatCurrency(finalPrice)}</span>
                </>
              ) : (
                <span>{formatCurrency(product.price)}</span>
              )}
            </div>
          </div>

          <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground">
            <p>{product.description}</p>
          </div>

          <div className="pt-8 border-t">
            <ProductActions 
              product={{
                id: product.id,
                name: product.name,
                price: finalPrice,
                images: product.images || [],
                stock: product.stock
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
