import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { hashToken } from '@/lib/telegram/tokens';
import { sendTelegramMessage } from '@/lib/telegram/bot';

// Telegram calls this URL for every update sent to the bot. Registered via
// setWebhook with a secret_token, which Telegram echoes back on every
// request — verifying it stops anyone else from posting fake "connections"
// to this endpoint.
export async function POST(req: Request) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  interface TelegramUpdate {
    message?: {
      text?: string;
      chat?: { id?: number };
      from?: { id: number; username?: string; first_name?: string };
    };
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update?.message;
  const text: string | undefined = message?.text;
  const chatId = message?.chat?.id;
  const from = message?.from;

  // Always 200 back to Telegram — it retries on non-2xx, and none of our
  // validation failures below are something Telegram itself can fix by retrying.
  if (!text || !text.startsWith('/start') || !chatId || !from) {
    return NextResponse.json({ ok: true });
  }

  const parts = text.trim().split(/\s+/);
  const token = parts[1];

  if (!token) {
    await sendTelegramMessage(
      chatId,
      "👋 This is the official RoyalPerfume notifications bot.\n\nTo connect it, click \"Connect Telegram\" in your RoyalPerfume dashboard under Settings."
    );
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  const tokenHash = hashToken(token);

  const { data: pending } = await admin
    .from('telegram_connection_requests')
    .select('id, user_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!pending || pending.used_at || new Date(pending.expires_at) < new Date()) {
    await sendTelegramMessage(
      chatId,
      '❌ This connection link is invalid or has expired.\n\nGo back to the RoyalPerfume dashboard and click "Connect Telegram" again.'
    );
    return NextResponse.json({ ok: true });
  }

  const telegramUserId: number = from.id;

  const { data: existingOwner } = await admin
    .from('telegram_connections')
    .select('user_id')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();

  if (existingOwner && existingOwner.user_id !== pending.user_id) {
    await sendTelegramMessage(
      chatId,
      '⚠️ This Telegram account is already connected to a different RoyalPerfume account.\n\nDisconnect it there first, or use a different Telegram account to connect.'
    );
    return NextResponse.json({ ok: true });
  }

  const { error: upsertError } = await admin.from('telegram_connections').upsert(
    {
      user_id: pending.user_id,
      telegram_user_id: telegramUserId,
      telegram_username: from.username || null,
      telegram_first_name: from.first_name || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (upsertError) {
    // Unique violation on telegram_user_id = a race with another request
    // claiming the same Telegram account between our check and this write.
    console.error('Error saving Telegram connection:', upsertError);
    await sendTelegramMessage(
      chatId,
      '⚠️ This Telegram account is already connected to a different RoyalPerfume account.\n\nDisconnect it there first, or use a different Telegram account to connect.'
    );
    return NextResponse.json({ ok: true });
  }

  await admin
    .from('telegram_connection_requests')
    .update({ used_at: new Date().toISOString() })
    .eq('id', pending.id);

  await sendTelegramMessage(
    chatId,
    '✅ Telegram connected successfully!\n\nYou can now receive RoyalPerfume order notifications here.'
  );

  return NextResponse.json({ ok: true });
}
