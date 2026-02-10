import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Assuming button exists, if not I will check
import { Badge } from '@/components/ui/badge'; // Assuming badge exists

interface ProductCardProps {
  product: Product;
}

import { Plus } from 'lucide-react';

export default function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0] || '/placeholder.png'; // Fallback image

  return (
    <Link href={`/shop/${product.id}`} className="group block h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 rounded-sm">
        {product.discount > 0 && (
          <Badge className="absolute top-2 left-2 z-10 bg-black text-white rounded-none px-1.5 py-0.5 text-[10px] md:text-xs md:px-2 md:py-1">
            Sale
          </Badge>
        )}
        <Image
          src={mainImage}
          alt={product.name_en}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {!product.stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-black font-medium uppercase tracking-widest text-[10px] md:text-sm bg-white px-2 py-1 md:px-3">Out of Stock</span>
          </div>
        )}
        
        {/* Mobile Add Button - Overlay */}
        <div className="absolute bottom-2 right-2 md:hidden">
            <Button size="icon" className="h-8 w-8 rounded-full bg-black/90 hover:bg-black shadow-md">
                <Plus className="h-4 w-4 text-white" />
            </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-1">
        <h3 className="font-heading text-sm md:text-lg font-bold leading-tight truncate md:text-center">{product.name_en}</h3>
        <div className="flex items-center justify-start md:justify-center gap-2 text-xs md:text-sm">
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
