'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Loads gtag.js only after the visitor has accepted CookieBanner — that
 * banner already tells them "By clicking Accept All, you consent to our
 * use of cookies", so firing analytics before that click would contradict
 * the site's own privacy copy. Listens for the 'cookies-accepted' event
 * (dispatched by CookieBanner) so it loads immediately on first accept,
 * not just on the next page load.
 */
export default function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('cookies_accepted') === 'true') {
        setConsented(true);
      }
    } catch {
      // localStorage unavailable (private mode, blocked storage) — fall
      // back to requiring the in-session accept event below.
    }
    const onAccept = () => setConsented(true);
    window.addEventListener('cookies-accepted', onAccept);
    return () => window.removeEventListener('cookies-accepted', onAccept);
  }, []);

  if (!GA_MEASUREMENT_ID || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
