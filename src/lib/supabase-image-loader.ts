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
    // Attempted: a sharp-backed /api/local-image route to resize these per
    // width (a custom `loader` makes Next skip registering /_next/image, so
    // local images were served unresized at every width). Reverted — sharp's
    // native binding throws "TypeError: ArrayBuffer: SharedArrayBuffer is
    // not allowed" under this project's Turbopack build specifically,
    // reproduced across 4 different loading strategies (buffer vs path,
    // static vs dynamic import, explicit nodejs runtime). Serving the
    // original file works; a broken 500 on every local image does not.
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
