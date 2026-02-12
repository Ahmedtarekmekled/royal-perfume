import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./phone-input.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import BottomNav from "@/components/shared/BottomNav";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Royal Perfumes | Luxury Fragrances",
  description: "Discover our exclusive collection of premium perfumes. Handcrafted scents for men and women.",
  keywords: ["perfume", "luxury", "fragrance", "scent", "royal"],
  openGraph: {
    title: "Royal Perfumes | Luxury Fragrances",
    description: "Discover our exclusive collection of premium perfumes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased flex flex-col",
        inter.variable,
        playfair.variable
      )}>
        <NextTopLoader
          color="#000000"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #000000,0 0 5px #000000"
        />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <BottomNav />
        <Footer />
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
