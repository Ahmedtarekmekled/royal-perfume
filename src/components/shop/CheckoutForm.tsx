"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useMemo } from 'react';
import { useCartStore } from '@/store/useCartStore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { createOrder } from '@/app/checkout/actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

interface ShippingZone {
  id: string;
  country: string;
  city: string | null;
  price: number;
}

interface CheckoutFormProps {
  shippingZones: ShippingZone[];
}

export default function CheckoutForm({ shippingZones }: CheckoutFormProps) {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    },
  });

  const selectedCountry = form.watch('country');
  const selectedCity = form.watch('city');

  // Calculate Shipping Cost
  const shippingCost = useMemo(() => {
    if (!selectedCountry) return 0;
    
    // Try to find specific city match first
    const cityMatch = shippingZones.find(
      (z) =>
        z.country === selectedCountry &&
        z.city?.toLowerCase() === selectedCity?.toLowerCase()
    );

    if (cityMatch) return cityMatch.price;

    // Fallback to country match (where city is null)
    const countryMatch = shippingZones.find(
      (z) => z.country === selectedCountry && !z.city
    );

    return countryMatch?.price || 0; // Default or 0 if not found
  }, [selectedCountry, selectedCity, shippingZones]);

  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost;

  // Get unique countries for dropdown
  const uniqueCountries = Array.from(new Set(shippingZones.map((z) => z.country)));

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (items.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          variant_id: item.variantId, // Pass variant_id
        })),
        customer: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: {
            line1: values.address,
            city: values.city,
            postal_code: values.postalCode,
            country: values.country,
          },
        },
      };

      const result = await createOrder(orderData);

      if (result.success) {
        clearCart();
        router.push(`/checkout/success?orderId=${result.orderId}`);
      } else {
        alert('Failed to place order: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-heading mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push('/shop')}>Go Shopping</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left: Form */}
      <div>
        <h2 className="text-2xl font-heading mb-6">Shipping Details</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueCountries.map((country) => (
                           <SelectItem key={country} value={country}>
                             {country}
                           </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full py-6 text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Placing Order...' : `Place Order - ${formatCurrency(total)}`}
            </Button>
          </form>
        </Form>
      </div>

      {/* Right: Order Summary */}
      <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg h-fit">
        <h2 className="text-2xl font-heading mb-6">Order Summary</h2>
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative aspect-square h-16 w-16 overflow-hidden rounded-md border bg-white">
                <Image
                  src={item.images[0] || '/placeholder.png'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingCost > 0 ? formatCurrency(shippingCost) : 'Calculated at checkout'}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
