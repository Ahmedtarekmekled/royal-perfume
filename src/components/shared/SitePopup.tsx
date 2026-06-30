'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';

interface PopupSettings {
  popup_enabled: boolean;
  popup_title: string;
  popup_message: string;
  popup_button_text: string;
  popup_button_link: string;
  popup_image_url: string;
  popup_show_on: string; // 'all' | 'shop' | 'home'
}

export default function SitePopup() {
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on admin pages
    if (pathname?.startsWith('/admin')) return;

    // Check if popup was already dismissed in the last 24 hours
    const dismissedData = localStorage.getItem('popup_dismissed_v2');
    if (dismissedData) {
      try {
        const { timestamp } = JSON.parse(dismissedData);
        const hoursSinceDismissed = (Date.now() - timestamp) / (1000 * 60 * 60);
        if (hoursSinceDismissed < 24) return; // 24-hour cooldown
      } catch (e) {
        // Fallback if parsing fails
      }
    }

    async function fetchPopup() {
      const supabase = createClient();
      const { data } = await supabase
        .from('system_settings')
        .select('popup_enabled, popup_title, popup_message, popup_button_text, popup_button_link, popup_image_url, popup_show_on')
        .eq('id', 'global')
        .single();

      if (data && data.popup_enabled) {
        const showOn = data.popup_show_on || 'all';
        const shouldShow =
          showOn === 'all' ||
          (showOn === 'shop' && pathname?.startsWith('/shop')) ||
          (showOn === 'home' && (pathname === '/' || pathname === '/home1'));

        if (shouldShow) {
          // Small delay so the page loads first
          setTimeout(() => setIsOpen(true), 1500);
          setSettings(data as PopupSettings);
        }
      }
    }

    fetchPopup();
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('popup_dismissed_v2', JSON.stringify({ timestamp: Date.now() }));
  };

  if (!isOpen || !settings) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white w-full max-w-md pointer-events-auto shadow-2xl animate-in zoom-in-95 fade-in duration-300">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Optional Image */}
          {settings.popup_image_url && (
            <div className="relative w-full aspect-[16/9] bg-gray-100">
              <Image
                src={settings.popup_image_url}
                alt={settings.popup_title || 'Promotion'}
                fill
                className="object-cover"
                sizes="(max-width: 448px) 100vw, 448px"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8 text-center">
            {settings.popup_title && (
              <h2 className="text-2xl md:text-3xl font-heading font-medium mb-3">
                {settings.popup_title}
              </h2>
            )}

            {settings.popup_message && (
              <p className="text-sm md:text-base text-gray-500 font-body font-light leading-relaxed mb-6">
                {settings.popup_message}
              </p>
            )}

            {settings.popup_button_text && (
              <Link
                href={settings.popup_button_link || '/shop'}
                onClick={handleClose}
                className="inline-flex items-center justify-center bg-black text-white px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-body font-medium hover:bg-gray-800 transition-colors w-full"
              >
                {settings.popup_button_text}
              </Link>
            )}

            <button
              onClick={handleClose}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 uppercase tracking-widest font-body transition-colors"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
