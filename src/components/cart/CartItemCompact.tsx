
'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/store/useCartStore';

interface CartItemCompactProps {
  item: CartItem;
  updateQuantity: (id: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (id: string, variantId?: string) => void;
}

export default function CartItemCompact({ item, updateQuantity, removeItem }: CartItemCompactProps) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Image - Fixed Size */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
        <Image
          src={item.images?.[0] || item.image || '/placeholder.png'}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Content - Flex Column */}
      <div className="flex flex-1 flex-col justify-between py-1 min-w-0">
        <div className="space-y-0.5">
          <h4 className="font-heading text-sm font-medium leading-tight truncate pr-4">
            {item.name}
          </h4>
          {item.variantName && (
              <p className="text-xs text-muted-foreground">{item.variantName}</p>
          )}
          {item.category && (
             <p className="text-xs text-muted-foreground capitalize">
                {item.category}
             </p>
          )}
        </div>

        <div className="flex items-end justify-between w-full">
           <span className="font-bold text-sm">
             {formatCurrency(item.price)}
           </span>
           
           {/* Quantity Controls */}
           <div className="flex items-center gap-1">
             <div className="flex items-center border rounded-md h-7 bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none px-0"
                  onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-xs font-medium tabular-nums">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none px-0"
                  onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
             </div>
             
             <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-transparent"
                onClick={() => removeItem(item.id, item.variantId)}
             >
                <Trash2 className="h-4 w-4" />
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
