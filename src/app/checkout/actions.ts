'use server';

import { createClient } from '@/utils/supabase/server';
import * as z from 'zod';

const createOrderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.object({
    line1: z.string().min(10),
    country: z.string().min(2),
    city: z.string().min(2),
    postal_code: z.string().min(3),
  }),
  total_amount: z.number().min(0),
  shipping_cost: z.number().min(0),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    unit_price: z.number().min(0),
  })).min(1),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Runs customer find-or-create + order creation server-side in one request,
// instead of the checkout form making several direct browser-client calls.
// Customer dedup (normalize email/phone, match-or-create) happens inside the
// find_or_create_customer RPC, atomically, before the order row is written.
export async function createOrder(input: CreateOrderInput) {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Invalid order data.' };
  }
  const data = parsed.data;

  const supabase = await createClient();

  const { data: customerResult, error: customerError } = await supabase.rpc(
    'find_or_create_customer',
    { p_name: data.name, p_email: data.email, p_phone: data.phone }
  );
  if (customerError) {
    console.error('Error resolving customer record:', customerError);
  }
  const customerId = customerResult?.[0]?.customer_id ?? null;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      customer_name: data.name,
      customer_email: data.email,
      customer_phone: data.phone,
      customer_address: data.address,
      total_amount: data.total_amount,
      shipping_cost: data.shipping_cost,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Error saving order:', orderError);
    return { error: orderError?.message || 'Failed to save order. Please try again.' };
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    data.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  );

  if (itemsError) {
    console.error('Error saving order items:', itemsError);
  } else {
    const { error: salesCountError } = await supabase.rpc('increment_sales_counts', {
      items: data.items.map((item) => ({ id: item.product_id, qty: item.quantity })),
    });
    if (salesCountError) {
      console.error('Error incrementing sales counts:', salesCountError);
    }
  }

  return { orderId: order.id as string };
}
