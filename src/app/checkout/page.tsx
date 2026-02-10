import { createClient } from '@/utils/supabase/server';
import CheckoutForm from '@/components/shop/CheckoutForm';

export const revalidate = 0; // Ensure fresh data on navigation

export default async function CheckoutPage() {
  const supabase = await createClient();

  // Fetch Shipping Zones
  const { data: shippingZones } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('country');

  return (
    <div className="container py-12 md:py-24">
      <h1 className="text-3xl md:text-4xl font-heading text-center mb-12">Checkout</h1>
      <CheckoutForm shippingZones={shippingZones || []} />
    </div>
  );
}
