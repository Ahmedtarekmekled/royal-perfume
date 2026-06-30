import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./phone-input.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import ScrollToTop from "@/components/shared/ScrollToTop";
import SitePopup from "@/components/shared/SitePopup";
import CookieBanner from "@/components/shared/CookieBanner";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { createClient } from "@/utils/supabase/server";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { unstable_cache } from "next/cache";
import StorefrontLayoutWrapper from "@/components/shared/StorefrontLayoutWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.royalperfumes.company";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Royal Perfumes | Luxury Fragrances",
    template: "%s | Royal Perfumes",
  },
  description: "Discover our exclusive collection of premium perfumes. Handcrafted scents for men and women.",
  keywords: ["perfume", "luxury", "fragrance", "scent", "royal", "fragrances"],
  authors: [{ name: "Royal Perfumes" }],
  creator: "Royal Perfumes",
  publisher: "Royal Perfumes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Royal Perfumes | Luxury Fragrances",
    description: "Discover our exclusive collection of premium perfumes. Handcrafted scents for men and women.",
    url: siteUrl,
    siteName: "Royal Perfumes",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Royal Perfumes - Luxury Fragrances",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Royal Perfumes | Luxury Fragrances",
    description: "Discover our exclusive collection of premium perfumes.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // Run both queries in parallel + cache results for 60s
  const [rawCategories, settings] = await Promise.all([
    unstable_cache(
      async () => {
        const { data } = await supabase
          .from('categories')
          .select('*, products!inner(id)')
          .eq('products.is_active', true)
          .order('name');
        return data;
      },
      ['layout-categories'],
      { revalidate: 60 }
    )(),
    unstable_cache(
      async () => {
        const { data } = await supabase
          .from('system_settings')
          .select('hide_prices')
          .eq('id', 'global')
          .single();
        return data;
      },
      ['layout-settings'],
      { revalidate: 60 }
    )(),
  ]);

  const categories = rawCategories?.map((item: any) => {
    const { products, ...category } = item;
    return category;
  }) || [];

  const hidePrices = (settings as any)?.hide_prices || false;

  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased flex flex-col overflow-x-hidden",
        inter.variable,
        playfair.variable
      )}>
        <NextTopLoader
          color="#000000"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #000000,0 0 5px #000000"
        />
        <SettingsProvider hidePrices={hidePrices}>
          <StorefrontLayoutWrapper>
            <Navbar categories={categories || []} />
          </StorefrontLayoutWrapper>
          <main className="flex-1 w-full">
            {children}
          </main>
          <StorefrontLayoutWrapper>
            <BottomNav />
            <ScrollToTop />
            <Footer />
          </StorefrontLayoutWrapper>
          <SitePopup />
          <CookieBanner />
        </SettingsProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid black',
              color: 'black',
            },
          }}
        />
      </body>
    </html>
  );
}
