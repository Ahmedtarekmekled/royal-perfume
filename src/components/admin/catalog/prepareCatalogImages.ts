import { Product } from '@/types';
import { fitImageForPdf } from '@/lib/normalize-image-for-pdf';
import { CATALOG_IMAGE_ASPECT } from './types';

// 480×600 keeps photos sharp at the largest (2-per-row) card while keeping a
// 1,000-product PDF a reasonable size.
const WIDTH = 480;
const HEIGHT = Math.round(WIDTH / CATALOG_IMAGE_ASPECT);
const CONCURRENCY = 8;

/**
 * Resolves every product's first image to a letterboxed JPEG of the card's
 * exact aspect ratio (whole bottle visible, white surround), keyed by product
 * id. Fetches a few at a time so large catalogs don't flood the network.
 */
export async function prepareCatalogImages(
  products: Product[],
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const queue = [...products];
  let done = 0;

  async function worker() {
    while (queue.length) {
      const product = queue.shift()!;
      out.set(product.id, await fitImageForPdf(product.images?.[0], WIDTH, HEIGHT, '#FFFFFF', 0.06));
      onProgress?.(++done, products.length);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return out;
}
