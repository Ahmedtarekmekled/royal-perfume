import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireDashboardUser } from '@/lib/telegram/require-user';
import { generateConnectionToken, hashToken, CONNECTION_TOKEN_TTL_MS } from '@/lib/telegram/tokens';
import { getBotUsername } from '@/lib/telegram/bot';

// GET: current dashboard user's Telegram connection state — connected,
// waiting on a pending request, or not connected at all.
export async function GET() {
  const user = await requireDashboardUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: connection } = await admin
    .from('telegram_connections')
    .select('telegram_username, telegram_first_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (connection) {
    return NextResponse.json({
      status: 'connected',
      telegramUsername: connection.telegram_username,
      telegramFirstName: connection.telegram_first_name,
    });
  }

  const { data: pending } = await admin
    .from('telegram_connection_requests')
    .select('expires_at')
    .eq('user_id', user.id)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pending) {
    return NextResponse.json({ status: 'pending', expiresAt: pending.expires_at });
  }

  return NextResponse.json({ status: 'disconnected' });
}

// POST: mint a fresh single-use connection token and return the Telegram
// deep link that starts the bot with it. The bot token itself never leaves
// the server — only the bot's public @username is used to build the link.
export async function POST() {
  const user = await requireDashboardUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botUsername = await getBotUsername();
  if (!botUsername) {
    return NextResponse.json({ error: 'Telegram bot is not configured' }, { status: 500 });
  }

  const token = generateConnectionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + CONNECTION_TOKEN_TTL_MS).toISOString();

  const admin = createAdminClient();
  const { error } = await admin.from('telegram_connection_requests').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    console.error('Error creating Telegram connection request:', error);
    return NextResponse.json({ error: 'Failed to start connection' }, { status: 500 });
  }

  return NextResponse.json({
    deepLink: `https://t.me/${botUsername}?start=${token}`,
    expiresAt,
  });
}

// DELETE: unlink the current dashboard user's Telegram account.
export async function DELETE() {
  const user = await requireDashboardUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('telegram_connections').delete().eq('user_id', user.id);

  if (error) {
    console.error('Error disconnecting Telegram:', error);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
