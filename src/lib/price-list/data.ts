import { createClient } from '@/utils/supabase/server';
import { fetchAllRows } from '@/lib/fetch-all-rows';
import { buildPriceRows, type PriceGroup, type PriceListConfig, type SourceProduct } from './config';

export interface PriceListOption {
  id: string;
  name: string;
}

export async function getPriceListOptions(): Promise<{ categories: PriceListOption[]; brands: PriceListOption[] }> {
  const supabase = await createClient();
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from('categories').select('id, name').order('name'),
    supabase.from('brands').select('id, name').order('name'),
  ]);
  return { categories: categories || [], brands: brands || [] };
}

/** Loads the filtered catalog (all pages past PostgREST's row cap) and builds grouped rows. */
export async function getPriceListGroups(config: PriceListConfig): Promise<{ groups: PriceGroup[]; rowCount: number }> {
  const supabase = await createClient();
  const { categories, brands } = await getPriceListOptions();

  const products = await fetchAllRows<SourceProduct>((from, to) => {
    let query = supabase
      .from('products')
      .select(
        'id, name_en, description_en, price, discount, stock, is_active, images, target_audience, category_id, brand_id'
      )
      .order('name_en')
      .range(from, to);
    if (config.activeOnly) query = query.eq('is_active', true);
    if (config.categoryIds.length) query = query.in('category_id', config.categoryIds);
    if (config.brandIds.length) query = query.in('brand_id', config.brandIds);
    if (config.audience !== 'all') query = query.eq('target_audience', config.audience);
    if (config.q) query = query.ilike('name_en', `%${config.q}%`);
    return query;
  });

  const groups = buildPriceRows(
    products,
    config,
    new Map(brands.map((b) => [b.id, b.name])),
    new Map(categories.map((c) => [c.id, c.name]))
  );
  const rowCount = groups.reduce((n, g) => n + g.rows.length, 0);
  return { groups, rowCount };
}
