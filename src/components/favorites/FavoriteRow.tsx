'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import { ShoppingBag, X, ChevronLeft } from 'lucide-react';
import ImageWithFallback from '@/components/shared/ImageWithFallback';
import { formatCurrency } from '@/lib/utils';
import type { FavoriteItem } from '@/store/useFavoritesStore';

const TRAY_WIDTH = 152;
const OPEN_THRESHOLD = TRAY_WIDTH / 2;

interface FavoriteRowProps {
  item: FavoriteItem;
  /** Live-checked status from the one batched revalidation query — undefined while loading. */
  isAvailable?: boolean;
  hidePrices?: boolean;
  onRemove: (id: string) => void;
  onAddToCart: (item: FavoriteItem) => void;
  /** Plays a brief "swipe me" bounce on mount to teach the gesture. */
  playSwipeHint?: boolean;
  /** Called when the product link is clicked — lets a parent sheet close itself before navigating. */
  onNavigate?: () => void;
}

export default function FavoriteRow({
  item,
  isAvailable = true,
  hidePrices = false,
  onRemove,
  onAddToCart,
  playSwipeHint = false,
  onNavigate,
}: FavoriteRowProps) {
  const x = useMotionValue(0);
  // Fades the "swipe me" chevron out as soon as the row starts moving, so it
  // never overlaps the revealed tray.
  const hintOpacity = useTransform(x, [-14, 0], [0.08, 0.35]);
  const hasHinted = useRef(false);
  const [isTouchLayout, setIsTouchLayout] = useState(false);

  // Swipe is a mobile-only affordance — the tray it reveals is hidden at
  // md+, so dragging is disabled there too (otherwise a mouse-drag would
  // just slide the row over an empty gap with no tray beneath it).
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const update = () => setIsTouchLayout(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // Teach the swipe gesture once per page visit with a short, subtle bounce —
  // uses the same motion value `drag` reads, so it hands off cleanly the
  // moment the user actually touches the row.
  useEffect(() => {
    if (!playSwipeHint || !isTouchLayout || hasHinted.current) return;
    hasHinted.current = true;
    const controls = animate(x, [0, -14, 0, -14, 0], {
      duration: 2,
      times: [0, 0.25, 0.5, 0.75, 1],
      ease: 'easeInOut',
    });
    return () => controls.stop();
  }, [playSwipeHint, isTouchLayout, x]);

  const close = () => animate(x, 0, { type: 'spring', stiffness: 420, damping: 38 });

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const shouldOpen = info.offset.x < -OPEN_THRESHOLD || info.velocity.x < -500;
    animate(x, shouldOpen ? -TRAY_WIDTH : 0, { type: 'spring', stiffness: 420, damping: 38 });
  };

  const handleRemove = () => {
    close();
    onRemove(item.id);
  };

  const handleAddToCart = () => {
    close();
    onAddToCart(item);
  };

  return (
    <div className="relative overflow-hidden rounded-lg border bg-white dark:bg-gray-900">
      {/* Swipe-revealed tray — the only Add/Remove controls on mobile.
          Rounds its own right corners (rather than relying solely on the
          parent's overflow-hidden) so a hard square corner never peeks past
          the parent's anti-aliased rounded edge as a thin color sliver. */}
      <div
        className="absolute inset-y-0 right-0 flex items-stretch overflow-hidden rounded-r-lg md:hidden"
        style={{ width: TRAY_WIDTH }}
      >
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          aria-label={`Add ${item.name} to cart`}
          className="flex flex-1 flex-col items-center justify-center gap-1 bg-black text-white text-[11px] font-medium disabled:opacity-40"
        >
          <ShoppingBag className="h-4 w-4" />
          Add
        </button>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${item.name} from favorites`}
          className="flex flex-1 flex-col items-center justify-center gap-1 bg-red-600 text-white text-[11px] font-medium"
        >
          <X className="h-4 w-4" />
          Remove
        </button>
      </div>

      {/* Foreground row — draggable on touch to reveal the tray behind it. */}
      <motion.div
        drag={isTouchLayout ? 'x' : false}
        dragConstraints={{ left: -TRAY_WIDTH, right: 0 }}
        dragElastic={0.04}
        dragDirectionLock
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative z-10 flex items-center gap-3 bg-white dark:bg-gray-900 p-3 touch-pan-y select-none"
      >
        <Link
          href={item.slug ? `/shop/${item.slug}` : '#'}
          onClick={onNavigate}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800"
          draggable={false}
        >
          <ImageWithFallback
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            fill
            className="object-cover object-center pointer-events-none"
            sizes="64px"
          />
        </Link>

        <Link
          href={item.slug ? `/shop/${item.slug}` : '#'}
          onClick={onNavigate}
          className="min-w-0 flex-1"
          draggable={false}
        >
          <p className="truncate text-sm font-medium">{item.name}</p>
          {isAvailable ? (
            <p className="text-sm text-muted-foreground">
              {hidePrices ? 'Contact for price' : formatCurrency(item.price)}
            </p>
          ) : (
            <p className="text-sm text-red-600">No longer available</p>
          )}
        </Link>

        {/* Desktop only — there's no swipe tray at md+, so these are the
            sole Add/Remove controls there. On mobile the tray above is the
            only action surface, so this whole group is removed from view
            (not just visually hidden) to avoid showing both at once. */}
        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            aria-label={`Add ${item.name} to cart`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-transform active:scale-90 disabled:opacity-40 disabled:active:scale-100"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${item.name} from favorites`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-black hover:text-black transition-all active:scale-90 dark:border-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile-only "swipe me" hint — fades out the instant a drag starts. */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 md:hidden"
          aria-hidden="true"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </motion.div>
      </motion.div>
    </div>
  );
}
