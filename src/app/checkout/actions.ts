'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ... imports ...

interface OrderData {
  items: {
    product_id: string;
    quantity: number;
    variant_id?: string; // Add variant_id
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
}

export async function createOrder(data: OrderData) {
  const supabase = await createClient();

  // 1. Validate Items & Calculate Total
  const productIds = data.items.map((item) => item.product_id);
  const variantIds = data.items.map((item) => item.variant_id).filter(Boolean) as string[];
  
  if (productIds.length === 0) {
    return { success: false, error: 'No items in order' };
  }

  // Fetch Products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price, stock, is_active, name_en') // Added name_en just in case
    .in('id', productIds)
    .eq('is_active', true);

  if (productsError || !products) {
    console.error('Error fetching products:', productsError);
    return { success: false, error: 'Failed to validate products' };
  }

  // Fetch Variants (if any)
  let variants: any[] = [];
  if (variantIds.length > 0) {
      const { data: vs, error: vError } = await supabase
        .from('product_variants')
        .select('*')
        .in('id', variantIds)
        .eq('is_active', true);
        
      if (vError) {
          console.error('Error fetching variants:', vError);
          return { success: false, error: 'Failed to validate product variants' };
      }
      variants = vs || [];
  }

  // Create maps for easy lookup
  const productMap = new Map(products.map(p => [p.id, p]));
  const variantMap = new Map(variants.map(v => [v.id, v]));

  let productsTotal = 0;
  const verifiedItems = [];

  for (const item of data.items) {
    const product = productMap.get(item.product_id);
    
    if (!product) {
        return { success: false, error: `Product ${item.product_id} not found or inactive` };
    }
    
    let unitPrice = product.price;
    let variantId = null;
    let variantName = null;

    // Variant Logic
    if (item.variant_id) {
        const variant = variantMap.get(item.variant_id);
        
        if (!variant) {
             return { success: false, error: `Variant ${item.variant_id} not found or inactive` };
        }
        
        if (variant.product_id !== item.product_id) {
             return { success: false, error: `Variant mismatch for product ${item.product_id}` };
        }

        if (variant.stock === false) { // Explicit check for boolean false
             return { success: false, error: `Variant ${variant.name} for ${product.name_en} is out of stock` };
        }
        
        // Use Variant Price (apply discount if any)
        // Ideally we should have a consistent way to calculate final price. 
        // For simplicity: Price - Discount
        const discount = variant.discount || 0;
        unitPrice = Math.max(0, variant.price - discount);
        
        variantId = variant.id;
        variantName = variant.name;

    } else {
        // Standard Product Logic
        if (!product.stock) {
             return { success: false, error: `Product ${item.product_id} is out of stock` };
        }
        // Note: Main product discount is not applied here in existing logic?
        // Analyzing previous code: it used `product.price`. 
        // If the main product has a discount field in DB, we should probably apply it too?
        // Keeping it consistent with previous logic which just used `product.price`. 
        // If `product.discount` exists in DB, let's honor it? 
        // The previous "User" request said "works exactly as before".
        // Before refactor, we trusted client. After my fix, used `product.price`.
        // Let's stick to `product.price` for now to be safe, or check if product has discount column.
        // Product interface has `discount`. Let's allow it.
        // unitPrice = product.price * (1 - (product.discount || 0) / 100); 
        // WAIT: The previous refactor didn't include discount logic for main products.
        // Let's stick to base price to avoid changing logic too much, OR check if products have discount.
        // The DB schema shows products have a `discount` column.
        unitPrice = product.price; // Start with base
        // If needed, we can add discount logic later. For now, strict backward compat.
    }

    const lineTotal = unitPrice * item.quantity;
    productsTotal += lineTotal;
    
    verifiedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        variant_id: variantId,
        variant_name: variantName
    });
  }

  // 2. Calculate Shipping Cost
  let shippingCost = 0;
  const country = data.customer.address.country;
  const city = data.customer.address.city;

  if (country) {
      const { data: zones } = await supabase
        .from('shipping_zones')
        .select('*');
        
      if (zones) {
          const cityMatch = zones.find(z => 
              z.country.toLowerCase() === country.toLowerCase() && 
              z.city?.toLowerCase() === city.toLowerCase()
          );
          
          if (cityMatch) {
              shippingCost = cityMatch.price;
          } else {
              const countryMatch = zones.find(z => 
                  z.country.toLowerCase() === country.toLowerCase() && 
                  !z.city
              );
              if (countryMatch) {
                  shippingCost = countryMatch.price;
              }
          }
      }
  }

  // 3. Final Total
  const finalTotal = productsTotal + shippingCost;

  // 4. Insert Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        customer_name: data.customer.name,
        customer_email: data.customer.email,
        customer_phone: data.customer.phone,
        customer_address: data.customer.address,
        total_amount: finalTotal,
        shipping_cost: shippingCost,
        status: 'pending',
        is_verified: false, 
      },
    ])
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    return { success: false, error: orderError.message };
  }

  // 5. Insert Order Items
  const orderItemsInsert = verifiedItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    variant_id: item.variant_id,
    variant_name: item.variant_name
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsInsert);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    return { success: false, error: itemsError.message };
  }

  revalidatePath('/admin/orders');
  return { success: true, orderId: order.id };
}
