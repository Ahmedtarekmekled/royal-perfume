'use client';
/* eslint-disable @next/next/no-img-element -- plain <img> + object-contain shows every photo whole, matching the PDF */

import { Product } from '@/types';
import { CatalogModel, CatalogBanner, CATALOG_COLORS as C } from './types';
import { isDarkColor } from './CatalogPromoBanner';

interface CatalogHTMLPreviewProps {
  model: CatalogModel;
  categoryNameById: Map<string, string>;
  brandNameById: Map<string, string>;
}

const formatPrice = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const clean = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

const eyebrow = 'text-[10px] uppercase tracking-[0.3em]';

function BannerBlock({ banner }: { banner: CatalogBanner }) {
  const bg = banner.backgroundColor || C.soft;
  const dark = isDarkColor(bg);
  return (
    <div className="my-10 flex flex-col items-center px-6 py-10 text-center break-inside-avoid" style={{ backgroundColor: bg }}>
      {banner.imageUrl && <img src={banner.imageUrl} alt="" className="mb-5 max-h-56 w-full max-w-2xl object-contain" />}
      {banner.title && (
        <h3 className="font-heading text-2xl font-bold sm:text-3xl" style={{ color: dark ? '#fff' : C.ink }}>
          {banner.title}
        </h3>
      )}
      {banner.subtitle && (
        <p className={`mt-2 ${eyebrow}`} style={{ color: dark ? '#D6D3CE' : C.body }}>
          {banner.subtitle}
        </p>
      )}
    </div>
  );
}

