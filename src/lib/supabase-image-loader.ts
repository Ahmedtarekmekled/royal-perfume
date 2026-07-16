import {
  buildSupabaseRenderUrl,
  isLocalStaticImage,
  isSupabaseStorageUrl,
  isSupabaseTransformsEnabled,
  toSupabaseObjectUrl,
} from './images';

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Next.js custom image loader — routes Supabase images through Storage
 * render API instead of Vercel Image Optimization (/_next/image).
 *
 * Existing database URLs are preserved; transformation happens at render time.
 */
export default function supabaseImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (isLocalStaticImage(src)) {
    return src;
  }

  if (isSupabaseStorageUrl(src) || (!src.startsWith('http') && !src.startsWith('/'))) {
    if (isSupabaseTransformsEnabled()) {
      return buildSupabaseRenderUrl(src, { width, quality, resize: 'cover' });
    }
    return toSupabaseObjectUrl(src);
  }

  // Non-Supabase remote URLs (popup images, third-party assets) — serve directly.
  return src;
}
