import { createClient } from '@/utils/supabase/server';

export interface SavedPriceList {
  id: string;
  title: string;
  note: string;
  params: string;
  product_count: number;
  created_at: string;
  updated_at: string;
}

const COLUMNS = 'id, title, note, params, product_count, created_at, updated_at';

/** Builder-only keys that never belong in a saved list's settings. */
const TRANSIENT_KEYS = new Set(['format', 'list', 'error']);

export function cleanParams(input: string): string {
  const qs = new URLSearchParams(input);
  const out = new URLSearchParams();
  qs.forEach((v, k) => {
    if (!TRANSIENT_KEYS.has(k)) out.append(k, v);
  });
  out.set('s', '1');
  return out.toString();
}

/** URLSearchParams → the `Record<string, string | string[]>` shape parsePriceListParams reads. */
export function paramsToRecord(params: string): Record<string, string | string[]> {
  const qs = new URLSearchParams(params);
  return Object.fromEntries(
    [...new Set(qs.keys())].map((k) => {
      const all = qs.getAll(k);
      return [k, all.length > 1 ? all : all[0]];
    })
  );
}

/** `missingTable` lets the page explain itself if the migration isn't applied yet. */
export async function listSavedPriceLists(): Promise<{ lists: SavedPriceList[]; missingTable: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('price_lists').select(COLUMNS).order('updated_at', { ascending: false });
  if (error) {
    const missingTable = error.code === '42P01' || error.code === 'PGRST205' || /price_lists/.test(error.message);
    if (!missingTable) console.error('Failed to load price lists:', error);
    return { lists: [], missingTable };
  }
  return { lists: (data as SavedPriceList[]) || [], missingTable: false };
}

export async function getSavedPriceList(id: string): Promise<SavedPriceList | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from('price_lists').select(COLUMNS).eq('id', id).maybeSingle();
  return (data as SavedPriceList) ?? null;
}
