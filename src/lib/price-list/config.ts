// Shared, pure price-list config: column definitions, parsing the GET form's
// search params, and turning products into flat rows. Used by the server page
// (preview) and the export route (PDF / Excel) so both always agree.

export type PriceListColumnId =
  | 'image'
  | 'ref'
  | 'name'
  | 'brand'
  | 'category'
  | 'audience'
  | 'price'
  | 'discount'
  | 'final'
  | 'stock'
  | 'description';

export interface PriceListColumn {
  id: PriceListColumnId;
  label: string;
  hint: string;
  /** Relative width weight in the PDF table. */
  weight: number;
  align: 'left' | 'right' | 'center';
  pdfOnly?: boolean;
}

export const PRICE_LIST_COLUMNS: PriceListColumn[] = [
  { id: 'image', label: 'Image', hint: 'Product thumbnail (PDF only)', weight: 0.9, align: 'center', pdfOnly: true },
  { id: 'ref', label: 'Ref', hint: 'Short product reference', weight: 1.3, align: 'left' },
  { id: 'name', label: 'Product', hint: 'Product name', weight: 3.4, align: 'left' },
  { id: 'brand', label: 'Brand', hint: 'Brand name', weight: 1.6, align: 'left' },
  { id: 'category', label: 'Category', hint: 'Category name', weight: 1.6, align: 'left' },
  { id: 'audience', label: 'For', hint: 'Men / Women / Unisex', weight: 1, align: 'left' },
  { id: 'price', label: 'Price', hint: 'List price', weight: 1.1, align: 'right' },
  { id: 'discount', label: 'Discount', hint: 'Discount amount', weight: 1.1, align: 'right' },
  { id: 'final', label: 'Final Price', hint: 'Price after discount', weight: 1.2, align: 'right' },
  { id: 'stock', label: 'Stock', hint: 'In stock / out of stock', weight: 1.3, align: 'center' },
  { id: 'description', label: 'Description', hint: 'Product description (long)', weight: 4, align: 'left' },
];

export const DEFAULT_COLUMNS: PriceListColumnId[] = ['ref', 'name', 'final', 'stock'];

export type GroupBy = 'none' | 'brand' | 'category';
export type SortBy = 'name' | 'brand' | 'price_asc' | 'price_desc';
export type Audience = 'all' | 'Men' | 'Women' | 'Unisex';

export interface PriceListConfig {
  submitted: boolean;
  columns: PriceListColumnId[];
  categoryIds: string[];
  brandIds: string[];
  audience: Audience;
  q: string;
  activeOnly: boolean;
  inStockOnly: boolean;
  groupBy: GroupBy;
  sortBy: SortBy;
  /** Percent applied to every price, e.g. 10 = +10%, -5 = -5%. */
  adjustPercent: number;
  currency: string;
  title: string;
  note: string;
}

type Params = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : (Array.isArray(v) ? v : [v]).filter(Boolean);
const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

const COLUMN_IDS = new Set(PRICE_LIST_COLUMNS.map((c) => c.id));

/**
 * Unchecked checkboxes are simply absent from a GET form, so `s=1` marks a
 * submitted form; without it (first visit) the defaults apply.
 */
export function parsePriceListParams(params: Params): PriceListConfig {
  const submitted = one(params.s) === '1';
  const cols = list(params.cols).filter((c): c is PriceListColumnId => COLUMN_IDS.has(c as PriceListColumnId));
  const group = one(params.group);
  const sort = one(params.sort);
  const audience = one(params.audience);
  const adjust = Number(one(params.adjust));

  return {
    submitted,
    columns: submitted ? (cols.length ? cols : ['name']) : DEFAULT_COLUMNS,
    categoryIds: list(params.category),
    brandIds: list(params.brand),
    audience: (['Men', 'Women', 'Unisex'] as const).includes(audience as 'Men') ? (audience as Audience) : 'all',
    q: one(params.q).trim().slice(0, 100),
    activeOnly: submitted ? one(params.active) === '1' : true,
    inStockOnly: submitted ? one(params.instock) === '1' : false,
    groupBy: !submitted ? 'brand' : group === 'brand' || group === 'category' ? group : 'none',
    sortBy: (['name', 'brand', 'price_asc', 'price_desc'] as const).includes(sort as SortBy) ? (sort as SortBy) : 'name',
    adjustPercent: Number.isFinite(adjust) ? Math.max(-90, Math.min(500, adjust)) : 0,
    currency: (one(params.currency) || '$').slice(0, 4),
    title: (one(params.title) || 'Wholesale Price List').slice(0, 80),
    note: one(params.note).slice(0, 300),
  };
}

