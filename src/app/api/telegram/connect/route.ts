import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireDashboardUser } from '@/lib/telegram/require-user';
import { getTelegramConnectionStatus } from '@/lib/telegram/connections';
import { generateConnectionToken, hashToken, CONNECTION_TOKEN_TTL_MS } from '@/lib/telegram/tokens';
import { getBotUsername } from '@/lib/telegram/bot';

// GET: current dashboard user's Telegram connection state — connected,
// waiting on a pending request, or not connected at all. Also used
// server-side (settings/page.tsx) for the initial render; this route stays
// for the client's poll-while-pending refresh.
export async function GET() {
  const user = await requireDashboardUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(await getTelegramConnectionStatus(user.id));
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
