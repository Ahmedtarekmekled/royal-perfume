import { createAdminClient } from '@/utils/supabase/admin';

export interface TelegramRecipient {
  telegramUserId: number;
  telegramUsername: string | null;
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
