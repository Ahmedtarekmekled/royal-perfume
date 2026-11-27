'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LightRays from '@/components/shared/LightRays';
import { GridBackground } from '@/components/ui/grid-background';
import { WHATSAPP_URL, TELEGRAM_URL } from '@/lib/social';

const CATALOG_MESSAGE =
  "Hello Royal Perfumes, I'd like to receive your wholesale catalog, please.";
const WHATSAPP_CATALOG_URL = `${WHATSAPP_URL}?text=${encodeURIComponent(CATALOG_MESSAGE)}`;

type Stats = { products: number; brands: number; countries: number };

const fmt = (n: number) => n.toLocaleString('en-US');

/**
 * The catalog itself is the one memorable element on the page: a closed book
 * whose cover swings open on its spine when you hover it (or the CTA),
 * showing a price-list page underneath. Everything else stays quiet.
 */
function CatalogBook({ open }: { open: boolean }) {
  return (
    <div className="[perspective:1400px]">
      <div className="relative h-[168px] w-[124px] sm:h-[236px] sm:w-[176px] md:h-[300px] md:w-[224px] [@media(max-height:640px)]:h-[132px] [@media(max-height:640px)]:w-[98px]">
        {/* Inside page — an abstract price list */}
        <div className="absolute inset-0 rounded-[2px] bg-neutral-100 px-[12%] py-[14%] shadow-2xl">
          <div className="mb-[10%] h-[3px] w-1/2 bg-neutral-800" />
          <ul className="space-y-[9%]">
            {[72, 58, 80, 64, 76, 52, 68].map((w, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="h-[2px] bg-neutral-400" style={{ width: `${w * 0.55}%` }} />
                <span className="h-px flex-1 border-b border-dotted border-neutral-300" />
                <span className="h-[2px] w-[12%] bg-neutral-700" />
              </li>
            ))}
          </ul>
        </div>

        {/* Cover, hinged on the left edge */}
        <motion.div
          className="absolute inset-0 origin-left [transform-style:preserve-3d]"
          animate={{ rotateY: open ? -38 : 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[2px] border border-white/10 bg-neutral-950 [backface-visibility:hidden]">
            <div className="absolute inset-y-0 left-0 w-[6px] bg-white/[0.06]" />
            <div className="absolute inset-[7%] border border-[#c9a96e]/30" />
            <div className="relative flex h-full flex-col items-center justify-center gap-[6%] px-[14%] text-center">
              <Image
                src="/images/hero1.PNG"
                alt=""
                width={120}
                height={120}
                priority
                className="h-auto w-[44%]"
              />
              <span className="font-heading text-[11px] text-white sm:text-base md:text-lg">
                Wholesale Catalog
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CatalogRequest({ stats }: { stats: Stats }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.6, ease: 'easeOut' as const },
        };

  const facts = [
    stats.products > 0 && `${fmt(stats.products)} fragrances`,
    stats.brands > 0 && `${fmt(stats.brands)} brands`,
    stats.countries > 0 && `shipped to ${fmt(stats.countries)} countries`,
  ].filter(Boolean) as string[];

  return (
    // Exactly one screen: viewport minus the navbar (3.5rem), and minus the
    // mobile bottom nav (another 3.5rem) below md.
    <section className="relative isolate h-[calc(100dvh-7rem-1px)] w-full overflow-hidden bg-black text-white md:h-[calc(100dvh-3.5rem-1px)]">
      <GridBackground />
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.6}
          lightSpread={0.8}
          rayLength={2.5}
          followMouse={false}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>

      <div className="relative mx-auto grid h-full max-w-5xl grid-rows-[auto_auto] content-center justify-items-center gap-8 px-6 md:grid-cols-[auto_1fr] md:grid-rows-1 md:items-center md:justify-items-start md:gap-20 [@media(max-height:640px)]:gap-5">
        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, y: 24 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, ease: 'easeOut' },
              })}
          onPointerEnter={() => setOpen(true)}
          onPointerLeave={() => setOpen(false)}
        >
          <CatalogBook open={open} />
        </motion.div>

        <div className="flex max-w-md flex-col items-center text-center md:items-start md:text-left">
          <motion.p {...enter(0.25)} className="font-body text-xs text-[#c9a96e] md:text-sm">
            Royal Perfumes &mdash; {new Date().getFullYear()} edition
          </motion.p>

          <motion.h1
            {...enter(0.35)}
            className="mt-3 text-balance font-heading text-4xl font-normal leading-[1.05] sm:text-5xl md:text-6xl [@media(max-height:640px)]:text-3xl"
          >
            Our full range,
            <br />
            <em className="font-normal text-neutral-400">in one catalog.</em>
          </motion.h1>

          <motion.p
            {...enter(0.45)}
            className="mt-5 text-pretty font-body text-sm font-light leading-relaxed text-neutral-400 md:text-base [@media(max-height:640px)]:mt-3"
          >
            Message us and we&rsquo;ll send the wholesale catalog with current prices
            straight to your WhatsApp. Free, no commitment.
          </motion.p>

          {facts.length > 0 && (
            <motion.p
              {...enter(0.5)}
              className="mt-4 font-body text-xs tabular-nums text-neutral-500 md:text-sm"
            >
              {facts.join(' · ')}
            </motion.p>
          )}

          <motion.div
            {...enter(0.6)}
            className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto md:items-start [@media(max-height:640px)]:mt-5"
          >
            <a
              href={WHATSAPP_CATALOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              onPointerEnter={() => setOpen(true)}
              onPointerLeave={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              className="group inline-flex w-full items-center justify-center gap-3 bg-white px-8 py-4 font-body text-sm font-medium text-black transition-colors duration-150 hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
            >
              Request the catalog on WhatsApp
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </a>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-neutral-500 underline decoration-neutral-700 underline-offset-4 transition-colors duration-150 hover:text-white hover:decoration-white"
            >
              or message us on Telegram
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
