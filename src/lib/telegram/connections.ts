import { createAdminClient } from '@/utils/supabase/admin';

export interface TelegramRecipient {
  telegramUserId: number;
  telegramUsername: string | null;
}

export type TelegramConnectionStatus =
  | { status: 'connected'; telegramUsername: string | null; telegramFirstName: string | null }
  | { status: 'pending'; expiresAt: string }
  | { status: 'disconnected' };

/**
 * One dashboard user's Telegram connection state — shared by the
 * server-rendered settings page (initial paint, no client round trip) and
 * the `/api/telegram/connect` GET route (client polling while 'pending').
 */
export async function getTelegramConnectionStatus(userId: string): Promise<TelegramConnectionStatus> {
  const admin = createAdminClient();

  const { data: connection } = await admin
    .from('telegram_connections')
    .select('telegram_username, telegram_first_name')
    .eq('user_id', userId)
    .maybeSingle();

  if (connection) {
    return {
      status: 'connected',
      telegramUsername: connection.telegram_username,
      telegramFirstName: connection.telegram_first_name,
    };
  }

  const { data: pending } = await admin
    .from('telegram_connection_requests')
    .select('expires_at')
    .eq('user_id', userId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pending) {
    return { status: 'pending', expiresAt: pending.expires_at };
  }

  return { status: 'disconnected' };
}

// Every dashboard user who has linked their Telegram account receives order
// notifications — there's no single global chat anymore.
export async function getConnectedTelegramRecipients(): Promise<TelegramRecipient[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('telegram_connections')
    .select('telegram_user_id, telegram_username');

  if (error) {
    console.error('Error fetching Telegram connections:', error);
    return [];
  }

  return (data || []).map((row) => ({
    telegramUserId: row.telegram_user_id,
    telegramUsername: row.telegram_username,
  }));
}
