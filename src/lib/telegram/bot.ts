// Thin wrapper around the Telegram Bot API. The bot token is an
// infrastructure secret (server env var only) — nothing in this file ever
// sends it to a browser or returns it from an API response.

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured on the server');
  }
  return token;
}

let cachedUsername: string | null = null;

export async function getBotUsername(): Promise<string | null> {
  if (cachedUsername) return cachedUsername;
  try {
    const res = await fetch(`https://api.telegram.org/bot${getBotToken()}/getMe`);
    const data = await res.json();
    if (res.ok && data.ok) {
      cachedUsername = data.result.username as string;
      return cachedUsername;
    }
  } catch (error) {
    console.error('Error fetching bot username:', error);
  }
  return null;
}

export async function sendTelegramMessage(chatId: number | string, text: string, parseMode: 'HTML' | undefined = undefined) {
  const res = await fetch(`https://api.telegram.org/bot${getBotToken()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
  if (!res.ok) {
    console.error('Telegram sendMessage failed:', await res.text());
  }
  return res.ok;
}

export async function sendTelegramDocument(chatId: number | string, buffer: Buffer, filename: string, caption?: string) {
  const form = new FormData();
  form.append('chat_id', String(chatId));
  if (caption) form.append('caption', caption);
  form.append('document', new Blob([new Uint8Array(buffer)], { type: 'application/pdf' }), filename);

  const res = await fetch(`https://api.telegram.org/bot${getBotToken()}/sendDocument`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    console.error('Telegram sendDocument failed:', await res.text());
  }
  return res.ok;
}
