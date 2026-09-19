import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { renderToBuffer } from '@react-pdf/renderer';
import InvoicePDF from '@/components/shop/InvoicePDF';

interface OrderItemPayload {
  name: string;
  quantity: number;
  price: number;
}

interface OrderAddress {
  line1: string;
  city: string;
  country: string;
  postal_code: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(req: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram notification skipped: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
      return NextResponse.json({ error: 'Telegram is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      address,
      items,
      shippingCost,
      total,
    }: {
      orderId: string;
      orderNumber?: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      address: OrderAddress;
      items: OrderItemPayload[];
      shippingCost: number;
      total: number;
    } = body;

    if (!orderId || !customerName) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    const itemLines = (items || [])
      .map((item) => `• ${escapeHtml(item.name)} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const message = [
      `🛒 <b>New Order${orderNumber ? ` #${escapeHtml(orderNumber)}` : ''}</b>`,
      '',
      `<b>Customer:</b> ${escapeHtml(customerName)}`,
      `<b>Email:</b> ${escapeHtml(customerEmail)}`,
      `<b>Phone:</b> ${escapeHtml(customerPhone)}`,
      '',
      `<b>Address:</b>`,
      `${escapeHtml(address.line1)}, ${escapeHtml(address.city)}, ${escapeHtml(address.country)} ${escapeHtml(address.postal_code)}`,
      '',
      `<b>Items:</b>`,
      itemLines || '—',
      '',
      `<b>Shipping:</b> $${shippingCost.toFixed(2)}`,
      `<b>Total:</b> $${total.toFixed(2)}`,
      '',
      `Order ID: <code>${escapeHtml(orderId)}</code>`,
    ].join('\n');

    const messageRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!messageRes.ok) {
      const errText = await messageRes.text();
      console.error('Telegram sendMessage error:', errText);
      return NextResponse.json({ error: 'Failed to send Telegram notification' }, { status: 502 });
    }

    // Attach the invoice as a PDF document. Non-fatal: the text notification
    // above already succeeded, so a PDF failure shouldn't fail the whole request.
    try {
      const logoPath = path.join(process.cwd(), 'public', 'images', 'hero1.PNG');
      const logoBuffer = await readFile(logoPath);

      const order = {
        id: orderId,
        created_at: new Date().toISOString(),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_address: address,
        total_amount: total,
        shipping_cost: shippingCost,
      };

      const pdfItems = (items || []).map((item) => ({
        quantity: item.quantity,
        unit_price: item.price,
        products: { name_en: item.name },
      }));

      const pdfBuffer = await renderToBuffer(
        <InvoicePDF order={order} items={pdfItems} logoSrc={logoBuffer} />
      );

      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('caption', `Invoice${orderNumber ? ` — Order #${orderNumber}` : ''}`);
      form.append(
        'document',
        new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' }),
        `invoice-${orderId.slice(0, 8)}.pdf`
      );

      const docRes = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
        method: 'POST',
        body: form,
      });

      if (!docRes.ok) {
        const errText = await docRes.text();
        console.error('Telegram sendDocument error:', errText);
      }
    } catch (pdfError) {
      console.error('Non-fatal error: failed to generate/send invoice PDF to Telegram', pdfError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send Telegram notification' },
      { status: 500 }
    );
  }
}
