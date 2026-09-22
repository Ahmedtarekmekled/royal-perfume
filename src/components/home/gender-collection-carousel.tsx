'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Side cards shrink down to this scale; the centered card stays at 1.
const MIN_SCALE = 0.82;
// How far (px) the centered card lifts above the side cards at full scale.
const MAX_LIFT = 22;
const TWEEN_FACTOR_BASE = 0.4;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface CollectionItem {
  label: string;
  audience: string;
  image: string;
}

interface GenderCollectionCarouselProps {
  collections: CollectionItem[];
}

export default function GenderCollectionCarousel({ collections }: GenderCollectionCarouselProps) {
  const [, setApi] = useState<CarouselApi>();
  const tweenFactorRef = useRef(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Standard embla "tween scale" recipe (their own docs use the same
  // internalEngine() escape hatch — it isn't part of the public API surface,
  // hence the casts below) adapted to also lift the centered card upward,
  // not just scale it, for the "orbit" look.
  const applyTween = useCallback((emblaApi: NonNullable<CarouselApi>, eventName?: string) => {
    const engine = (emblaApi as any).internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = eventName === 'scroll';

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap: number[] = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem: any) => {
            const target = loopItem.target();
            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);
              if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
              if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
            }
          });
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactorRef.current);
        const scale = clamp(tweenValue, MIN_SCALE, 1);
        const lift = ((scale - MIN_SCALE) / (1 - MIN_SCALE)) * MAX_LIFT;
        const node = cardRefs.current[slideIndex];
        if (node) {
          node.style.transform = `translateY(${-lift}px) scale(${scale})`;
          node.style.zIndex = scale > 0.95 ? '10' : '0';
        }
      });
    });
  }, []);

  const onInit = useCallback((emblaApi: NonNullable<CarouselApi>) => {
    tweenFactorRef.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const handleApi = useCallback(
    (emblaApi: CarouselApi) => {
      if (!emblaApi) return;
      setApi(emblaApi);
      onInit(emblaApi);
      applyTween(emblaApi);

      emblaApi
        .on('reInit', onInit)
        .on('reInit', applyTween)
        .on('scroll', applyTween)
        .on('slideFocus', applyTween);
    },
    [onInit, applyTween]
  );

  return (
    <Carousel
      setApi={handleApi}
      opts={{
        align: 'center',
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 3500,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        }),
      ]}
      className="w-full"
    >
      {/* CarouselContent's clipping box sizes itself to this inner div's
         content — top padding here reserves the headroom the centered
         card's translateY(-lift) needs so it doesn't get clipped by the
         carousel's own overflow-hidden boundary when it rises above its
         resting (unscaled) layout box. */}
      <CarouselContent className="pt-6">
        {collections.map((item, index) => (
          <CarouselItem key={item.label} className="basis-[72%]">
            <div
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className="will-change-transform [transform:translateZ(0)]"
            >
              <Link
                href={`/shop?audience=${item.audience}`}
                className="group relative aspect-[3/4] overflow-hidden block rounded-sm shadow-lg"
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  loading="lazy"
                  sizes="72vw"
                  className="object-cover transition-all duration-700 filter grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-xl font-heading text-white font-medium drop-shadow-md">
                    {item.label}
                  </h3>
                  <span className="mt-4 px-6 py-2 border border-white text-white text-sm uppercase tracking-widest">
                    Explore
                  </span>
                </div>
              </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
