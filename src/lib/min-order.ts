// Client-safe (no server imports): shared by the storefront UI and server code.
export const DEFAULT_MIN_ORDER_QUANTITY = 30;

/**
 * Normalizes the raw system_settings.min_order_quantity value. Falls back to
 * the default when the column is missing (migration not yet applied) or the
 * value is somehow invalid, so storefront reads never break on it.
 */
export function resolveMinOrderQuantity(value: unknown): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_MIN_ORDER_QUANTITY;
}
