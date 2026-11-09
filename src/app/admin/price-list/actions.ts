'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { parsePriceListParams } from '@/lib/price-list/config';
import { getPriceListGroups } from '@/lib/price-list/data';
import { cleanParams, paramsToRecord } from '@/lib/price-list/saved';

type Result = { success: true; id: string } | { success: false; error: string };

/** Creates a saved price list, or updates `id` when given. */
export async function savePriceList(rawParams: string, id?: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Please sign in again.' };

  const params = cleanParams(rawParams);
  const config = parsePriceListParams(paramsToRecord(params));

  let productCount = 0;
  try {
    productCount = (await getPriceListGroups(config)).rowCount;
  } catch {
    // Count is display-only; never block a save on it.
  }

  const row = {
    title: config.title,
    note: config.note,
    params,
    product_count: productCount,
    updated_at: new Date().toISOString(),
  };

  const query = id
    ? supabase.from('price_lists').update(row).eq('id', id).select('id').single()
    : supabase.from('price_lists').insert({ ...row, created_by: user.id }).select('id').single();

  const { data, error } = await query;
  if (error || !data) {
    console.error('Save price list failed:', error);
    const missing = error?.code === '42P01' || error?.code === 'PGRST205';
    return {
      success: false,
      error: missing ? 'Saved price lists need the database update — see the notice on the Price Lists page.' : 'Could not save the price list.',
    };
  }

  revalidatePath('/admin/price-list');
  revalidatePath(`/admin/price-list/${data.id}`);
  return { success: true, id: data.id };
}

export async function deletePriceList(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('price_lists').delete().eq('id', id);
  if (error) {
    console.error('Delete price list failed:', error);
    return { success: false, error: 'Could not delete the price list.' };
  }
  revalidatePath('/admin/price-list');
  return { success: true };
}
