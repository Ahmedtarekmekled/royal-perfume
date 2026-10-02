'use client';

import Script from 'next/script';
import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Google Consent Mode v2. gtag.js loads unconditionally (it's cookieless and
 * sends no identifiable data until consent is granted — this is the whole
 * point of Consent Mode, not a privacy regression from the old "don't load
 * until accepted" approach), with analytics_storage defaulted to 'denied'.
 * CookieBanner's accept click calls `gtag('consent', 'update', ...)` via the
 * 'cookies-accepted' event to grant it; declining (or never choosing) leaves
 * it denied, which is also the fallback if localStorage is unavailable.
 */
function ConsentAndGtag() {
  useEffect(() => {
    const grant = () => window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    try {
      if (localStorage.getItem('cookies_accepted') === 'true') grant();
    } catch {
      // localStorage unavailable (private mode, blocked storage) — consent
      // stays denied until a live 'cookies-accepted' event arrives.
    }
    window.addEventListener('cookies-accepted', grant);
    return () => window.removeEventListener('cookies-accepted', grant);
  }, []);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* Must run before gtag.js evaluates its config, so the default is in
          place the instant the library loads. */}
      <Script id="ga4-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){window.dataLayer.push(arguments);};
          window.gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.gtag('js', new Date());
          // send_page_view disabled: PageViewOnRouteChange below sends every
          // page_view (including the first) so client-side route changes
          // aren't invisible to GA4 — letting both fire would double-count
          // the initial load.
          window.gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}

/**
 * gtag('config', ...)'s automatic page_view only fires once, on initial
 * script load — Next.js client-side route changes afterward are invisible
 * to GA4 unless re-sent explicitly. useSearchParams() requires a Suspense
 * boundary, hence the wrapper component below.
 */
function PageViewOnRouteChange() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
    });
    // Runs on every route change, including the first — this is the only
    // source of page_view events, since the automatic one is disabled above.
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  return (
    <>
      <ConsentAndGtag />
      <Suspense fallback={null}>
        <PageViewOnRouteChange />
      </Suspense>
    </>
  );
}
