import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import SuccessClient from '@/components/shop/SuccessClient';

interface SuccessPageProps {
  searchParams: {
    orderId?: string;
  };
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = searchParams;
  const supabase = await createClient();
  
  let order = null;
  let items = [];

  if (orderId) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      order = orderData;

      if (order) {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*, products(name)')
            .eq('order_id', orderId);
          items = orderItems || [];
      }
  }

  return (
    <div className="container min-h-[60vh] flex flex-col items-center justify-center py-24 text-center">
      <CheckCircle className="h-24 w-24 text-green-500 mb-8" />
      <h1 className="text-4xl font-heading mb-4">Order Placed Successfully!</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        Thank you for your purchase. Your order has been received and is being processed.
        {orderId && <span className="block mt-2 font-medium text-black">Order ID: {orderId}</span>}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/shop">
          <Button variant="outline" size="lg">Continue Shopping</Button>
        </Link>
        
        {order && (
            <SuccessClient order={order} items={items} />
        )}
      </div>
    </div>
  );
}
