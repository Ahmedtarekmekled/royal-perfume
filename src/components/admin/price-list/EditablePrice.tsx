'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { SET_PRODUCT_PRICE_EVENT, type SetProductPriceDetail } from './PriceRulesEditor';

/**
 * A preview price cell that can be clicked to set that product's final price.
 * It doesn't own any state — it asks the rules editor to upsert a product rule.
 */
export default function EditablePrice({
  productId,
  name,
  final,
  text,
  adjusted,
}: {
  productId: string;
  name: string;
  final: number;
  text: string;
  adjusted: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  const send = (v: number | null) => {
    window.dispatchEvent(
      new CustomEvent<SetProductPriceDetail>(SET_PRODUCT_PRICE_EVENT, { detail: { id: productId, name, value: v } })
    );
  };

  const commit = () => {
    setEditing(false);
    const n = Number(value);
    if (value.trim() === '' || !Number.isFinite(n) || n < 0 || n === final) return;
    send(Math.round(n * 100) / 100);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        inputMode="decimal"
        step="0.01"
        min={0}
        value={value}
        aria-label={`New price for ${name}`}
        onChange={(e) => {
          e.stopPropagation();
          setValue(e.target.value);
        }}
        onInput={(e) => e.stopPropagation()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setEditing(false);
          }
        }}
        className="h-7 w-20 rounded border border-gray-900 bg-white px-1.5 text-right text-[12px] outline-none ring-2 ring-black/5"
      />
    );
  }

  return (
    <span className="group/price inline-flex items-center gap-1">
      {adjusted && (
        <span title="Changed by a price rule" className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-800" aria-label="Adjusted" />
      )}
      <button
        type="button"
        onClick={() => {
          setValue(final > 0 ? final.toFixed(2) : '');
          setEditing(true);
        }}
        title="Click to set this product's price"
        className="inline-flex items-center gap-1 rounded px-1 -mx-1 transition hover:bg-gray-100"
      >
        <Pencil className="h-3 w-3 text-gray-300 opacity-0 transition group-hover/price:opacity-100" />
        {text}
      </button>
    </span>
  );
}
