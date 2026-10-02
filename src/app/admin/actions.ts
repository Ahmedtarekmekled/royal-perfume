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
    dbQuery = dbQuery.or(`name_en.ilike.%${trimmed}%,id.ilike.%${trimmed}%`);
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
    return { data: [], totalCount: 0, totalPages: 0 };
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
    dbQuery = dbQuery.or(`id.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`);
  }

  const { data, count, error } = await dbQuery.range(from, to);

  if (error) {
    console.error('Error fetching orders:', error);
    return { data: [], totalPages: 0 };
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
