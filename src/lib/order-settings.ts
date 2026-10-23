import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { resolveMinOrderQuantity } from '@/lib/min-order';

// Shared cache tag for every cached system_settings read, so saving settings
// in the admin can expire them all at once (see refreshStoreSettings).
export const STORE_SETTINGS_TAG = 'store-settings';

// select('*') rather than naming the column, so a missing column (before the
// migration runs) degrades to the default instead of erroring the query.
export const getMinOrderQuantity = unstable_cache(
  async (): Promise<number> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'global')
      .single();
    return resolveMinOrderQuantity(data?.min_order_quantity);
  },
  ['min-order-quantity'],
  { revalidate: 60, tags: [STORE_SETTINGS_TAG] }
);
