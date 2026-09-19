import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-only client using the service role key, which bypasses RLS.
// Never import this from a 'use client' component or anything that ships
// to the browser — it's for route handlers reading/writing tables (like
// integration_settings) that intentionally have no public RLS policies.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
