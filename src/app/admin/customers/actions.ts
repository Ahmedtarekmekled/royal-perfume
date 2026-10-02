'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { CustomerStats } from '@/types';

const emptyStats: CustomerStats = {
  customer_id: '',
  order_count: 0,
  total_spent: 0,
  first_order_at: null,
  last_order_at: null,
};

export async function getCustomers({
  query,
  page = 1,
  limit = 20,
}: { query?: string; page?: number; limit?: number } = {}) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let dbQuery = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (query) {
    const trimmed = query.trim();
    const normalizedPhone = trimmed.replace(/[^0-9+]/g, '');

    // A query may also be (part of) an order ID; resolve those to their
    // customer first so searching "by order number" works from this box.
    const { data: matchingOrders } = await supabase
      .from('orders')
      .select('customer_id')
      .ilike('id', `%${trimmed}%`)
      .not('customer_id', 'is', null)
      .limit(50);
    const orderMatchIds = Array.from(
      new Set((matchingOrders || []).map((o) => o.customer_id).filter(Boolean))
    );

    const filters = [`name.ilike.%${trimmed}%`, `email.ilike.%${trimmed}%`];
    if (normalizedPhone) filters.push(`normalized_phone.ilike.%${normalizedPhone}%`);
    if (orderMatchIds.length > 0) filters.push(`id.in.(${orderMatchIds.join(',')})`);

    dbQuery = dbQuery.or(filters.join(','));
  }

  const { data: customers, count, error } = await dbQuery.range(from, to);

  if (error) {
    console.error('Error fetching customers:', error);
    return { data: [], totalPages: 0 };
  }

  const ids = (customers || []).map((c) => c.id);
  const { data: stats } = ids.length
    ? await supabase.from('customer_stats').select('*').in('customer_id', ids)
    : { data: [] as CustomerStats[] };
  const statsMap = new Map((stats || []).map((s) => [s.customer_id, s]));

  const data = (customers || []).map((c) => ({
    ...c,
    stats: statsMap.get(c.id) ?? { ...emptyStats, customer_id: c.id },
  }));

  return { data, totalPages: count ? Math.ceil(count / limit) : 0 };
}

export async function getCustomerById(customerId: string) {
  const supabase = await createClient();

  const [{ data: customer, error: customerError }, { data: statsRows }, { data: orders }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', customerId).single(),
    supabase.from('customer_stats').select('*').eq('customer_id', customerId),
    supabase
      .from('orders')
      .select('id, created_at, total_amount, status')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false }),
  ]);

  if (customerError || !customer) return null;

  return {
    customer,
    stats: statsRows?.[0] ?? { ...emptyStats, customer_id: customerId },
    orders: orders ?? [],
  };
}

export async function updateCustomerNotes(customerId: string, notes: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('customers')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', customerId);

  if (error) {
    throw new Error('Failed to update customer notes');
  }

  revalidatePath(`/admin/customers/${customerId}`);
}

export async function getUnresolvedMergeConflicts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customer_merge_conflicts')
    .select('*, email_customer:customers!email_customer_id(id, name, email), phone_customer:customers!phone_customer_id(id, name, phone)')
    .eq('resolved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching merge conflicts:', error);
    return [];
  }

  return data || [];
}

export async function resolveMergeConflict(conflictId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('customer_merge_conflicts')
    .update({ resolved: true })
    .eq('id', conflictId);

  if (error) {
    throw new Error('Failed to resolve conflict');
  }

  revalidatePath('/admin/customers');
}
