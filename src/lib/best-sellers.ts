import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '@/types';

/**
 * Homepage "Best Sellers": ranked in the database by get_best_sellers()
 * (most orders in the last 90 days, then units, then all-time, then
 * products flagged Popular — cancelled orders never count; see migration
 * 20261125_accurate_best_sellers.sql). Falls back to the old sales_count sort
 * if that function isn't deployed yet, so the section never goes empty.
 */
export async function getBestSellers(supabase: SupabaseClient, limit = 8): Promise<Product[]> {
  const { data: ranked, error } = await supabase.rpc('get_best_sellers', { p_limit: limit, p_days: 90 });

  if (error || !ranked) {
    if (error) console.error('get_best_sellers unavailable, falling back to sales_count:', error.message);
    const { data } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('is_active', true)
      .order('sales_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data as Product[]) || [];
  }

  const ids = (ranked as { product_id: string }[]).map((r) => r.product_id);
  if (!ids.length) return [];

  const { data } = await supabase.from('products').select('*, product_variants(*)').in('id', ids);
  const byId = new Map(((data as Product[]) || []).map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
}
