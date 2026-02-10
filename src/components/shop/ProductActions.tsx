"use client";

import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';

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
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // Add item multiple times based on quantity
    // The current store implementation adds 1 at a time or handles quantity internally?
    // Let's check useCartStore.ts: addItem takes a product and adds or increments quantity by 1 if exists.
    // Wait, the store logic is:
    // return { items: state.items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
    // It only increments by 1.
    // So I need to call it multiple times or update the store to accept quantity.
    // For now, I'll just call it 'quantity' times.
    
    for (let i = 0; i < quantity; i++) {
        addItem(product);
    }
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
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
        disabled={isAdded}
        className="w-full text-lg py-6 transition-all"
      >
        {isAdded ? (
          "Added to Cart"
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