// ── Rows ──────────────────────────────────────────────────────────────

export interface SourceProduct {
  id: string;
  name_en: string;
  description_en: string | null;
  price: number;
  discount: number | null;
  stock: boolean;
  is_active: boolean;
  images: string[] | null;
  target_audience: string | null;
  category_id: string | null;
  brand_id: string | null;
}

export interface PriceRow {
  productId: string;
  image: string | null;
  ref: string;
  name: string;
  brand: string;
  category: string;
  audience: string;
  price: number;
  discount: number;
  final: number;
  inStock: boolean;
  description: string;
}

export interface PriceGroup {
  title: string | null;
  rows: PriceRow[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;
// Some catalog names carry stray leading/double spaces, which also skews sorting.
const clean = (v: string | null | undefined | false) => (v || '').replace(/\s+/g, ' ').trim();

export function buildPriceRows(
  products: SourceProduct[],
  config: PriceListConfig,
  brandNames: Map<string, string>,
  categoryNames: Map<string, string>
): PriceGroup[] {
  const factor = 1 + config.adjustPercent / 100;
  const rows: PriceRow[] = [];

  for (const p of products) {
    if (config.inStockOnly && !p.stock) continue;
    const price = round2(p.price * factor);
    const discount = round2((p.discount || 0) * factor);
    rows.push({
      productId: p.id,
      image: p.images?.[0] ?? null,
      ref: p.id.slice(0, 8).toUpperCase(),
      name: clean(p.name_en),
      brand: clean(p.brand_id && brandNames.get(p.brand_id)) || '—',
      category: clean(p.category_id && categoryNames.get(p.category_id)) || '—',
      audience: p.target_audience || '—',
      description: clean(p.description_en),
      price,
      discount,
      final: round2(price - discount),
      inStock: p.stock,
    });
  }

  const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
  rows.sort((a, b) => {
    switch (config.sortBy) {
      case 'brand':
        return collator.compare(a.brand, b.brand) || collator.compare(a.name, b.name);
      case 'price_asc':
        return a.final - b.final || collator.compare(a.name, b.name);
      case 'price_desc':
        return b.final - a.final || collator.compare(a.name, b.name);
      default:
        return collator.compare(a.name, b.name);
    }
  });

  if (config.groupBy === 'none') return [{ title: null, rows }];

  const key = config.groupBy === 'brand' ? 'brand' : 'category';
  const groups = new Map<string, PriceRow[]>();
  rows.forEach((r) => {
    const k = r[key];
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => (a === '—' ? 1 : b === '—' ? -1 : collator.compare(a, b)))
    .map(([title, rows]) => ({ title: title === '—' ? `No ${key}` : title, rows }));
}

export function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function cellText(row: PriceRow, col: PriceListColumnId, currency: string): string {
  switch (col) {
    // A 0 price means it was never set — "On request" reads better than $0.00.
    case 'price':
      return row.price > 0 ? formatMoney(row.price, currency) : 'On request';
    case 'discount':
      return row.discount > 0 ? formatMoney(row.discount, currency) : '—';
    case 'final':
      return row.price > 0 ? formatMoney(row.final, currency) : 'On request';
    case 'stock':
      return row.inStock ? 'In stock' : 'Out of stock';
    case 'image':
      return '';
    default:
      return row[col] as string;
  }
}
