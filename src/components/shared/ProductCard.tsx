import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Assuming button exists, if not I will check
import { Badge } from '@/components/ui/badge'; // Assuming badge exists

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0] || '/placeholder.png'; // Fallback image

  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
        {product.discount > 0 && (
          <Badge className="absolute top-2 left-2 z-10 bg-black text-white rounded-none px-2 py-1">
            Sale
          </Badge>
        )}
        <Image
          src={mainImage}
          alt={product.name_en}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!product.stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-black font-medium uppercase tracking-widest text-sm bg-white px-3 py-1">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1 text-center">
        <h3 className="font-heading text-lg">{product.name_en}</h3>
        <div className="flex items-center justify-center gap-2 text-sm">
          {product.discount > 0 ? (
            <>
              <span className="text-muted-foreground line-through decoration-gray-400">
                {formatCurrency(product.price)}
              </span>
              <span className="font-medium">
                {formatCurrency(product.price * (1 - product.discount / 100))}
              </span>
            </>
          ) : (
            <span className="font-medium">{formatCurrency(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
