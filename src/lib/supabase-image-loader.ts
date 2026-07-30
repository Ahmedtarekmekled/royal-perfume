import {
  buildProxiedRenderUrl,
  isLocalStaticImage,
  isSupabaseStorageUrl,
  isSupabaseTransformsEnabled,
  toProxiedObjectUrl,
} from './images';

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Next.js custom image loader — routes Supabase images through our own
 * `/images` proxy (see `next.config.ts` rewrites) instead of Vercel Image
 * Optimization (/_next/image) AND instead of exposing the raw
 * `*.supabase.co` Storage host to the browser.
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
      return buildProxiedRenderUrl(src, { width, quality, resize: 'cover' });
    }
    return toProxiedObjectUrl(src);
  }

  // Non-Supabase remote URLs (popup images, third-party assets) — serve directly.
  return src;
}
