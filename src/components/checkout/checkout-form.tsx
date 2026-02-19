'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCartStore } from '@/hooks/use-cart';
import { generateInvoice } from '@/lib/generate-invoice';
import { redirectToWhatsApp } from '@/lib/whatsapp-utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useCheckout } from '@/contexts/checkout-context';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  postal_code: z.string().min(3, 'Postal code is required'),
  currency: z.enum(['USD', 'EUR']),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [shippingFee, setShippingFee] = useState(0);
  const { setShippingFee: setContextShippingFee } = useCheckout();
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);

  // Fetch shipping zones on mount
  useEffect(() => {
    const fetchShippingZones = async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data } = await supabase.from('shipping_zones').select('*').order('country');
      if (data) setShippingZones(data);
    };
    fetchShippingZones();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      address: '',
      postal_code: '',
      currency: 'USD',
    },
  });

  // Watch country changes to update shipping fee
  // Watch country changes to update shipping fee
  const selectedCountry = form.watch('country');

  useEffect(() => {
    if (selectedCountry && shippingZones.length > 0) {
      const zone = shippingZones.find(z => z.country === selectedCountry);
      const baseRate = zone?.price || 0;
      
      // Calculate Total Quantity
      const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
      
      // Wholesale Threshold Logic ($500)
      if (getTotalPrice >= 500) {
          setShippingFee(0); // Custom Quote for wholesale
          setContextShippingFee(0);
      } else {
          // Per-Item Calculation
          const calculatedFee = baseRate * totalQuantity;
          setShippingFee(calculatedFee);
          setContextShippingFee(calculatedFee);
      }
    }
  }, [selectedCountry, shippingZones, items, getTotalPrice, setContextShippingFee]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const subtotal = getTotalPrice;
      const isWholesale = subtotal >= 500;
      
      // Final calculation check
      const finalShippingFee = isWholesale ? 0 : shippingFee;
      const total = subtotal + finalShippingFee;

      // Generate order number
      const orderNumber = `RP${Date.now()}`;

      // Prepare order data for database
      const orderData = {
        customer_name: values.name,
        customer_email: values.email,
        customer_phone: values.phone,
        customer_address: {
          line1: values.address,
          country: values.country,
          city: values.city,
          postal_code: values.postal_code,
        },
        total_amount: total,
        shipping_cost: finalShippingFee,
        status: 'pending',
        is_verified: false,
      };

      // Save order to database
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error saving order:', JSON.stringify(orderError, null, 2));
        toast.error(orderError.message || 'Failed to save order. Please try again.');
        return;
      }

      // Save order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error saving order items:', itemsError);
      }

      // Prepare invoice data
      const invoiceData = {
        customer: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          city: values.city,
          address: values.address,
          postal_code: values.postal_code,
        },
        items: items,
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: total,
        currency: values.currency,
        orderNumber: orderNumber,
        date: new Date().toLocaleDateString(),
      };

      // Generate and download PDF
      await generateInvoice(invoiceData);

      toast.success('Order placed successfully!');

      // IMPORTANT: Wait 1.5 seconds for PDF download to complete (iPhone fix)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Then redirect to WhatsApp
      redirectToWhatsApp({
        customer: {
          name: values.name,
          phone: values.phone,
          city: values.city,
          address: values.address,
        },
        total: total,
        currency: values.currency,
        orderNumber: orderNumber,
      });

      // Clear cart after successful order
      setTimeout(() => {
        clearCart();
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-heading font-medium mb-6">Delivery Information</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <PhoneInput
                    country={'tr'}
                    value={field.value}
                    onChange={(phone) => field.onChange(phone)}
                    inputClass="phone-input-field"
                    containerClass="phone-input-container"
                    buttonClass="phone-input-button"
                    enableSearch
                    searchPlaceholder="Search country"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shippingZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.country}>
                        {zone.country} {zone.city ? `- ${zone.city}` : ''} (${zone.price.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Istanbul" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Street address, apartment, building, etc."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Postal Code */}
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="34000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Invoice...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
