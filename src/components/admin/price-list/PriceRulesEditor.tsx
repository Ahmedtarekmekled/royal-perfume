'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Loader2, Plus, Search, X } from 'lucide-react';
import {
  MAX_ADJUSTMENTS,
  encodeAdjustment,
  type AdjustMode,
  type AdjustScope,
  type PriceAdjustment,
} from '@/lib/price-list/config';
import { searchPriceRuleProducts, type PriceRuleProduct } from '@/app/admin/price-list/actions';

/** Fired by the preview's inline price editor; upserts a product "set" rule. */
export const SET_PRODUCT_PRICE_EVENT = 'pricelist:set-product-price';
/** Tells LivePriceListForm to re-request the preview. */
export const LIVE_REFRESH_EVENT = 'pricelist:refresh';

export interface SetProductPriceDetail {
  id: string;
  name: string;
  /** null removes the product's rules. */
  value: number | null;
}

interface Option {
  id: string;
  name: string;
}

interface Rule {
  key: string;
  scope: AdjustScope;
  target: string;
  /** Product name, for product rules. */
  label: string;
  mode: AdjustMode;
  value: string;
}

const SCOPES: { id: AdjustScope; label: string }[] = [
  { id: 'all', label: 'All products' },
  { id: 'brand', label: 'Brand' },
  { id: 'category', label: 'Category' },
  { id: 'product', label: 'One product' },
];

const MODES: { id: AdjustMode; label: string; hint: string }[] = [
  { id: 'pct', label: '%', hint: 'Change by percent' },
  { id: 'usd', label: '± $', hint: 'Add or subtract an amount' },
  { id: 'set', label: '= $', hint: 'Set an exact price' },
];

const control =
  'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-black/5';

let seq = 0;
const newKey = () => `r${++seq}`;

function toRule(a: PriceAdjustment, names: Map<string, string>): Rule {
  return {
    key: newKey(),
    scope: a.scope,
    target: a.target,
    label: names.get(a.target) ?? '',
    mode: a.mode,
    value: String(a.value),
  };
}

function encode(r: Rule): string | null {
  const value = Number(r.value);
  if (r.value.trim() === '' || !Number.isFinite(value)) return null;
  if (r.scope !== 'all' && !r.target) return null;
  if (r.mode !== 'set' && value === 0) return null;
  return encodeAdjustment({ scope: r.scope, target: r.target, mode: r.mode, value });
}

