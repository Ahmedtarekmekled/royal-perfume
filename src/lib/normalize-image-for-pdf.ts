'use client';

const PDF_SAFE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const cache = new Map<string, Promise<string>>();
let placeholderPromise: Promise<string> | null = null;

function isAlreadyPdfSafe(url: string): boolean {
  const lower = url.split('?')[0].toLowerCase();
  return PDF_SAFE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function canvasToJpeg(draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void, width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  draw(ctx, canvas);
  return canvas.toDataURL('image/jpeg', 0.9);
}

async function convertToJpegDataUrl(url: string, maxDimension?: number): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = maxDimension ? Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height)) : 1;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    // JPEG has no alpha: paint white first or transparent PNG/WebP areas turn black.
    return canvasToJpeg(
      (ctx) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);
      },
      width,
      height
    );
  } finally {
    bitmap.close();
  }
}

/** Simple generated "No Image" placeholder — avoids needing a static PNG/JPG
 *  asset in the repo just for this one fallback case. */
function getPlaceholderDataUrl(): Promise<string> {
  if (!placeholderPromise) {
    placeholderPromise = Promise.resolve(
      canvasToJpeg((ctx, canvas) => {
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#DDDDDD';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
        ctx.fillStyle = '#999999';
        ctx.font = '28px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Image', canvas.width / 2, canvas.height / 2);
      }, 400, 500)
    );
  }
  return placeholderPromise;
}

/**
 * @react-pdf/renderer's <Image> only supports JPEG/PNG, picked by file
 * extension — webp/avif/jfif product images (common in this store's
 * uploads) fail to embed silently. Re-encodes anything not already a
 * jpg/png into a JPEG data URL via canvas before it reaches react-pdf.
 * Falls back to a generated placeholder on any failure (missing image,
 * fetch/decode error) so one bad image can't abort an entire catalog
 * generation. Results are cached per url+maxDimension for the life of the
 * page/tab.
 *
 * `maxDimension`, when given, forces a downscale (via canvas re-encode)
 * even for already-jpg/png sources — otherwise those pass through at their
 * original resolution untouched, which is fine for a full-page catalog
 * image but bloats a PDF that only displays the image as a small thumbnail
 * (e.g. an invoice line item embeds the multi-MB original for a 28pt box).
 */
export function normalizeImageForPdf(url: string | null | undefined, maxDimension?: number): Promise<string> {
  if (!url) return getPlaceholderDataUrl();
  if (!maxDimension && isAlreadyPdfSafe(url)) return Promise.resolve(url);

  const cacheKey = `${url}::${maxDimension ?? 'orig'}`;
  let pending = cache.get(cacheKey);
  if (!pending) {
    pending = convertToJpegDataUrl(url, maxDimension).catch((err) => {
      console.error('normalizeImageForPdf failed for', url, err);
      return getPlaceholderDataUrl();
    });
    cache.set(cacheKey, pending);
  }
  return pending;
}

/** Normalizes a batch of image URLs in parallel, returning a url -> normalized-src map. */
export async function normalizeImagesForPdf(urls: (string | null | undefined)[], maxDimension?: number): Promise<Map<string, string>> {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean) as string[]));
  const results = await Promise.all(uniqueUrls.map((url) => normalizeImageForPdf(url, maxDimension)));
  const map = new Map<string, string>();
  uniqueUrls.forEach((url, i) => map.set(url, results[i]));
  return map;
}

const fitCache = new Map<string, Promise<string>>();

/**
 * Draws the whole image, centered and scaled to fit ("contain"), onto a
 * `width`×`height` canvas filled with `background`, and returns it as a JPEG.
 * The PDF then places a box of exactly that aspect ratio, so no renderer
 * cropping or stretching can ever cut a product photo off. `padding` is a
 * fraction of the box kept clear on every side.
 */
export function fitImageForPdf(
  url: string | null | undefined,
  width: number,
  height: number,
  background = '#FFFFFF',
  padding = 0
): Promise<string> {
  if (!url) return getPlaceholderDataUrl();
  const cacheKey = `${url}::${width}x${height}::${background}::${padding}`;
  let pending = fitCache.get(cacheKey);
  if (!pending) {
    pending = (async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bitmap = await createImageBitmap(await response.blob());
      try {
        const innerW = width * (1 - padding * 2);
        const innerH = height * (1 - padding * 2);
        const scale = Math.min(innerW / bitmap.width, innerH / bitmap.height);
        const w = bitmap.width * scale;
        const h = bitmap.height * scale;
        return canvasToJpeg(
          (ctx) => {
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, width, height);
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(bitmap, (width - w) / 2, (height - h) / 2, w, h);
          },
          width,
          height
        );
      } finally {
        bitmap.close();
      }
    })().catch((err) => {
      console.error('fitImageForPdf failed for', url, err);
      return getPlaceholderDataUrl();
    });
    fitCache.set(cacheKey, pending);
  }
  return pending;
}
