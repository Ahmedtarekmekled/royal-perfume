'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface OrderData {
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      city: string;
      country: string;
      postal_code: string;
    };
  };
  shipping_cost: number;
  total_amount: number;
}

export async function createOrder(data: OrderData) {
  const supabase = await createClient();

  // 1. Insert Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        customer_name: data.customer.name,
        customer_email: data.customer.email,
        customer_phone: data.customer.phone,
        customer_address: data.customer.address,
        total_amount: data.total_amount,
        shipping_cost: data.shipping_cost,
        status: 'pending',
        is_verified: false, // Default to false (Ghost Order)
      },
    ])
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    return { success: false, error: orderError.message };
  }

  // 2. Insert Order Items
  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    // Ideally rollback order here, but for now we just log
    return { success: false, error: itemsError.message };
  }

  revalidatePath('/admin/orders');
  return { success: true, orderId: order.id };
}
