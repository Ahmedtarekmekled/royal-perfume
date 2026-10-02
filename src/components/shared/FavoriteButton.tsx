'use client';

import { Heart } from 'lucide-react';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug?: string | null;
  };
  className?: string;
  iconClassName?: string;
  /** Suppresses the toast — used where the parent already gives feedback. */
  silent?: boolean;
}

export default function FavoriteButton({ product, className, iconClassName, silent = false }: FavoriteButtonProps) {
  // Hydration-safe: renders "not favorited" on the server and during the
  // first client render, then picks up the persisted localStorage value —
  // matches the pattern useCartStore reads already use (see use-store.ts).
  const isFavorite = useStore(useFavoritesStore, (state) => state.isFavorite(product.id)) ?? false;
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const wasFavorite = isFavorite;
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
      slug: product.slug,
    });

    if (!silent) {
      toast.success(wasFavorite ? `Removed ${product.name} from Favorites` : `Added ${product.name} to Favorites`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
      aria-pressed={isFavorite}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200 active:scale-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
        className
      )}
    >
      <Heart
        className={cn(
          "transition-all duration-200",
          isFavorite ? "fill-red-500 text-red-500 scale-110" : "fill-transparent text-current",
          iconClassName
        )}
      />
    </button>
  );
}
