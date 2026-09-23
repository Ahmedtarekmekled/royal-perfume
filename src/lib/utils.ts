import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | number | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Generates a URL-friendly slug from a string.
 * e.g. "Black Rose Oud!" → "black-rose-oud"
 */
export function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
}

/**
 * Resolves a unique slug for `name` within `table`/`column`, appending `-2`,
 * `-3`, etc. on collision. Table-agnostic core shared by every entity that
 * needs a unique slug (products, seasonal collections, ...).
 */
async function resolveUniqueSlug(
  supabase: any,
  table: string,
  column: string,
  name: string,
  excludeId?: string,
  fallbackPrefix: string = table
): Promise<string> {
  let baseSlug = generateSlug(name);
  if (!baseSlug) {
    baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `${fallbackPrefix}-${Date.now()}`;
  }

  const { data: slugMatches } = await supabase
    .from(table)
    .select(column)
    .or(`${column}.eq.${baseSlug},${column}.like.${baseSlug}-%`)
    .neq('id', excludeId || '00000000-0000-0000-0000-000000000000');

  if (!slugMatches || slugMatches.length === 0) return baseSlug;

  const existingSlugs = new Set(slugMatches.map((row: any) => row[column]));
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) counter++;
  return `${baseSlug}-${counter}`;
}

/**
 * Resolves a unique product slug for `name`, appending `-2`, `-3`, etc. on
 * collision. Shared by the single-product admin form and bulk Excel import
 * so every product always ends up with a slug — never left null.
 */
export async function resolveUniqueProductSlug(
  supabase: any,
  name: string,
  excludeId?: string
): Promise<string> {
  return resolveUniqueSlug(supabase, 'products', 'slug', name, excludeId, 'product');
}

/**
 * Resolves a unique seasonal collection slug for `name`, appending `-2`,
 * `-3`, etc. on collision — same strategy as products.
 */
export async function resolveUniqueSeasonalCollectionSlug(
  supabase: any,
  name: string,
  excludeId?: string
): Promise<string> {
  return resolveUniqueSlug(supabase, 'seasonal_collections', 'slug', name, excludeId, 'collection');
}

/**
 * Trims text to a meta-description-safe length (default 160) at a word
 * boundary, adding an ellipsis — a raw substring cuts words mid-way in the
 * search snippet.
 */
export function toMetaDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.—–-]+$/, '')}…`;
}

/**
 * Page title for the root "%s | Royal Perfumes" template: drops the brand
 * suffix when it would push the title past ~60 characters, so the page's own
 * words aren't the part Google truncates.
 */
export function toPageTitle(title: string): string | { absolute: string } {
  return title.length + ' | Royal Perfumes'.length > 60 ? { absolute: title } : title;
}
