import { NextResponse } from 'next/server';

// Sends a one-off test message to the configured chat so the admin can
// verify the bot is wired up correctly from the Settings page.
export async function POST() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json({ error: 'Telegram is not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ Royal Perfumes is connected. New orders will appear here.',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Telegram test message failed:', errText);
      return NextResponse.json({ error: 'Telegram rejected the test message' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending Telegram test message:', error);
    return NextResponse.json({ error: error?.message || 'Failed to send test message' }, { status: 500 });
  }
}
