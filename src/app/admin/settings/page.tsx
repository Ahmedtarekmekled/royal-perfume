import { createClient } from '@/utils/supabase/server';
import SettingsForm from '@/components/admin/SettingsForm';
import { requireDashboardUser } from '@/lib/telegram/require-user';
import { getTelegramConnectionStatus, type TelegramConnectionStatus } from '@/lib/telegram/connections';

export default async function SettingsPage() {
  const supabase = await createClient();

  // Independent reads — run together instead of one after another.
  const [{ data, error }, telegramUser] = await Promise.all([
    supabase
      .from('system_settings')
      .select('hide_prices, popup_enabled, popup_title, popup_message, popup_button_text, popup_button_link, popup_image_url, popup_show_on, seasonal_collections_multi_active, seasonal_section_position')
      .eq('id', 'global')
      .single(),
    requireDashboardUser(),
  ]);

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
  }

  // Depends on the user lookup above, so it stays a separate sequential call.
  const telegramStatus: TelegramConnectionStatus | undefined = telegramUser
    ? await getTelegramConnectionStatus(telegramUser.id)
    : undefined;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold">Store Settings</h1>
        <p className="text-gray-500 mt-2">Manage global configuration for your store.</p>
      </div>

      <SettingsForm initialData={data} initialTelegramStatus={telegramStatus} />
    </div>
  );
}
