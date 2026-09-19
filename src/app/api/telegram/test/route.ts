import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireDashboardUser } from '@/lib/telegram/require-user';
import { sendTelegramMessage } from '@/lib/telegram/bot';

// Sends a test message to the current dashboard user's own connected
// Telegram account (not a broadcast to everyone).
export async function POST() {
  const user = await requireDashboardUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: connection } = await admin
    .from('telegram_connections')
    .select('telegram_user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!connection) {
    return NextResponse.json({ error: 'Telegram is not connected' }, { status: 400 });
  }

  const ok = await sendTelegramMessage(
    connection.telegram_user_id,
    '✅ RoyalPerfume is connected. New orders will appear here.'
  );

  if (!ok) {
    return NextResponse.json({ error: 'Telegram rejected the test message' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
