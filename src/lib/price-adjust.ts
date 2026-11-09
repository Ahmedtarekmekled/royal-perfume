// Percentage price adjustment used by admin exports (order invoices). The
// adjusted figures are what the customer sees — the percentage itself is
// never printed anywhere on the document.

export const ADJUST_MIN = -90;
export const ADJUST_MAX = 500;

export function clampAdjust(value: number): number {
  return Number.isFinite(value) ? Math.max(ADJUST_MIN, Math.min(ADJUST_MAX, value)) : 0;
}

/** Applies e.g. 10 (= +10%) or -10 (= -10%) to a price, rounded to cents. */
export function adjustPrice(price: number, percent: number): number {
  return Math.round(price * (1 + clampAdjust(percent) / 100) * 100) / 100;
}
