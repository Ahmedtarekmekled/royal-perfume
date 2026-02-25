'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ShinyText from '@/components/ui/shiny-text';

export default function AboutPage() {
  const strengths = [
    { label: "12+ Years", sub: "Manufacturing Expertise" },
    { label: "900+", sub: "Models In Stock" },
    { label: "25–28%", sub: "Essence Concentration" },
    { label: "Global", sub: "Logistics Network" },
  ];

  const capabilities = [
    "Precise Scent Matching & Strong Projection",
    "Long-Lasting Performance & Stability",
    "Premium Packaging Standards",
    "Structured Wholesale & Corporate Solutions",
    "Fast Order Processing & Quality Control",
    "Visual Product Documentation",
    "Secure & Transparent International Transactions",
    "Designed for High Profit Margins & Business Scalability",
  ];

  const statements = [
    { n: '01', prefix: 'We operate with', word: 'structure.' },
    { n: '02', prefix: 'We deliver with', word: 'discipline.' },
    { n: '03', prefix: 'We build partnerships based on', word: 'trust.' },
  ];

  return (
    <div className="bg-white">

      {/* ── 1. Hero ── */}
      <section className="relative pt-20 pb-14 md:pt-28 md:pb-20 flex flex-col items-center text-center px-4 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <p className="text-xs tracking-[0.35em] text-gray-400 uppercase mb-5 font-medium">
          Corporate Profile
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-light tracking-tight text-gray-900 uppercase leading-none">
          Royal{' '}
          <span className="italic">Perfumes</span>
        </h1>
        <div className="mt-6 w-8 h-px bg-gray-300 mx-auto" />
        <p className="mt-6 max-w-xl text-base md:text-lg text-gray-500 font-light leading-relaxed">
          Operational precision. Manufacturing excellence. Uncompromising quality — delivered to wholesale partners worldwide.
        </p>
      </section>

      {/* ── 2. Stats Row ── */}
      <section className="border-y border-gray-100 py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100">
          {strengths.map(({ label, sub }) => (
            <div key={sub} className="text-center px-4 py-2 md:py-0">
              <p className="text-2xl md:text-3xl font-heading font-light text-gray-900 tracking-tight">
                {label}
              </p>
              <p className="mt-1 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                {sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Mission ── */}
      <section className="max-w-3xl mx-auto px-4 py-14 md:py-20 text-center">
        <p className="text-xl md:text-2xl lg:text-3xl font-heading font-light text-gray-800 leading-snug">
          Royal Perfumes was established with a clear objective: to provide high-demand luxury fragrances to wholesale partners worldwide.
        </p>
        <p className="mt-6 text-sm md:text-base text-gray-500 font-light leading-relaxed max-w-xl mx-auto">
          With over 12 years of manufacturing experience, we integrate production excellence with international trade efficiency — ensuring consistency in formulation, stability in supply, and strong market performance for our partners.
        </p>
      </section>

      {/* ── 4. Statement Section ── */}
      <section className="w-full bg-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 divide-y divide-zinc-700">
          {statements.map(({ n, prefix, word }, i) => (
            <div key={n} className="grid grid-cols-[3rem_1fr] md:grid-cols-[5rem_1fr] gap-6 items-center py-8 md:py-10">
              <span className="text-xs text-zinc-500 tracking-widest font-medium">{n}</span>
              <p className="text-2xl md:text-3xl lg:text-4xl font-heading font-light text-zinc-200 leading-snug">
                {prefix}{' '}
                <ShinyText
                  text={word}
                  speed={3 + i * 0.5}
                  color="#e4e4e7"
                  shineColor="#ffffff"
                  className="font-normal"
                />
              </p>
            </div>
          ))}
          <div className="py-8">
            <p className="text-xs text-zinc-500 font-light tracking-[0.2em] uppercase">
              Royal Perfumes is not a short-term supplier — we are a scalable wholesale partner.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Core Strengths ── */}
      <section className="max-w-5xl mx-auto px-4 py-14 md:py-20">
        <div className="mb-10 md:mb-14 text-center">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase font-medium mb-3">
            Our Capabilities
          </p>
          <h2 className="text-2xl md:text-4xl font-heading font-light text-gray-900 tracking-tight">
            Core Strengths
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0">
          {capabilities.map((item, i) => (
            <div key={i} className="flex gap-4 items-start border-t border-gray-100 py-5">
              <span className="text-gray-200 text-base leading-none mt-0.5 flex-shrink-0">—</span>
              <p className="text-sm md:text-base text-gray-600 font-light leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Commitment ── */}
      <section className="border-t border-gray-100 py-14 md:py-20 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.3em] text-gray-400 uppercase font-medium">
              Commitment
            </p>
            <div className="space-y-2 text-2xl md:text-3xl font-heading font-light text-gray-800">
              <p>Consistency in Supply.</p>
              <p>Integrity in Business.</p>
              <p>Strength in Partnership.</p>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <p className="text-xl md:text-2xl font-heading font-light tracking-[0.1em] text-gray-900 uppercase">
              Royal Perfumes
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-[0.35em] font-medium">About me</p>
          </div>
        </div>
      </section>

      {/* ── 7. CTA ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-14 md:py-20 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Partner with us</p>
          <h3 className="text-2xl md:text-3xl font-heading font-light text-gray-900">
            Ready to scale your fragrance business?
          </h3>
          <Link
            href="/shipping"
            className="inline-flex items-center gap-2 px-7 py-3 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition-colors"
          >
            View Wholesale Policy <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
