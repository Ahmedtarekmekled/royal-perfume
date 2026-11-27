'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import LightRays from '@/components/shared/LightRays';
import ImageWithFallback from '@/components/shared/ImageWithFallback';
import { WHATSAPP_URL, TELEGRAM_URL } from '@/lib/social';

gsap.registerPlugin(useGSAP, SplitText);

const CATALOG_MESSAGE =
  "Hello Royal Perfumes, I'd like to receive your wholesale catalog, please.";
const WHATSAPP_CATALOG_URL = `${WHATSAPP_URL}?text=${encodeURIComponent(CATALOG_MESSAGE)}`;

type Stats = { products: number; brands: number; countries: number };
type Bottle = { id: string; name: string; image: string };

const fmt = (n: number) => n.toLocaleString('en-US');

// Static film grain (React Bits "Noise" without the per-frame redraw, so it
// costs nothing on phones).
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Fan geometry for card i of n, in % of the card's own size.
const fanPose = (i: number, n: number) => {
  const offset = i - (n - 1) / 2;
  return { xPercent: offset * 42, yPercent: Math.abs(offset) * 6, rotation: offset * 7 };
};

export default function CatalogRequest({ stats, bottles }: { stats: Stats; bottles: Bottle[] }) {
  const root = useRef<HTMLElement>(null);

  const facts = [
    stats.products > 0 && `${fmt(stats.products)} fragrances`,
    stats.brands > 0 && `${fmt(stats.brands)} brands`,
    stats.countries > 0 && `${fmt(stats.countries)} countries`,
  ].filter(Boolean) as string[];

  const { contextSafe } = useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]');
      const n = cards.length;
      cards.forEach((c, i) => gsap.set(c, { ...fanPose(i, n), zIndex: 10 - Math.abs(i - (n - 1) / 2) }));

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const split = SplitText.create('[data-heading]', { type: 'words', mask: 'words' });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('[data-logo]', { clipPath: 'inset(0 0 100% 0)', y: 8, duration: 0.9 })
          // React Bits "BounceCards" entrance: scale up from nothing with an
          // elastic settle, staggered outward from the centre card.
          .from(cards, { scale: 0, duration: 1, ease: 'elastic.out(1, 0.75)', stagger: { each: 0.07, from: 'center' } }, '-=0.45')
          .from('[data-eyebrow]', { autoAlpha: 0, y: 8, duration: 0.5 }, '-=0.75')
          .from(split.words, { yPercent: 110, duration: 0.8, stagger: 0.06 }, '<0.05')
          .from('[data-rest]', { autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.08 }, '-=0.45');

        return () => split.revert();
      });
    },
    { scope: root, dependencies: [bottles.length] }
  );

  // Hovered/tapped bottle straightens and lifts; neighbours step aside.
  const focusCard = contextSafe((active: number | null) => {
    const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root.current);
    const n = cards.length;
    cards.forEach((c, i) => {
      const pose = fanPose(i, n);
      if (active === null) {
        gsap.to(c, { ...pose, scale: 1, duration: 0.45, ease: 'back.out(1.4)', overwrite: 'auto' });
      } else if (i === active) {
        gsap.to(c, { xPercent: pose.xPercent, yPercent: -8, rotation: 0, scale: 1.1, zIndex: 20, duration: 0.45, ease: 'back.out(1.4)', overwrite: 'auto' });
      } else {
        gsap.to(c, {
          ...pose,
          xPercent: pose.xPercent + (i < active ? -18 : 18),
          scale: 1,
          zIndex: 10 - Math.abs(i - (n - 1) / 2),
          duration: 0.45,
          ease: 'back.out(1.4)',
          overwrite: 'auto',
        });
      }
    });
  });

  return (
    // Exactly one screen: viewport minus the navbar (3.5rem + 1px border), and
    // minus the mobile bottom nav (another 3.5rem) below md.
    <section
      ref={root}
      className="relative isolate h-[calc(100dvh-7rem-1px)] w-full overflow-hidden bg-black text-white md:h-[calc(100dvh-3.5rem-1px)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.6}
          lightSpread={0.8}
          rayLength={2.2}
          followMouse={false}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-5 px-5 pb-8 md:flex-row-reverse md:gap-14 md:px-10 md:pb-0 [@media(max-height:700px)]:gap-3">
        {/* Logo + bottles — one visual unit */}
        <div className="flex w-full flex-col items-center md:flex-1">
          {/* Logo scales with screen height so short phones keep everything on one screen */}
          <div data-logo style={{ width: 'clamp(64px, 12dvh, 124px)' }}>
            <Image
              src="/images/hero1.PNG"
              alt="Royal Perfumes"
              width={660}
              height={540}
              priority
              sizes="124px"
              className="h-auto w-full"
            />
          </div>

          {bottles.length > 0 && (
            <div
              className="relative mb-6 mt-4 flex h-[min(20dvh,148px)] w-full items-center justify-center md:mb-10 md:mt-8 md:h-[min(40dvh,320px)]"
              onPointerLeave={() => focusCard(null)}
            >
              {bottles.map((b, i) => (
                <button
                  type="button"
                  key={b.id}
                  data-card
                  aria-label={b.name}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && focusCard(i)}
                  onClick={() => focusCard(i)}
                  className="absolute aspect-[3/4] h-full overflow-hidden rounded-[4px] border-[3px] border-white bg-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ImageWithFallback
                    src={b.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 30vw, 15vw"
                    priority={i === Math.floor(bottles.length / 2)}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy + CTA */}
        <div className="flex w-full flex-col md:max-w-md md:flex-1">
          <p data-eyebrow className="font-body text-xs text-[#c9a96e] md:text-sm">
            Wholesale catalog &middot; {new Date().getFullYear()}
          </p>

          <h1
            data-heading
            className="mt-2 text-balance font-heading text-[2.4rem] font-normal leading-[1.05] md:text-6xl [@media(max-height:700px)]:text-[1.9rem]"
          >
            Our full range,
            <br />
            <em className="text-neutral-400">in one catalog.</em>
          </h1>

          {facts.length > 0 && (
            <p data-rest className="mt-3 font-body text-xs tabular-nums text-neutral-500 md:mt-5 md:text-sm">
              {facts.join('  ·  ')}
            </p>
          )}

          <p
            data-rest
            className="mt-2 hidden text-pretty font-body text-base font-light leading-relaxed text-neutral-400 md:block"
          >
            Message us and we&rsquo;ll send the full catalog with current wholesale prices
            to your WhatsApp. Free, no commitment.
          </p>

          <div data-rest className="mt-5 flex flex-col gap-3 md:mt-8 md:items-start">
            <a
              href={WHATSAPP_CATALOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-between bg-white px-5 py-4 font-body text-sm font-medium text-black transition-colors duration-150 hover:bg-neutral-200 active:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:w-auto md:gap-6 md:px-8"
            >
              Get the catalog on WhatsApp
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </a>
            <p className="text-center font-body text-xs text-neutral-500 md:text-left">
              Free, sent to your phone &middot;{' '}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-neutral-700 underline-offset-4 transition-colors duration-150 hover:text-white hover:decoration-white"
              >
                or use Telegram
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
