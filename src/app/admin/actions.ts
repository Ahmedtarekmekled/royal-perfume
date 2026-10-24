'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProducts({
  query,
  categoryIds = [],
  brandIds = [],
  stock = [],
  active = [],
  popular = [],
  sortBy = 'created_at',
  sortDir = 'desc',
  page = 1,
  limit = 10,
}: {
  query?: string;
  categoryIds?: string[];
  brandIds?: string[];
  stock?: ('true' | 'false')[];
  active?: ('true' | 'false')[];
  popular?: ('true' | 'false')[];
  sortBy?: 'name_en' | 'price' | 'created_at';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
} = {}) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let dbQuery = supabase
    .from('products')
    .select('*, categories(name), brands(name)', { count: 'exact' });

  if (query) {
    const trimmed = query.trim();
    // `id` is a uuid column — ILIKE (`~~*`) has no operator for uuid, so it
    // can only be matched exactly, never as a substring. A full UUID searches
    // by id; anything else searches the product name.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
    dbQuery = isUuid
      ? dbQuery.eq('id', trimmed)
      : dbQuery.ilike('name_en', `%${trimmed}%`);
  }
  if (categoryIds.length) dbQuery = dbQuery.in('category_id', categoryIds);
  if (brandIds.length) dbQuery = dbQuery.in('brand_id', brandIds);
  if (stock.length) dbQuery = dbQuery.in('stock', stock.map((v) => v === 'true'));
  if (active.length) dbQuery = dbQuery.in('is_active', active.map((v) => v === 'true'));
  if (popular.length) dbQuery = dbQuery.in('is_popular', popular.map((v) => v === 'true'));

  dbQuery = dbQuery
    .order(sortBy, { ascending: sortDir === 'asc' })
    .order('id', { ascending: false }); // stable tiebreaker, matches the old fetchAllRows ordering

  const { data, count, error } = await dbQuery.range(from, to);

  if (error) {
    console.error('Error fetching products:', error);
    return { data: [], totalCount: 0, totalPages: 0, error: error.message };
  }

  const formatted = (data || []).map((p: typeof data[number]) => ({
    ...p,
    category: (p as { categories?: { name: string } | null }).categories?.name,
    brand: (p as { brands?: { name: string } | null }).brands?.name,
  }));

  return {
    data: formatted,
    totalCount: count || 0,
    totalPages: count ? Math.ceil(count / limit) : 0,
    error: null as string | null,
  };
}

// `id` is a uuid column, so ILIKE can't substring-match it (that errored the
// whole query and the page showed "No orders yet"). A uuid prefix is instead
// matched as a range: pad the hex with 0s for the lower bound and f's for the
// upper bound. Postgres orders uuids bytewise, so this is exactly "starts
// with". Needs at least 4 hex chars so short words don't match everything.
function uuidPrefixRange(input: string): { min: string; max: string } | null {
  if (!/^[0-9a-f-]+$/i.test(input)) return null;
  const hex = input.replace(/-/g, '').toLowerCase();
  if (hex.length < 4 || hex.length > 32) return null;
  const format = (h: string) =>
    `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  return {
    min: format(hex.padEnd(32, '0')),
    max: format(hex.padEnd(32, 'f')),
  };
}

export async function getOrders({
  status,
  query,
  page = 1,
  limit = 20,
}: { status?: string; query?: string; page?: number; limit?: number } = {}) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let dbQuery = supabase
    .from('orders')
    .select('*, order_items(*, products(name_en, images))', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    dbQuery = dbQuery.eq('status', status);
  }

  if (query) {
    // Customers quote the short ref from emails / the success page / the
    // WhatsApp message (e.g. "#66f7f377" — the first 8 hex chars of the id),
    // so strip "#", spaces and a trailing "...". Commas and parens would break
    // PostgREST's or() syntax, so drop them from the text search too.
    const trimmed = query.trim().replace(/^#+/, '').replace(/\.+$/, '').trim();
    const text = trimmed.replace(/[,()]/g, ' ').trim();
    const filters = [
      `customer_name.ilike.%${text}%`,
      `customer_email.ilike.%${text}%`,
      `customer_phone.ilike.%${text}%`,
    ];
    const idRange = uuidPrefixRange(trimmed);
    if (idRange) {
      filters.unshift(`and(id.gte.${idRange.min},id.lte.${idRange.max})`);
    }
    dbQuery = dbQuery.or(filters.join(','));
  }

  const { data, count, error } = await dbQuery.range(from, to);

  if (error) {
    console.error('Error fetching orders:', error);
    return { data: [], totalPages: 0, error: 'Could not load orders. Please try again.' };
  }

  return {
    data: data || [],
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

export async function toggleOrderVerification(orderId: string, currentStatus: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ is_verified: !currentStatus })
    .eq('id', orderId);

  if (error) {
    throw new Error('Failed to update order status');
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    throw new Error('Failed to delete product');
  }

  revalidatePath('/admin/products');
}

export async function updateProductFields(productId: string, data: Record<string, string | number | boolean>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('id', productId);

  if (error) {
    throw new Error('Failed to update product');
  }

  revalidatePath('/admin/products');
}

export async function bulkUpdatePrice(productIds: string[], price: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .update({ price })
    .in('id', productIds);

  if (error) {
    throw new Error('Failed to update prices');
  }

  revalidatePath('/admin/products');
}

export async function deleteShippingZone(zoneId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('shipping_zones')
    .delete()
    .eq('id', zoneId);

  if (error) {
    throw new Error('Failed to delete shipping zone');
  }

  revalidatePath('/admin/shipping');
}

export async function createShippingZone(data: {
  country: string;
  price: number;
  continent?: string;
  country_code?: string;
  shipping_details?: string;
}) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('shipping_zones')
    .insert([data]);

  if (error) {
    throw new Error('Failed to create shipping zone');
  }

  revalidatePath('/admin/shipping');
}

export async function updateShippingZone(zoneId: string, data: {
  country?: string;
  price?: number;
  continent?: string;
  country_code?: string;
  shipping_details?: string;
}) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('shipping_zones')
    .update(data)
    .eq('id', zoneId);

  if (error) {
    throw new Error('Failed to update shipping zone');
  }

  revalidatePath('/admin/shipping');
}

export async function cancelOrder(orderId: string) {
  const supabase = await createClient();
  
  const { error, data } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .select();

  if (error) {
    throw new Error('Failed to cancel order');
  }

  if (!data || data.length === 0) {
    throw new Error('Order not found or you do not have permission to modify it.');
  }

  revalidatePath('/admin/orders');
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient();
  
  // Try deleting items first
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId);

  if (itemsError) {
    throw new Error('Failed to delete order items: ' + itemsError.message);
  }

  // Delete the order and select it to confirm it was actually deleted
  const { error, data } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
    .select();

  if (error) {
    throw new Error('Failed to delete order');
  }

  if (!data || data.length === 0) {
    throw new Error('Order not deleted. It may be protected by Database Row Level Security (RLS) preventing deletions.');
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}
