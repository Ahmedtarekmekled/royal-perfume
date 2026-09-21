import { NextResponse } from 'next/server';
import { getConnectedTelegramRecipients } from '@/lib/telegram/connections';
import { sendTelegramMessage, sendTelegramDocument } from '@/lib/telegram/bot';
import { renderOrderInvoicePdf } from '@/lib/telegram/invoice-pdf';

interface OrderItemPayload {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
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
    const recipients = await getConnectedTelegramRecipients();

    if (recipients.length === 0) {
      console.error('Telegram notification skipped: no connected recipients');
      return NextResponse.json({ error: 'No Telegram accounts connected' }, { status: 200 });
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

    // Render the invoice once and reuse the buffer for every recipient.
    const pdfBuffer = await renderOrderInvoicePdf({
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      totalAmount: total,
      shippingCost,
      items: items || [],
    });

    await Promise.all(
      recipients.map(async (recipient) => {
        await sendTelegramMessage(recipient.telegramUserId, message, 'HTML');
        if (pdfBuffer) {
          await sendTelegramDocument(
            recipient.telegramUserId,
            pdfBuffer,
            `invoice-${orderId.slice(0, 8)}.pdf`,
            `Invoice${orderNumber ? ` — Order #${orderNumber}` : ''}`
          );
        }
      })
    );

    return NextResponse.json({ success: true, notified: recipients.length });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send Telegram notification' },
      { status: 500 }
    );
  }
}
