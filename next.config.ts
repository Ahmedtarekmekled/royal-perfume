import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all for now to ensure Supabase images work without knowing exact ID
      },
    ],
  },
};

export default nextConfig;
