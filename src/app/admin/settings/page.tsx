'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const settingsSchema = z.object({
  hidePrices: z.boolean().default(false),
  popupEnabled: z.boolean().default(false),
  popupTitle: z.string().default(''),
  popupMessage: z.string().default(''),
  popupButtonText: z.string().default('Shop Now'),
  popupButtonLink: z.string().default('/shop'),
  popupImageUrl: z.string().default(''),
  popupShowOn: z.string().default('all'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      hidePrices: false,
      popupEnabled: false,
      popupTitle: '',
      popupMessage: '',
      popupButtonText: 'Shop Now',
      popupButtonLink: '/shop',
      popupImageUrl: '',
      popupShowOn: 'all',
    },
  });

  const popupEnabled = form.watch('popupEnabled');

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('hide_prices, popup_enabled, popup_title, popup_message, popup_button_text, popup_button_link, popup_image_url, popup_show_on')
          .eq('id', 'global')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching settings:', error);
        } else if (data) {
          form.reset({
            hidePrices: data.hide_prices,
            popupEnabled: data.popup_enabled ?? false,
            popupTitle: data.popup_title ?? '',
            popupMessage: data.popup_message ?? '',
            popupButtonText: data.popup_button_text ?? 'Shop Now',
            popupButtonLink: data.popup_button_link ?? '/shop',
            popupImageUrl: data.popup_image_url ?? '',
            popupShowOn: data.popup_show_on ?? 'all',
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [supabase, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('system_settings')
        .update({
          hide_prices: data.hidePrices,
          popup_enabled: data.popupEnabled,
          popup_title: data.popupTitle,
          popup_message: data.popupMessage,
          popup_button_text: data.popupButtonText,
          popup_button_link: data.popupButtonLink,
          popup_image_url: data.popupImageUrl,
          popup_show_on: data.popupShowOn,
        })
        .eq('id', 'global');

      if (error) throw error;
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold">Store Settings</h1>
        <p className="text-gray-500 mt-2">Manage global configuration for your store.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* ── General Settings ─────────────────────────────── */}
          <div className="bg-white p-6 rounded-lg border shadow-sm max-w-2xl">
            <h2 className="text-lg font-semibold mb-4">General</h2>
            <FormField
              control={form.control}
              name="hidePrices"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-black">Hide Global Prices</FormLabel>
                    <FormDescription>
                      When enabled, product prices and checkout totals will be hidden across the entire store. Users will see a &quot;Contact for price&quot; message instead.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* ── Popup Settings ───────────────────────────────── */}
          <div className="bg-white p-6 rounded-lg border shadow-sm max-w-2xl">
            <h2 className="text-lg font-semibold mb-4">Popup Banner</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="popupEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-black">Enable Popup</FormLabel>
                      <FormDescription>
                        Show a promotional popup to visitors. It appears once per session.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {popupEnabled && (
                <div className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="popupShowOn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Show On</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pages" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Pages</SelectItem>
                            <SelectItem value="shop">Shop Page Only</SelectItem>
                            <SelectItem value="home">Home Page Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose which pages the popup appears on.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="popupTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Welcome to Royal Perfumes!" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="popupMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g. Explore our new arrivals and get free shipping on your first order."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="popupButtonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Shop Now" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="popupButtonLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Link</FormLabel>
                          <FormControl>
                            <Input placeholder="/shop" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="popupImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://... or /images/..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Add a banner image at the top of the popup. Leave empty for text-only.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </form>
      </Form>
    </div>
  );
}
