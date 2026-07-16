import type { NextConfig } from "next";

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
    upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  output: "standalone",
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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