export default function PriceRulesEditor({
  initial,
  brands,
  categories,
  products,
  currency,
}: {
  initial: PriceAdjustment[];
  brands: Option[];
  categories: Option[];
  /** Names for products the initial rules point at. */
  products: Option[];
  currency: string;
}) {
  const [rules, setRules] = useState<Rule[]>(() => {
    const names = new Map(products.map((p) => [p.id, p.name]));
    return initial.map((a) => toRule(a, names));
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const encoded = rules.map(encode).filter((v): v is string => !!v);
  const signature = encoded.join('|');
  const lastSignature = useRef(signature);

  // Only valid rules reach the form (hidden inputs); refresh the preview when they change.
  useEffect(() => {
    if (signature === lastSignature.current) return;
    lastSignature.current = signature;
    rootRef.current?.dispatchEvent(new CustomEvent(LIVE_REFRESH_EVENT, { bubbles: true }));
  }, [signature]);

  // Inline edits from the preview table.
  useEffect(() => {
    const onSet = (e: Event) => {
      const { id, name, value } = (e as CustomEvent<SetProductPriceDetail>).detail;
      setRules((prev) => {
        const rest = prev.filter((r) => !(r.scope === 'product' && r.target === id));
        if (value === null) return rest;
        return [...rest, { key: newKey(), scope: 'product', target: id, label: name, mode: 'set', value: String(value) }];
      });
    };
    window.addEventListener(SET_PRODUCT_PRICE_EVENT, onSet);
    return () => window.removeEventListener(SET_PRODUCT_PRICE_EVENT, onSet);
  }, []);

  const update = (key: string, patch: Partial<Rule>) =>
    setRules((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const add = () =>
    setRules((prev) => [
      ...prev,
      { key: newKey(), scope: prev.length ? 'brand' : 'all', target: '', label: '', mode: 'pct', value: '' },
    ]);

  return (
    <div
      ref={rootRef}
      className="space-y-3"
      // The rule controls have no `name`; stop their events so only the hidden inputs drive refreshes.
      onChange={(e) => e.stopPropagation()}
      onInput={(e) => e.stopPropagation()}
    >
      {encoded.map((v) => (
        <input key={v} type="hidden" name="adj" value={v} />
      ))}

      {rules.length === 0 && (
        <p className="rounded-md border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-500">
          Prices are shown as they are in the shop. Add a rule to raise or lower them.
        </p>
      )}

      {rules.map((r) => (
        <RuleCard
          key={r.key}
          rule={r}
          brands={brands}
          categories={categories}
          currency={currency}
          onChange={(patch) => update(r.key, patch)}
          onRemove={() => setRules((prev) => prev.filter((x) => x.key !== r.key))}
        />
      ))}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={add}
          disabled={rules.length >= MAX_ADJUSTMENTS}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium uppercase tracking-widest transition hover:border-black disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add rule
        </button>
        {rules.length > 1 && (
          <button
            type="button"
            onClick={() => setRules([])}
            className="h-9 rounded-md px-3 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-black"
          >
            Clear all
          </button>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-gray-500">
        Rules stack from broad to specific: <b className="font-medium text-gray-700">All → Category → Brand → Product</b>.
        Use a minus to lower prices (e.g. <b className="font-medium text-gray-700">-5</b>). You can also click any
        price in the preview to set it directly.
      </p>
    </div>
  );
}

function RuleCard({
  rule,
  brands,
  categories,
  currency,
  onChange,
  onRemove,
}: {
  rule: Rule;
  brands: Option[];
  categories: Option[];
  currency: string;
  onChange: (patch: Partial<Rule>) => void;
  onRemove: () => void;
}) {
  const incomplete = (rule.scope !== 'all' && !rule.target) || rule.value.trim() === '';

  return (
    <div
      className={`space-y-2 rounded-lg border p-2.5 transition ${incomplete ? 'border-dashed border-gray-300 bg-gray-50/60' : 'border-gray-200 bg-white'}`}
    >
      <div className="flex items-center gap-2">
        <select
          aria-label="Apply to"
          value={rule.scope}
          onChange={(e) => onChange({ scope: e.target.value as AdjustScope, target: '', label: '' })}
          className={`${control} h-8 flex-1 text-xs font-medium`}
        >
          {SCOPES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove rule"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-red-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {(rule.scope === 'brand' || rule.scope === 'category') && (
        <select
          aria-label={rule.scope === 'brand' ? 'Brand' : 'Category'}
          value={rule.target}
          onChange={(e) => onChange({ target: e.target.value })}
          className={`${control} h-8 text-xs`}
        >
          <option value="">Choose a {rule.scope}…</option>
          {(rule.scope === 'brand' ? brands : categories).map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      )}

      {rule.scope === 'product' &&
        (rule.target ? (
          <div className="flex h-8 items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 text-xs">
            <span className="truncate font-medium">{rule.label || 'Selected product'}</span>
            <button
              type="button"
              onClick={() => onChange({ target: '', label: '' })}
              className="shrink-0 text-[11px] text-gray-500 underline-offset-2 hover:text-black hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          <ProductSearch onPick={(p) => onChange({ target: p.id, label: p.name })} />
        ))}

      <div className="flex items-center gap-2">
        <div className="flex shrink-0 rounded-md border border-gray-200 p-0.5" role="radiogroup" aria-label="Adjustment type">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={rule.mode === m.id}
              title={m.hint}
              onClick={() => onChange({ mode: m.id })}
              className={`h-7 rounded px-2 text-xs font-medium transition ${rule.mode === m.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          {rule.mode !== 'pct' && (
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {currency}
            </span>
          )}
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min={rule.mode === 'set' ? 0 : undefined}
            value={rule.value}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder={rule.mode === 'pct' ? '10 or -5' : rule.mode === 'usd' ? '2 or -1.5' : '24.90'}
            aria-label="Amount"
            className={`${control} h-8 text-xs ${rule.mode === 'pct' ? 'pr-7' : 'pl-7'}`}
          />
          {rule.mode === 'pct' && (
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductSearch({ onPick }: { onPick: (p: PriceRuleProduct) => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<PriceRuleProduct[]>([]);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const search = (value: string) => {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(() => {
      startTransition(async () => setResults(await searchPriceRuleProducts(value)));
    }, 250);
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={q}
        onChange={(e) => search(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (results[0]) onPick(results[0]);
          }
        }}
        placeholder="Search a product…"
        aria-label="Search a product"
        className={`${control} h-8 pl-8 text-xs`}
      />
      {isPending && <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-gray-400" />}
      {q.trim().length >= 2 && !isPending && (
        <div className="mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">No products found.</p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick(p)}
                className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-xs transition hover:bg-gray-50"
              >
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 text-gray-400">{p.price > 0 ? p.price.toFixed(2) : '—'}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
