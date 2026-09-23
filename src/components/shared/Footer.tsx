'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Send, Instagram, ArrowRight } from 'lucide-react';
import { WHATSAPP_URL, TELEGRAM_URL, INSTAGRAM_URL, DEVELOPER_URL } from '@/lib/social';
import Container from '@/components/shared/Container';

const shopLinks = [
  { href: '/shop', label: 'All Perfumes' },
  { href: '/shop?audience=Men', label: "Men's Collection" },
  { href: '/shop?audience=Women', label: "Women's Collection" },
  { href: '/shop?audience=Unisex', label: 'Unisex Collection' },
  { href: '/categories', label: 'Collections' },
];

const discoverLinks = [
  { href: '/about', label: 'Our Story' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const helpLinks = [
  { href: '/shipping', label: 'Shipping & Returns' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
];

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="space-y-3 md:space-y-4">
      <h4 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</h4>
      <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="hover:text-gray-300 transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const isShopPage = pathname === '/shop';

  if (isShopPage) {
    return null;
  }

  return (
    <footer className="relative w-full bg-black text-white overflow-hidden py-10 md:py-16 pb-24 md:pb-16">
      <Container className="relative grid gap-8 md:gap-10 grid-cols-2 md:grid-cols-5">
        {/* Brand column */}
        <div className="col-span-2 space-y-3 md:space-y-4">
          <h3 className="text-xl md:text-2xl font-heading">Royal Perfumes</h3>
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-800 px-3 py-1 text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Premium Quality Wholesale
          </span>
          <p className="text-xs md:text-sm text-gray-400 max-w-xs">
            Exquisite scents for the modern aristocracy. Handcrafted with the finest ingredients.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message us on Telegram"
              className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              <Instagram className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <FooterColumn title="Shop" links={shopLinks} />
        <FooterColumn title="Discover" links={discoverLinks} />
        <FooterColumn title="Help" links={helpLinks} />

        {/* Contact column — label + value inline per row to keep it compact vertically.
           No col-span override: sits beside Help in the 2-col mobile grid instead of
           dropping to its own full-width row. */}
        <div className="space-y-2 md:space-y-3">
          <h4 className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-gray-500">Contact</h4>
          <ul className="space-y-1.5 text-xs md:text-sm">
            <li>
              <span className="text-gray-600">Phone: </span>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                +90 541 115 8571
              </a>
            </li>
            <li>
              <span className="text-gray-600">Telegram: </span>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                @royalperfumess
              </a>
            </li>
            <li>
              <span className="text-gray-600">Visit: </span>
              <span className="text-gray-400">Istanbul, Türkiye</span>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="relative mt-8 md:mt-12 border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-center md:text-left text-[10px] md:text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Royal Perfumes. All rights reserved.</p>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/terms-of-service" className="hover:text-gray-300 transition-colors">Terms</Link>
          <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy</Link>
          <a
            href={DEVELOPER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            Built by Ahmed Mekled
          </a>
        </div>

        <Link href="/shop" className="hidden md:inline-flex items-center gap-1.5 text-white hover:text-gray-300 transition-colors">
          Browse Collection <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Container>
    </footer>
  );
}
