export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount: number;
  category_id: string | null;
  stock: boolean;
  images: string[];
  is_active: boolean;
  target_audience: string; // 'Men', 'Women', 'Unisex'
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Address {
  line1: string;
  city: string;
  country: string;
  postal_code: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: Address | null; // JSONB stored as object
  total_amount: number;
  shipping_cost: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  is_verified: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product; // Joined
}

export interface ShippingZone {
  id: string;
  country: string;
  city: string | null;
  price: number;
}