function ProductCard({ product, label, model }: { product: Product; label?: string; model: CatalogModel }) {
  const f = model.visibleFields;
  const hasDiscount = f.discount && product.discount > 0 && product.price > 0;
  const finalPrice = hasDiscount ? product.price - product.discount : product.price;
  const savePct = hasDiscount ? Math.round((product.discount / product.price) * 100) : 0;
  const large = model.productsPerRow === 2;

  return (
    <div className="flex flex-col break-inside-avoid">
      <div className="relative aspect-[4/5] w-full border bg-white" style={{ borderColor: C.rule }}>
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.name_en}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-[6%]"
        />
        {f.popular && product.is_popular && (
          <span className="absolute left-2 top-2 bg-black px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-white">
            Bestseller
          </span>
        )}
        {f.stock && !product.stock && (
          <span
            className="absolute right-2 top-2 border bg-white px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: C.red, borderColor: C.red }}
          >
            Sold out
          </span>
        )}
      </div>

      {f.category && label && (
        <p className="mt-2.5 truncate text-[9px] uppercase tracking-[0.2em]" style={{ color: C.gold }}>
          {label}
        </p>
      )}
      <h4
        className={`line-clamp-2 font-heading font-bold leading-snug ${f.category && label ? 'mt-1' : 'mt-2.5'} ${large ? 'text-lg' : 'text-sm'}`}
      >
        {clean(product.name_en)}
      </h4>
      {f.description && product.description_en && (
        <p className={`mt-1.5 text-[11px] leading-relaxed ${large ? 'line-clamp-4' : 'line-clamp-3'}`} style={{ color: C.body }}>
          {clean(product.description_en)}
        </p>
      )}
      {f.price && (
        <div className="mt-auto flex items-baseline gap-2 border-t pt-2" style={{ borderColor: C.rule, marginTop: '0.6rem' }}>
          <span className={`font-semibold ${large ? 'text-base' : 'text-sm'}`}>
            {product.price > 0 ? formatPrice(finalPrice) : 'Price on request'}
          </span>
          {hasDiscount && <span className="text-xs line-through" style={{ color: C.muted }}>{formatPrice(product.price)}</span>}
          {savePct > 0 && (
            <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider" style={{ color: C.red }}>
              -{savePct}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** HTML rendering of the same CatalogModel the react-pdf document consumes,
 *  styled to mirror it — content/grouping can never drift from the PDF. */
export default function CatalogHTMLPreview({ model, categoryNameById, brandNameById }: CatalogHTMLPreviewProps) {
  const cols =
    model.productsPerRow === 2
      ? 'grid-cols-2'
      : model.productsPerRow === 3
        ? 'grid-cols-2 md:grid-cols-3 print:grid-cols-3'
        : 'grid-cols-2 md:grid-cols-4 print:grid-cols-4';

  const cover = model.cover;
  const generatedDate = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const contactLine = [cover.phone, cover.email, cover.website].filter(Boolean).join('  ·  ');
  const leadingBanners = model.bannersByGroupId.get(null) || [];
  const groupNoun = model.groupBy === 'brand' ? 'Brands' : 'Categories';

  return (
    <div id="printable-catalog" className="mx-auto max-w-5xl space-y-8 font-body print:m-0 print:space-y-0 print:p-0" style={{ color: C.ink }}>
      {/* Cover */}
      <section className="relative mx-auto flex aspect-[1/1.414] max-w-3xl flex-col bg-white shadow-[0_2px_30px_rgba(0,0,0,0.08)] print:max-w-none print:shadow-none print:break-after-page">
        <div className="pointer-events-none absolute inset-3 border border-black sm:inset-4" />
        <div className="pointer-events-none absolute inset-4 border sm:inset-5" style={{ borderColor: C.gold, borderWidth: '0.5px' }} />
        <div className="relative flex flex-1 flex-col items-center overflow-hidden px-8 pt-10 text-center sm:px-16 sm:pt-16">
          {cover.logoUrl && <img src={cover.logoUrl} alt="Logo" className="h-16 w-16 object-contain sm:h-28 sm:w-28" />}
          <p className={`mt-4 sm:mt-6 ${eyebrow}`} style={{ color: C.gold }}>
            {cover.seasonName || `Collection ${new Date().getFullYear()}`}
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold leading-tight sm:mt-3 sm:text-5xl">{cover.title || 'Product Catalog'}</h1>
          <div className="mt-3 h-px w-12 bg-black sm:mt-5" />
          {cover.subtitle && <p className={`mt-3 sm:mt-4 ${eyebrow}`} style={{ color: C.body }}>{cover.subtitle}</p>}
          {cover.description && (
            <p className="mt-3 max-w-md font-heading text-xs leading-relaxed sm:text-base" style={{ color: C.body }}>
              {cover.description}
            </p>
          )}
          {cover.coverImageUrl && (
            <img src={cover.coverImageUrl} alt="" className="mt-4 max-h-28 w-full max-w-md object-contain sm:mt-6 sm:max-h-52" />
          )}
          <div className="mt-4 flex items-center divide-x sm:mt-7" style={{ borderColor: C.rule }}>
            <div className="px-5 sm:px-7">
              <p className="font-heading text-lg font-bold sm:text-2xl">{model.totalProductCount.toLocaleString('en-US')}</p>
              <p className="text-[8px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>Fragrances</p>
            </div>
            <div className="px-5 sm:px-7">
              <p className="font-heading text-lg font-bold sm:text-2xl">{model.groups.length}</p>
              <p className="text-[8px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>{groupNoun}</p>
            </div>
          </div>
        </div>
        <div className="relative mx-4 mb-4 bg-black px-6 py-4 text-center sm:mx-5 sm:mb-5 sm:py-6">
          <p className="font-heading text-sm font-bold tracking-wide text-white sm:text-lg">{cover.companyName || 'Royal Perfumes'}</p>
          {cover.address && <p className="mt-1 text-[10px] text-[#D6D3CE] sm:text-xs">{cover.address}</p>}
          {contactLine && <p className="mt-1 text-[10px] text-[#D6D3CE] sm:text-xs">{contactLine}</p>}
          {cover.social && <p className="mt-1 text-[10px] text-[#D6D3CE] sm:text-xs">{cover.social}</p>}
          <p className="mt-2 text-[8px] uppercase tracking-[0.25em] sm:text-[9px]" style={{ color: C.gold }}>{generatedDate}</p>
        </div>
      </section>

      {/* Contents */}
      {model.groups.length > 1 && (
        <section className="bg-white p-6 shadow-[0_2px_30px_rgba(0,0,0,0.08)] sm:p-12 print:shadow-none print:break-after-page">
          <p className={eyebrow} style={{ color: C.gold }}>Inside this catalog</p>
          <h2 className="mt-1 font-heading text-3xl font-bold sm:text-4xl">Contents</h2>
          <div className="mb-5 mt-4 h-px w-12 bg-black" />
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {model.groups.map((g, i) => (
              <li key={g.id}>
                <a href={`#preview-${g.id}`} className="flex items-baseline gap-3 border-b py-2 transition hover:bg-gray-50" style={{ borderColor: C.rule }}>
                  <span className="w-6 text-[11px]" style={{ color: C.muted }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 truncate font-heading">{g.name}</span>
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>
                    {g.products.length} {g.products.length === 1 ? 'item' : 'items'}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Products */}
      <section className="bg-white p-5 shadow-[0_2px_30px_rgba(0,0,0,0.08)] sm:p-12 print:p-0 print:shadow-none">
        {leadingBanners.map((banner) => (
          <BannerBlock key={banner.id} banner={banner} />
        ))}

        <div className="space-y-14">
          {model.groups.map((group, idx) => {
            const trailingBanners = model.bannersByGroupId.get(group.id) || [];
            return (
              <div
                key={group.id}
                id={`preview-${group.id}`}
                className={`scroll-mt-28 ${model.sectionPageBreak && idx > 0 ? 'print:break-before-page' : ''}`}
              >
                <div className="mb-6 flex items-end justify-between gap-4 border-b-[1.5px] border-black pb-2.5">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.25em]" style={{ color: C.gold }}>
                      {String(idx + 1).padStart(2, '0')} · {model.groupBy === 'brand' ? 'Brand' : 'Collection'}
                    </p>
                    <h3 className="mt-0.5 font-heading text-2xl font-bold sm:text-3xl">{group.name}</h3>
                  </div>
                  <p className="shrink-0 pb-1 text-[9px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>
                    {group.products.length} {group.products.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className={`grid gap-x-4 gap-y-8 sm:gap-x-5 ${cols}`}>
                  {group.products.map((product) => {
                    const label =
                      model.groupBy === 'category'
                        ? (product.brand_id && brandNameById.get(product.brand_id)) || undefined
                        : (product.category_id && categoryNameById.get(product.category_id)) || undefined;
                    return <ProductCard key={product.id} product={product} label={label} model={model} />;
                  })}
                </div>

                {trailingBanners.map((banner) => (
                  <BannerBlock key={banner.id} banner={banner} />
                ))}
              </div>
            );
          })}

          {model.groups.length === 0 && (
            <div className="py-20 text-center text-gray-500">No products found matching the selected filters.</div>
          )}
        </div>
      </section>
    </div>
  );
}
