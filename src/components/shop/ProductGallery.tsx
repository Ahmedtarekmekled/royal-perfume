"use client";

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ImageWithFallback from '@/components/shared/ImageWithFallback';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || '/placeholder.svg');
  const [canScrollDown, setCanScrollDown] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = thumbsRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
    };

    checkOverflow();
    el.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [images]);

  const scrollThumbsDown = () => {
    thumbsRef.current?.scrollBy({ top: 140, behavior: 'smooth' });
  };

  return (
    <div className="flex gap-3 md:gap-4 w-full max-w-3xl mx-auto lg:mx-0">
      {images.length > 1 && (
        <div className="relative flex flex-col items-center shrink-0 order-2 lg:order-1">
          <div
            ref={thumbsRef}
            className="flex flex-col gap-2 overflow-y-auto max-h-[360px] md:max-h-[460px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className={cn(
                  "relative w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                  selectedImage === image ? "border-black dark:border-white" : "border-transparent hover:border-gray-200"
                )}
              >
                <ImageWithFallback
                  src={image}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  className="object-contain object-center"
                  sizes="96px"
                />
              </button>
            ))}
          </div>

          {canScrollDown && (
            <button
              type="button"
              onClick={scrollThumbsDown}
              aria-label="Show more images"
              className="mt-1 flex h-6 w-16 md:w-20 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg order-1 lg:order-2">
        <ImageWithFallback
          src={selectedImage}
          alt={name}
          fill
          className="object-contain object-center"
          priority
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 480px"
        />
      </div>
    </div>
  );
}
