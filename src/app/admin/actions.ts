'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

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
