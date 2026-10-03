'use client';

import { useEffect, useRef } from 'react';
import { Category } from '@/types';
import Link from 'next/link';
import ImageWithFallback from '@/components/shared/ImageWithFallback';

interface CategoryCarouselProps {
  categories: Category[];
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="relative w-full aspect-[4/7] overflow-hidden whitespace-normal bg-black">
      {category.image_url ? (
        <ImageWithFallback
          src={category.image_url}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 300px"
          className="object-cover brightness-90 transition-all duration-500 group-hover/card:scale-110 group-hover/card:brightness-75"
        />
      ) : (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500">
          <span className="text-xs">No Image</span>
        </div>
      )}
      {/* Name overlaid near the top of the image, not in a separate row below. */}
      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent pt-5 pb-10 px-2">
        <span className="block w-full line-clamp-2 text-center text-sm sm:text-base md:text-lg font-heading font-normal text-white transition-colors">
          {category.name}
        </span>
      </div>
    </div>
  );
}

const RESUME_DELAY_MS = 1200;
const PIXELS_PER_FRAME = 1;

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drives the same element the user can touch/drag — a continuous
  // `scrollLeft` nudge rather than a CSS transform, so native swipe/scroll
  // and the auto-moving loop share one mechanism instead of fighting.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || categories.length === 0) return;

    let rafId: number;
    // Tracked in plain JS, not read back from `el.scrollLeft` each frame —
    // some WebKit/Safari builds round scrollLeft to a whole pixel on every
    // write, which silently eats sub-pixel increments read-modify-write
    // style and can leave the loop stuck at 0 on an iPhone even though it
    // animates fine in Chromium.
    let position = el.scrollLeft;
    const step = () => {
      if (pausedRef.current) {
        // Stay in sync with manual dragging while paused, so resuming
        // continues from wherever the user left it instead of snapping back.
        position = el.scrollLeft;
      } else {
        const halfWidth = el.scrollWidth / 2;
        position += PIXELS_PER_FRAME;
        if (position >= halfWidth) {
          position -= halfWidth;
        }
        el.scrollLeft = position;
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [categories.length]);

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };
  const scheduleResume = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  // Duplicated once so the scrollLeft reset at the halfway point is
  // seamless — both copies are real links since a user dragging by hand can
  // land on either one before the loop resets it back under them.
  const items = [...categories, ...categories];

  return (
    <div
      ref={scrollerRef}
      className="flex w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onPointerDown={pause}
      onPointerUp={scheduleResume}
      onPointerLeave={scheduleResume}
      onTouchStart={pause}
      onTouchEnd={scheduleResume}
      onMouseEnter={pause}
      onMouseLeave={scheduleResume}
    >
      {items.map((category, index) => (
        <Link
          key={`${category.id}-${index}`}
          href={`/shop?category=${category.slug}`}
          className="group/card block w-36 md:w-56 shrink-0"
        >
          <CategoryCard category={category} />
        </Link>
      ))}
    </div>
  );
}
