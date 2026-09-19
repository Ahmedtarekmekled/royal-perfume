import { readFile } from 'fs/promises';
import path from 'path';
import { renderToBuffer } from '@react-pdf/renderer';
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
  items: { name: string; quantity: number; price: number }[];
}

// Kept as a standalone (non-try/catch-nested) function so the JSX below
// isn't flagged by react-hooks/error-boundaries — this is server-side PDF
// rendering, not a mounted React tree, so that rule doesn't apply, but the
// linter can't tell the difference syntactically.
function buildInvoiceElement(input: InvoicePdfOrderInput, logoBuffer: Buffer) {
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
    products: { name_en: item.name },
  }));

  return <InvoicePDF order={order} items={pdfItems} logoSrc={logoBuffer} />;
}

export async function renderOrderInvoicePdf(input: InvoicePdfOrderInput): Promise<Buffer | null> {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'hero1.PNG');
    const logoBuffer = await readFile(logoPath);
    const element = buildInvoiceElement(input, logoBuffer);
    return await renderToBuffer(element);
  } catch (error) {
    console.error('Non-fatal error: failed to render invoice PDF for Telegram', error);
    return null;
  }
}
