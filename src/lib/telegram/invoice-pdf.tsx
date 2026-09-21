import { readFile } from 'fs/promises';
import path from 'path';
import { renderToBuffer } from '@react-pdf/renderer';
import sharp from 'sharp';
import InvoicePDF from '@/components/shop/InvoicePDF';

interface OrderAddress {
  line1: string;
  city: string;
  country: string;
  postal_code: string;
}

export interface InvoicePdfOrderInput {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: OrderAddress;
  totalAmount: number;
  shippingCost: number;
  items: { name: string; quantity: number; price: number; image?: string | null }[];
}

// Mirrors the browser download flow's normalizeImagesForPdf (src/lib/normalize-image-for-pdf.ts),
// which downscales via <canvas> — unavailable in Node, so this re-encodes via sharp instead.
// Downscaling matters even for already-jpg/png sources: react-pdf embeds whatever pixel
// dimensions it's given regardless of the 28pt box it's displayed in, so skipping this would
// let a single multi-megapixel product photo bloat the whole Telegram invoice.
const TELEGRAM_THUMB_MAX_DIMENSION = 160;

async function resolveProductImages(urls: (string | null | undefined)[]): Promise<Map<string, Buffer>> {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean) as string[]));
  const map = new Map<string, Buffer>();
  await Promise.all(
    uniqueUrls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`fetch failed with status ${response.status}`);
        const original = Buffer.from(await response.arrayBuffer());
        const resized = await sharp(original)
          .resize({ width: TELEGRAM_THUMB_MAX_DIMENSION, height: TELEGRAM_THUMB_MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 82 })
          .toBuffer();
        map.set(url, resized);
      } catch (error) {
        // One broken/unreachable product image can't be allowed to abort the whole invoice —
        // that row just renders without a thumbnail (see InvoicePDF's thumbSrc lookup).
        console.error('Non-fatal error: failed to resolve product image for Telegram invoice', url, error);
      }
    })
  );
  return map;
}

// Kept as a standalone (non-try/catch-nested) function so the JSX below
// isn't flagged by react-hooks/error-boundaries — this is server-side PDF
// rendering, not a mounted React tree, so that rule doesn't apply, but the
// linter can't tell the difference syntactically.
function buildInvoiceElement(input: InvoicePdfOrderInput, logoBuffer: Buffer, productImages: Map<string, Buffer>) {
  const order = {
    id: input.orderId,
    created_at: new Date().toISOString(),
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    customer_address: input.address,
    total_amount: input.totalAmount,
    shipping_cost: input.shippingCost,
  };

  const pdfItems = input.items.map((item) => ({
    quantity: item.quantity,
    unit_price: item.price,
    products: { name_en: item.name, images: item.image ? [item.image] : [] },
  }));

  return <InvoicePDF order={order} items={pdfItems} logoSrc={logoBuffer} productImages={productImages} />;
}

export async function renderOrderInvoicePdf(input: InvoicePdfOrderInput): Promise<Buffer | null> {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'hero1.PNG');
    const [logoBuffer, productImages] = await Promise.all([
      readFile(logoPath),
      resolveProductImages(input.items.map((item) => item.image)),
    ]);
    const element = buildInvoiceElement(input, logoBuffer, productImages);
    return await renderToBuffer(element);
  } catch (error) {
    console.error('Non-fatal error: failed to render invoice PDF for Telegram', error);
    return null;
  }
}
