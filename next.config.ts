import path from "path";
import type { NextConfig } from "next";

// `upgrade-insecure-requests` makes browsers silently rewrite every
// sub-resource request (CSS, JS, fonts) from http:// to https:// before
// fetching it. That's correct for production (served over HTTPS), but
// `next dev` only serves plain HTTP — visiting it from another device over
// LAN (e.g. http://192.168.x.x:3000, not the browser-exempted `localhost`)
// would have every stylesheet/script silently fail to load as a result,
// rendering as unstyled HTML. Production-only.
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests;' : ''}
`;

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Both /shop and /shop/[slug] use `revalidate = 60`, which the client
    // Router Cache buckets as "static" (5-minute default stale time). That
    // let a recently-visited /shop segment get reused when navigating
    // straight into a product from elsewhere (e.g. the homepage), briefly
    // showing /shop's loading skeleton instead of the product page's own.
    // Server-side ISR already makes these routes fast, so this client cache
    // layer wasn't buying real performance — only causing stale/wrong UI.
    staleTimes: {
      dynamic: 30,
      static: 30,
    },
  },
  // Pins the workspace root to this project — otherwise Turbopack walks up
  // and can latch onto an unrelated lockfile in a parent directory (e.g. a
  // stray package-lock.json in the user's home folder) and infer the wrong root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/supabase-image-loader.ts',
    // Derived from component `sizes` props and layout breakpoints (not arbitrary).
    // Product cards: 50vw mobile → 25vw desktop; gallery: 100vw → 33vw; thumbs/cart: 40–100px.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [40, 64, 80, 96, 100, 128, 160, 256, 384, 467, 480],
    // 30-day client-side cache — maximises CDN hit rate and reduces storage egress.
    minimumCacheTTL: 2592000,
    // Format hints for tooling; actual WebP negotiation is handled by Supabase transforms.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // /images/* and /images/render/* used to be handled here via rewrites()
  // straight to Supabase Storage. Moved to actual Route Handlers
  // (src/app/images/**) instead: a rewrite to an external absolute URL
  // proxies the upstream response completely as-is, and next.config's
  // headers() does not get applied on top of it (confirmed empirically —
  // none of the headers below reached the response through the old rewrite,
  // not just Cache-Control). That meant every product photo came back with
  // Supabase's own `Cache-Control: no-cache` (the cacheControl option set at
  // upload time in src/lib/upload-image.ts isn't honored on the serving
  // side), so every image was refetched from scratch on every single page
  // view for every visitor — plus raw Supabase gateway headers and a
  // cross-domain cookie were leaking straight through onto our domain,
  // which undermines the "raw *.supabase.co is never exposed" goal the
  // rewrite comment stated. The route handlers fetch the object
  // server-side and construct the response explicitly, so we fully control
  // what headers go out.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
