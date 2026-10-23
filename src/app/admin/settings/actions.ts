'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { STORE_SETTINGS_TAG } from '@/lib/order-settings';

// The storefront caches system_settings (layout, homepage, min order) for up
// to 60s. Called after the admin saves settings so changes show up on the
// very next request instead of after the cache window.
export async function refreshStoreSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  updateTag(STORE_SETTINGS_TAG);
  revalidatePath('/', 'layout');
  return { ok: true };
}
