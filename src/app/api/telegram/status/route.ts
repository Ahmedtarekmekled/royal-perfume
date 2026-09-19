import { NextResponse } from 'next/server';

// Read-only check for the admin Settings page. Never returns the token
// itself — only whether it's configured and, if so, the bot's public
// @username so the dashboard can link straight to it.
export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json({ configured: false });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();

    if (!res.ok || !data.ok) {
      return NextResponse.json({ configured: false, error: 'Invalid bot token' });
    }

    return NextResponse.json({ configured: true, botUsername: data.result.username as string });
  } catch (error) {
    console.error('Error checking Telegram status:', error);
    return NextResponse.json({ configured: false, error: 'Could not reach Telegram' });
  }
}
