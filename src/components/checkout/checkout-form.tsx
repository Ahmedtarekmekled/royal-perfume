'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCheckout } from '@/contexts/checkout-context';
import { useSettings } from '@/components/providers/SettingsProvider';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  postal_code: z.string().min(3, 'Postal code is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [shippingFee, setShippingFee] = useState(0);
  const { setShippingFee: setContextShippingFee } = useCheckout();
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const { hidePrices, minOrderQuantity } = useSettings();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const cartQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const remainingToMinimum = Math.max(minOrderQuantity - cartQuantity, 0);

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
    },
  });

  // Watch country changes to update shipping fee
  const selectedCountry = form.watch('country');

  useEffect(() => {
    if (selectedCountry && shippingZones.length > 0) {
      const zone = shippingZones.find(z => z.country === selectedCountry);
      const baseRate = zone?.price || 0;
      
      // Calculate Total Quantity
      const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
      
      // Wholesale Threshold Logic (500+ Items)
      if (totalQuantity >= 500) {
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
    setSubmitError(null);
    if (remainingToMinimum > 0) {
      const message = `The minimum order is ${minOrderQuantity} pieces. Please add ${remainingToMinimum} more to your cart.`;
      setSubmitError(message);
      toast.error(message);
      return;
    }

    try {
      setIsSubmitting(true);

      const subtotal = getTotalPrice;
      const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
      const isWholesale = totalQuantity >= 500;
      
      // Final calculation check
      const finalShippingFee = isWholesale || hidePrices ? 0 : shippingFee;
      const total = hidePrices ? 0 : (subtotal + finalShippingFee);

      // hidePrices only hides prices from customers on the storefront — the
      // owner's own Telegram notification should always show the real
      // numbers, so these skip the hidePrices zeroing (wholesale's $0
      // shipping is a genuine "custom quote", so that part still applies).
      const notificationShippingFee = isWholesale ? 0 : shippingFee;
      const notificationTotal = subtotal + notificationShippingFee;

      // Generate order number
      const orderNumber = `RP${Date.now()}`;

      // Customer lookup/creation + order + order_items + sales-count all run
      // server-side in one request, instead of several direct browser-client
      // calls. Dedup by normalized email/phone happens inside the DB RPC.
      const { createOrder } = await import('@/app/checkout/actions');
      const result = await createOrder({
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: {
          line1: values.address,
          country: values.country,
          city: values.city,
          postal_code: values.postal_code,
        },
        total_amount: total,
        shipping_cost: finalShippingFee,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      });

      if (result.error || !result.orderId) {
        console.error('Error saving order:', result.error);
        const message = result.error || 'Failed to save order. Please try again.';
        setSubmitError(message);
        toast.error(message);
        return;
      }

      const order = { id: result.orderId };

      // Send Order Confirmation Email Natively
      try {
        await fetch('/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'confirmation',
            email: values.email,
            orderId: order.id,
            customerName: values.name,
          }),
        });
      } catch (emailError) {
        console.error('Non-fatal error: Failed to send confirmation email', emailError);
      }

      // Notify Telegram
      try {
        await fetch('/api/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            orderNumber,
            customerName: values.name,
            customerEmail: values.email,
            customerPhone: values.phone,
            address: {
              line1: values.address,
              city: values.city,
              country: values.country,
              postal_code: values.postal_code,
            },
            items: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.images?.[0] || item.image || null,
            })),
            shippingCost: notificationShippingFee,
            total: notificationTotal,
          }),
        });
      } catch (telegramError) {
        console.error('Non-fatal error: Failed to send Telegram notification', telegramError);
      }

      toast.success('Order placed successfully!');
      
      // Redirect to the success page to handle UI updates
      router.push(`/checkout/success?orderId=${order.id}`);

    } catch (error) {
      console.error('Error placing order:', error);
      setSubmitError('Failed to place order. Please check your connection and try again.');
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
                    placeholder="e.g. 555 123 45 67"
                    enableSearch
                    searchPlaceholder="Search country"
                    countryCodeEditable={false}
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
                        {zone.country} {zone.city ? `- ${zone.city}` : ''} {hidePrices ? '' : `(${zone.price.toFixed(2)} / item)`}
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

          {submitError && (
            <div role="alert" className="flex items-start gap-3 border-l-2 border-red-800 bg-neutral-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-800" strokeWidth={1.5} />
              <p className="text-sm font-body font-light text-foreground">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || remainingToMinimum > 0}
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
          {remainingToMinimum > 0 && (
            <p className="text-xs text-center font-body font-light text-muted-foreground">
              Add {remainingToMinimum} more {remainingToMinimum === 1 ? 'piece' : 'pieces'} to reach the {minOrderQuantity}-piece minimum.{' '}
              <Link href="/shop" className="text-foreground underline underline-offset-4 hover:text-muted-foreground">
                Continue shopping
              </Link>
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
