'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import FavoriteRow from '@/components/favorites/FavoriteRow';
import { useFavoritesStore, type FavoriteItem } from '@/store/useFavoritesStore';
import { useCartStore } from '@/hooks/use-cart';
import { useStore } from '@/hooks/use-store';
import { useSettings } from '@/components/providers/SettingsProvider';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface LiveStatus {
  isAvailable: boolean;
  price: number;
  hasVariants: boolean;
  slug: string | null;
}

interface FavoritesClientProps {
  /** Called when the user navigates away via a product link — lets a parent sheet close itself. */
  onNavigate?: () => void;
}

export default function FavoritesClient({ onNavigate }: FavoritesClientProps = {}) {
  const router = useRouter();
  const items = useStore(useFavoritesStore, (state) => state.items);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const addItem = useCartStore((state) => state.addItem);
  const { hidePrices } = useSettings();

  // One batched query for the whole list — not one per row — to flag
  // deleted/out-of-stock items and refresh price without touching every
  // card individually.
  const [liveStatus, setLiveStatus] = useState<Record<string, LiveStatus>>({});

  useEffect(() => {
    if (!items || items.length === 0) return;

    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('id, price, discount, stock, is_active, has_variants, slug')
        .in('id', items.map((item) => item.id));

      if (cancelled || !data) return;

      const next: Record<string, LiveStatus> = {};
      data.forEach((p) => {
        next[p.id] = {
          isAvailable: p.is_active && p.stock,
          price: p.price - (p.discount || 0),
          hasVariants: p.has_variants,
          slug: p.slug,
        };
      });
      setLiveStatus(next);
    })();

    return () => {
      cancelled = true;
    };
    // Re-check only when the set of favorited ids changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items?.map((i) => i.id).join(',')]);

  const handleAddToCart = (item: FavoriteItem) => {
    const live = liveStatus[item.id];

    if (live?.hasVariants) {
      onNavigate?.();
      router.push(`/shop/${live.slug || item.slug}`);
      toast.info('Select a size');
      return;
    }

    addItem({
      id: item.id,
      name: item.name,
      price: live?.price ?? item.price,
      images: [item.image],
    });
    toast.success(`Added ${item.name} to cart`);
  };

  // Hydrating — avoid flashing an empty state before localStorage loads.
  if (items === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 font-heading text-xl font-medium">No favorites yet</h2>
        <p className="mb-6 max-w-xs text-sm text-muted-foreground">
          Tap the heart on any product to save it here for later.
        </p>
        <Button asChild onClick={onNavigate}>
          <Link href="/shop">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse the Shop
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FavoriteRow
          key={item.id}
          item={item}
          isAvailable={liveStatus[item.id]?.isAvailable ?? true}
          hidePrices={hidePrices}
          onRemove={removeFavorite}
          onAddToCart={handleAddToCart}
          onNavigate={onNavigate}
          playSwipeHint
        />
      ))}
    </div>
  );
}
