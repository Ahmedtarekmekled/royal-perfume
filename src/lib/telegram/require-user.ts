import { createClient } from '@/utils/supabase/server';

// /admin pages are gated by middleware, but API routes have their own URLs
// and need their own check before touching a user's Telegram connection.
export async function requireDashboardUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
