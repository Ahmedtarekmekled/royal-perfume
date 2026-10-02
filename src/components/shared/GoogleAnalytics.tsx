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

// Captured once, at module load — i.e. the very first URL of this page
// session, UTM parameters and all. Module scope (not component state) means
// it survives every client-side route change but naturally resets on a real
// reload/new tab, same as document.referrer. Held only in memory — never
// written to any storage — so capturing it costs nothing privacy-wise; it's
// only ever sent to Google once, and only after consent is granted below.
const landingUrl = typeof window !== 'undefined' ? window.location.href : '';
let landingPageViewSent = false;

function sendPageView(url: string) {
  if (!url || !window.gtag) return;
  try {
    const u = new URL(url);
    window.gtag('event', 'page_view', { page_path: u.pathname + u.search, page_location: url });
  } catch {
    // Malformed/relative URL — skip rather than send a broken hit.
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
    try {
      if (localStorage.getItem('cookies_accepted') === 'true') {
        // Already consented in a prior session. Just update consent —
        // PageViewOnRouteChange's own mount effect (same commit, runs right
        // after this one) sends the landing page_view correctly, since
        // consent is already granted by the time it fires. No catch-up
        // page_view needed here; mark it covered so a stray later
        // 'cookies-accepted' event (shouldn't happen, but harmless if it
        // does) doesn't double-send.
        window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
        landingPageViewSent = true;
      }
    } catch {
      // localStorage unavailable (private mode, blocked storage) — consent
      // stays denied until a live 'cookies-accepted' event arrives.
    }

    // A *new* visitor accepting mid-session, after the landing page_view
    // already went out as a cookieless (denied-consent) ping and possibly
    // after they've already navigated away from the UTM-tagged landing
    // URL. Without this, that attribution is gone for good — this is the
    // only way to recover it, and it only ever fires after an explicit
    // accept click.
    const onLiveAccept = () => {
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
      if (!landingPageViewSent) {
        landingPageViewSent = true;
        sendPageView(landingUrl);
      }
    };
    window.addEventListener('cookies-accepted', onLiveAccept);
    return () => window.removeEventListener('cookies-accepted', onLiveAccept);
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
    if (!GA_MEASUREMENT_ID) return;
    sendPageView(window.location.href);
    // Runs on every route change, including the first — this is the only
    // source of page_view events, since the automatic one is disabled above.
    // If consent is still denied when this fires (e.g. the very first call,
    // before the visitor has decided), it goes out as a cookieless ping —
    // expected under Consent Mode. This effect deliberately does NOT touch
    // landingPageViewSent: that flag means "a *consented* landing-page hit
    // has been sent," and this call has no way to know whether consent was
    // actually granted at send time. ConsentAndGtag's catch-up is the only
    // thing allowed to set it, precisely so a denied-consent attempt here
    // never gets mistaken for coverage.
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
