'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CalendarRange, Loader2, Megaphone, Store } from 'lucide-react';
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
import TelegramConnectCard from './TelegramConnectCard';
import type { TelegramConnectionStatus } from '@/lib/telegram/connections';
import { resolveMinOrderQuantity } from '@/lib/min-order';

const settingsSchema = z.object({
  hidePrices: z.boolean().default(false),
  minOrderQuantity: z.coerce
    .number({ message: 'Enter a number' })
    .int('Must be a whole number')
    .min(1, 'Must be at least 1')
    .max(100000, 'That looks too high'),
  popupEnabled: z.boolean().default(false),
  popupTitle: z.string().default(''),
  popupMessage: z.string().default(''),
  popupButtonText: z.string().default('Shop Now'),
  popupButtonLink: z.string().default('/shop'),
  popupImageUrl: z.string().default(''),
  popupShowOn: z.string().default('all'),
  seasonalCollectionsMultiActive: z.boolean().default(false),
  seasonalSectionPosition: z.string().default('after_gender_collection'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export interface SettingsInitialData {
  hide_prices: boolean;
  min_order_quantity: number | null;
  popup_enabled: boolean | null;
  popup_title: string | null;
  popup_message: string | null;
  popup_button_text: string | null;
  popup_button_link: string | null;
  popup_image_url: string | null;
  popup_show_on: string | null;
  seasonal_collections_multi_active: boolean | null;
  seasonal_section_position: string | null;
}

interface SettingsFormProps {
  initialData: SettingsInitialData | null;
  initialTelegramStatus?: TelegramConnectionStatus;
}

export default function SettingsForm({ initialData, initialTelegramStatus }: SettingsFormProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      hidePrices: initialData?.hide_prices ?? false,
      minOrderQuantity: resolveMinOrderQuantity(initialData?.min_order_quantity),
      popupEnabled: initialData?.popup_enabled ?? false,
      popupTitle: initialData?.popup_title ?? '',
      popupMessage: initialData?.popup_message ?? '',
      popupButtonText: initialData?.popup_button_text ?? 'Shop Now',
      popupButtonLink: initialData?.popup_button_link ?? '/shop',
      popupImageUrl: initialData?.popup_image_url ?? '',
      popupShowOn: initialData?.popup_show_on ?? 'all',
      seasonalCollectionsMultiActive: initialData?.seasonal_collections_multi_active ?? false,
      seasonalSectionPosition: initialData?.seasonal_section_position ?? 'after_gender_collection',
    },
  });

  const popupEnabled = form.watch('popupEnabled');

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('system_settings')
        .update({
          hide_prices: data.hidePrices,
          min_order_quantity: data.minOrderQuantity,
          popup_enabled: data.popupEnabled,
          popup_title: data.popupTitle,
          popup_message: data.popupMessage,
          popup_button_text: data.popupButtonText,
          popup_button_link: data.popupButtonLink,
          popup_image_url: data.popupImageUrl,
          popup_show_on: data.popupShowOn,
          seasonal_collections_multi_active: data.seasonalCollectionsMultiActive,
          seasonal_section_position: data.seasonalSectionPosition,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24 md:pb-0">

        {/* ── Store & Orders ───────────────────────────────── */}
        <SettingsSection
          icon={<Store className="h-4 w-4" />}
          title="Store & Orders"
          description="Pricing visibility and checkout rules for the storefront."
        >
          <FormField
            control={form.control}
            name="hidePrices"
            render={({ field }) => (
              <FormItem className={rowClass}>
                <div className="space-y-1 min-w-0">
                  <FormLabel className="text-sm font-medium text-gray-900">Hide Global Prices</FormLabel>
                  <FormDescription className="text-xs sm:text-sm">
                    Hide product prices and checkout totals across the store. Customers see &quot;Contact for price&quot; instead.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch className="shrink-0" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minOrderQuantity"
            render={({ field }) => (
              <FormItem className={rowClass}>
                <div className="space-y-1 min-w-0">
                  <FormLabel className="text-sm font-medium text-gray-900">Minimum Order Quantity</FormLabel>
                  <FormDescription className="text-xs sm:text-sm">
                    Minimum total pieces required to check out. Also shown on the homepage &quot;Start with Just X Pieces&quot; strap.
                  </FormDescription>
                  <FormMessage />
                </div>
                <FormControl>
                  <div className="relative shrink-0 w-full sm:w-36">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      className="pr-12 text-right tabular-nums"
                      {...field}
                      value={field.value ?? ''}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      pcs
                    </span>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </SettingsSection>

        {/* ── Telegram Notifications ───────────────────────── */}
        <TelegramConnectCard initialStatus={initialTelegramStatus} />

        {/* ── Popup Settings ───────────────────────────────── */}
        <SettingsSection
          icon={<Megaphone className="h-4 w-4" />}
          title="Popup Banner"
          description="A promotional popup shown once per visitor session."
        >
          <FormField
            control={form.control}
            name="popupEnabled"
            render={({ field }) => (
              <FormItem className={rowClass}>
                <div className="space-y-1 min-w-0">
                  <FormLabel className="text-sm font-medium text-gray-900">Enable Popup</FormLabel>
                  <FormDescription className="text-xs sm:text-sm">
                    Show a promotional popup to visitors. It appears once per session.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch className="shrink-0" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {popupEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-dashed p-4">
              <FormField
                control={form.control}
                name="popupShowOn"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Show On</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select pages" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Pages</SelectItem>
                        <SelectItem value="shop">Shop Page Only</SelectItem>
                        <SelectItem value="home">Home Page Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose which pages the popup appears on.</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="popupTitle"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
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
                  <FormItem className="sm:col-span-2">
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

              <FormField
                control={form.control}
                name="popupImageUrl"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
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
        </SettingsSection>

        {/* ── Seasonal Collections ──────────────────────────── */}
        <SettingsSection
          icon={<CalendarRange className="h-4 w-4" />}
          title="Seasonal Collections"
          description="How seasonal collections appear on the homepage."
        >
          <FormField
            control={form.control}
            name="seasonalCollectionsMultiActive"
            render={({ field }) => (
              <FormItem className={rowClass}>
                <div className="space-y-1 min-w-0">
                  <FormLabel className="text-sm font-medium text-gray-900">Allow Multiple Active Collections</FormLabel>
                  <FormDescription className="text-xs sm:text-sm">
                    When enabled, every currently-active seasonal collection shows on the homepage.
                    When disabled, only the highest-priority one (by Display Order) is shown.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch className="shrink-0" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seasonalSectionPosition"
            render={({ field }) => (
              <FormItem className={rowClass}>
                <div className="space-y-1 min-w-0">
                  <FormLabel className="text-sm font-medium text-gray-900">Homepage Section Position</FormLabel>
                  <FormDescription className="text-xs sm:text-sm">
                    Where the Seasonal Collection section appears among the homepage&apos;s fixed sections.
                  </FormDescription>
                </div>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-56 shrink-0">
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="after_hero">After Hero</SelectItem>
                    <SelectItem value="after_brand_ticker">After Brand Ticker</SelectItem>
                    <SelectItem value="after_gender_collection">After Gender Collection</SelectItem>
                    <SelectItem value="after_category_carousel">After Category Carousel</SelectItem>
                    <SelectItem value="after_best_sellers">After Best Sellers</SelectItem>
                    <SelectItem value="after_new_arrivals">After New Arrivals</SelectItem>
                    <SelectItem value="before_footer">Before Footer</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </SettingsSection>

        {/* Save bar: pinned to the bottom on mobile, inline on desktop */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur px-4 py-3 md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="flex items-center justify-end gap-3">
            {form.formState.isDirty && (
              <span className="hidden sm:inline text-xs text-gray-500">You have unsaved changes</span>
            )}
            <Button type="submit" disabled={saving} className="w-full md:w-auto md:min-w-40">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

const rowClass =
  'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 rounded-lg border p-4 space-y-0';

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-lg border shadow-sm">
      <div className="flex items-start gap-3 border-b px-4 py-4 sm:px-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-700">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-xs sm:text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-6">{children}</div>
    </section>
  );
}
