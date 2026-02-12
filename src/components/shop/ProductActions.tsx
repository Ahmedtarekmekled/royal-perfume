"use client";

import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/use-cart';
import { toast } from 'sonner';

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: boolean;
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // Add item with the cart store (it handles quantity internally)
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
      });
    }
    
    // Show success toast
    toast.success(`Added ${quantity} ${product.name} to cart`);
    
    // Reset quantity
    setQuantity(1);
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  if (!product.stock) {
    return (
      <Button disabled className="w-full text-lg py-6" variant="secondary">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground mr-auto">Quantity</span>
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={decrement}
            disabled={quantity <= 1}
            className="h-10 w-10 rounded-none"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={increment}
            className="h-10 w-10 rounded-none"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button 
        onClick={handleAddToCart} 
        className="w-full text-lg py-6 transition-all"
      >
        <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
      </Button>
    </div>
  );
}
