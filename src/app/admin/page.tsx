import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  FileSpreadsheet,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { isSupabaseStorageUrl, toProxiedObjectUrl } from '@/lib/images';

export const dynamic = 'force-dynamic';

const DAY = 24 * 60 * 60 * 1000;
const CHART_DAYS = 30;

interface OrderRow {
  id: string;
  created_at: string;
  status: string;
  customer_name: string | null;
  order_items: { quantity: number; unit_price: number }[] | null;
}

interface DayPoint {
  start: number;
  label: string;
  orders: number;
  value: number;
  pieces: number;
}

// Order value from line items rather than orders.total_amount: when "hide
// prices" is on, total_amount is stored as 0 but unit_price keeps the real price.
const orderValue = (o: OrderRow) =>
  (o.order_items || []).reduce((n, i) => n + i.quantity * Number(i.unit_price || 0), 0);
const orderPieces = (o: OrderRow) => (o.order_items || []).reduce((n, i) => n + i.quantity, 0);

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: n < 1000 ? 2 : 0 })}`;

function trend(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

const card = 'rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const now = Date.now();
  const cutoffIso = new Date(now - CHART_DAYS * DAY).toISOString();
  const since = new Date(now - 2 * CHART_DAYS * DAY).toISOString();

  // All independent — run concurrently.
  const [
    { data: recentWindow },
    { count: pendingCount },
    { count: shippedCount },
    { count: cancelledCount },
    { count: productsCount },
    { count: activeProductsCount },
    { count: outOfStockCount },
    { count: customersCount },
    { count: newCustomersCount },
    { count: brandsCount },
    { count: categoriesCount },
    { data: latestOrders },
    { data: topSellers },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, created_at, status, customer_name, order_items(quantity, unit_price)')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['shipped', 'delivered']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('stock', false),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }).gte('created_at', cutoffIso),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id, created_at, status, customer_name, order_items(quantity, unit_price)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('products')
      .select('id, name_en, images, sales_count, brands(name)')
      .eq('is_active', true)
      .order('sales_count', { ascending: false })
      .limit(5),
  ]);

  const windowOrders = ((recentWindow || []) as OrderRow[]).filter((o) => o.status !== 'cancelled');
  const cutoff = now - CHART_DAYS * DAY;
  const current = windowOrders.filter((o) => new Date(o.created_at).getTime() >= cutoff);
  const previous = windowOrders.filter((o) => new Date(o.created_at).getTime() < cutoff);

  const curValue = current.reduce((n, o) => n + orderValue(o), 0);
  const prevValue = previous.reduce((n, o) => n + orderValue(o), 0);
  const curPieces = current.reduce((n, o) => n + orderPieces(o), 0);
  const prevPieces = previous.reduce((n, o) => n + orderPieces(o), 0);

  // Daily buckets for the last 30 days (zero-filled so the chart has no gaps).
  const startOfToday = new Date(new Date(now).toDateString()).getTime();
  const days: DayPoint[] = Array.from({ length: CHART_DAYS }, (_, i) => {
    const start = startOfToday - (CHART_DAYS - 1 - i) * DAY;
    return { start, label: new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), orders: 0, value: 0, pieces: 0 };
  });
  current.forEach((o) => {
    const idx = Math.floor((new Date(o.created_at).getTime() - days[0].start) / DAY);
    if (idx >= 0 && idx < days.length) {
      days[idx].orders += 1;
      days[idx].value += orderValue(o);
      days[idx].pieces += orderPieces(o);
    }
  });
  const busiest = days.reduce((best, d) => (d.orders > best.orders ? d : best), days[0]);

  const pending = pendingCount || 0;
  const statusTotal = pending + (shippedCount || 0) + (cancelledCount || 0);
  const topMax = Math.max(1, ...(topSellers || []).map((p) => p.sales_count || 0));
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 md:space-y-7">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-400">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="mt-1.5 font-playfair text-[28px] font-bold leading-tight md:text-[34px]">{greeting}</h1>
          <p className="mt-1 text-sm text-gray-500">A calm look at Royal Perfumes over the last {CHART_DAYS} days.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex h-10 items-center rounded-full border border-gray-200 bg-white px-5 text-xs font-medium uppercase tracking-widest text-gray-700 transition hover:border-gray-900 hover:text-black"
          >
            Orders
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-black/85"
          >
            <Plus className="h-4 w-4" /> Product
          </Link>
        </div>
      </header>

      {/* ── Needs attention ───────────────────────────────── */}
      {pending > 0 && (
        <Link
          href="/admin/orders?status=pending"
          className={`${card} group flex items-center gap-4 px-4 py-3.5 transition hover:border-amber-300 sm:px-5`}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-gray-700">
            <strong className="font-semibold text-gray-900">{pending} {pending === 1 ? 'order' : 'orders'}</strong> waiting for your review
          </p>
          <span className="hidden items-center gap-1 text-xs font-medium text-gray-500 transition group-hover:text-black sm:inline-flex">
            Review now <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400 sm:hidden" />
        </Link>
      )}

      {/* ── KPIs ──────────────────────────────────────────── */}
      <section aria-label="Key statistics" className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:gap-4 xl:grid-cols-4">
        <Kpi icon={ShoppingBag} label="Orders" value={current.length.toLocaleString()} delta={trend(current.length, previous.length)} series={days.map((d) => d.orders)} />
        <Kpi icon={Wallet} label="Order value" value={money(curValue)} delta={trend(curValue, prevValue)} series={days.map((d) => d.value)} />
        <Kpi icon={Package} label="Pieces ordered" value={curPieces.toLocaleString()} delta={trend(curPieces, prevPieces)} series={days.map((d) => d.pieces)} />
        <Kpi
          icon={Users}
          label="Customers"
          value={(customersCount || 0).toLocaleString()}
          note={`${newCustomersCount || 0} new in the last ${CHART_DAYS} days`}
        />
      </section>

      {/* ── Chart + status ────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={`${card} min-w-0 p-5 sm:p-6 lg:col-span-2`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-playfair text-lg font-bold">Orders over time</h2>
              <p className="mt-0.5 text-xs text-gray-500">Daily orders · last {CHART_DAYS} days · excludes cancelled</p>
            </div>
            <dl className="flex gap-6 text-right">
              <MiniFigure label="Total" value={current.length.toLocaleString()} />
              <MiniFigure label="Per day" value={(current.length / CHART_DAYS).toFixed(1)} />
              <MiniFigure label="Busiest" value={busiest.orders ? busiest.label : '—'} />
            </dl>
          </div>
          <div className="mt-6">
            <AreaChart days={days} />
          </div>
        </div>

        <div className={`${card} flex flex-col p-5 sm:p-6`}>
          <h2 className="font-playfair text-lg font-bold">Order status</h2>
          <p className="mt-0.5 text-xs text-gray-500">All time</p>
          <div className="mt-5 flex items-center gap-6">
            <Donut
              total={statusTotal}
              segments={[
                { value: pending, color: '#f59e0b' },
                { value: shippedCount || 0, color: '#047857' },
                { value: cancelledCount || 0, color: '#7f1d1d' },
              ]}
            />
            <div className="min-w-0 flex-1 space-y-3">
              <StatusRow href="/admin/orders?status=pending" color="bg-amber-500" label="Pending" value={pending} total={statusTotal} />
              <StatusRow href="/admin/orders?status=shipped" color="bg-emerald-700" label="Shipped" value={shippedCount || 0} total={statusTotal} />
              <StatusRow href="/admin/orders?status=cancelled" color="bg-red-900" label="Cancelled" value={cancelledCount || 0} total={statusTotal} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4 text-center lg:mt-auto">
            <MiniStat label="Products" value={activeProductsCount || 0} sub={`${productsCount || 0} total`} href="/admin/products" />
            <MiniStat label="Brands" value={brandsCount || 0} href="/admin/brands" />
            <MiniStat label="Categories" value={categoriesCount || 0} href="/admin/categories" />
          </div>
          {(outOfStockCount || 0) > 0 && (
            <Link
              href="/admin/products"
              className="mt-4 flex items-center justify-between rounded-xl bg-red-50/70 px-3 py-2.5 text-xs text-red-900 transition hover:bg-red-50"
            >
              <span>
                <strong>{outOfStockCount}</strong> active {outOfStockCount === 1 ? 'product is' : 'products are'} out of stock
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </section>

      {/* ── Recent orders + best sellers ──────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className={`${card} min-w-0 lg:col-span-3`}>
          <CardHeader title="Latest orders" href="/admin/orders" linkLabel="All orders" />
          {latestOrders && latestOrders.length > 0 ? (
            <ul className="divide-y divide-gray-100 pb-2">
              {(latestOrders as OrderRow[]).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders?q=${o.id.slice(0, 8)}`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-50/80 sm:px-6"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 font-playfair text-sm font-bold text-gray-700">
                      {(o.customer_name || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{o.customer_name || 'Guest'}</p>
                      <p className="truncate text-xs text-gray-500">
                        <span className="font-mono">#{o.id.slice(0, 8)}</span> · {orderPieces(o)} pcs ·{' '}
                        {timeAgo(new Date(o.created_at).getTime(), now)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold tabular-nums">{money(orderValue(o))}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-12 text-center text-sm text-gray-500">No orders yet.</p>
          )}
        </div>

        <div className={`${card} min-w-0 lg:col-span-2`}>
          <CardHeader title="Best sellers" href="/admin/products" linkLabel="Products" />
          {topSellers && topSellers.length > 0 ? (
            <ol className="space-y-4 px-5 pb-5 sm:px-6">
              {topSellers.map((p, i) => {
                const img = p.images?.[0];
                const brand = (p.brands as unknown as { name: string } | null)?.name;
                const sold = p.sales_count || 0;
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={isSupabaseStorageUrl(img) ? toProxiedObjectUrl(img) : img}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-contain p-1"
                        />
                      )}
                      <span className="absolute -left-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium text-gray-900">{p.name_en}</p>
                        <span className="shrink-0 text-xs tabular-nums text-gray-500">
                          <strong className="text-gray-900">{sold}</strong> sold
                        </span>
                      </div>
                      {brand && <p className="truncate text-xs text-gray-400">{brand}</p>}
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-gray-900" style={{ width: `${(sold / topMax) * 100}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="px-6 py-12 text-center text-sm text-gray-500">No sales yet.</p>
          )}
        </div>
      </section>

      {/* ── Quick actions ─────────────────────────────────── */}
      <section aria-label="Quick actions" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickAction href="/admin/price-list" icon={FileSpreadsheet} title="Price list" text="Export PDF or Excel" />
        <QuickAction href="/admin/catalog" icon={BookOpen} title="Catalog" text="Build a visual catalog" />
        <QuickAction href="/admin/shipping" icon={Truck} title="Shipping" text="Zones & rates" />
        <QuickAction href="/admin/settings" icon={Settings} title="Settings" text="Store configuration" />
      </section>
    </div>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────

function CardHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">
      <h2 className="font-playfair text-lg font-bold">{title}</h2>
      <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-black">
        {linkLabel} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  series,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta?: number | null;
  series?: number[];
  note?: string;
}) {
  return (
    <div className={`${card} flex min-w-0 flex-col p-5`}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <Icon className="h-4 w-4" />
        </span>
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">{label}</p>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="truncate font-playfair text-[28px] font-bold leading-none tabular-nums">{value}</p>
        {series && <Sparkline series={series} />}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
        {note ? (
          note
        ) : delta === null || delta === undefined ? (
          'No data for the previous period'
        ) : (
          <>
            <span
              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-800'
              }`}
            >
              {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta)}%
            </span>
            vs previous {CHART_DAYS} days
          </>
        )}
      </p>
    </div>
  );
}

function MiniFigure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.14em] text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold tabular-nums text-gray-900">{value}</dd>
    </div>
  );
}

function StatusRow({ href, color, label, value, total }: { href: string; color: string; label: string; value: number; total: number }) {
  return (
    <Link href={href} className="group flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 text-gray-600 transition group-hover:text-black">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {label}
      </span>
      <span className="tabular-nums">
        <strong className="font-semibold">{value}</strong>
        <span className="ml-1.5 text-xs text-gray-400">{total ? Math.round((value / total) * 100) : 0}%</span>
      </span>
    </Link>
  );
}

function MiniStat({ label, value, sub, href }: { label: string; value: number; sub?: string; href: string }) {
  return (
    <Link href={href} className="px-1 py-1 transition hover:opacity-70">
      <p className="font-playfair text-xl font-bold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-gray-500">{label}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800',
    shipped: 'bg-emerald-50 text-emerald-800',
    delivered: 'bg-emerald-50 text-emerald-800',
    cancelled: 'bg-red-50 text-red-800',
  };
  const label = status === 'delivered' ? 'shipped' : status;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {label}
    </span>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <Link href={href} className={`${card} group flex min-w-0 items-center gap-3 p-4 transition hover:border-gray-900`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition group-hover:bg-black group-hover:text-white">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-gray-500">{text}</span>
      </span>
    </Link>
  );
}

// ── Charts (server-rendered SVG, no client JS) ───────────────────────

/** Catmull-Rom → cubic Bézier, giving a smooth line through every point. */
function smoothPath(points: [number, number][], height: number): string {
  if (points.length < 2) return '';
  const clampY = (v: number) => Math.min(height, Math.max(0, v));
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, clampY(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, clampY(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function AreaChart({ days }: { days: DayPoint[] }) {
  const total = days.reduce((n, d) => n + d.orders, 0);
  if (total === 0) {
    return <div className="flex h-56 items-center justify-center text-sm text-gray-400">No orders in the last {days.length} days.</div>;
  }

  const W = 600;
  const H = 200;
  const max = Math.max(...days.map((d) => d.orders));
  const top = max + Math.max(1, Math.ceil(max * 0.15)); // headroom above the peak
  const step = W / (days.length - 1);
  const points: [number, number][] = days.map((d, i) => [i * step, H - (d.orders / top) * H]);
  const line = smoothPath(points, H);
  const area = `${line} L${W},${H} L0,${H} Z`;
  const ticks = [top, Math.round(top / 2), 0];
  const last = points[points.length - 1];

  return (
    <div className="flex gap-3">
      <div className="flex h-[200px] flex-col justify-between text-right text-[10px] tabular-nums text-gray-400">
        {ticks.map((t) => (
          <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{t}</span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative h-[200px]">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label="Orders per day">
            <defs>
              <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((f) => (
              <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="#f1f1f1" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            <path d={area} fill="url(#ordersFill)" />
            <path d={line} fill="none" stroke="#0a0a0a" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {days.map((d, i) => (
              <rect
                key={d.label}
                x={i * step - step / 2}
                y={0}
                width={step}
                height={H}
                className="fill-transparent transition-colors hover:fill-black/[0.04]"
              >
                <title>{`${d.label}: ${d.orders} ${d.orders === 1 ? 'order' : 'orders'} · ${money(d.value)}`}</title>
              </rect>
            ))}
          </svg>
          {/* Today marker as HTML so it stays round despite the stretched SVG */}
          <span
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-900 shadow"
            style={{ left: `${(last[0] / W) * 100}%`, top: `${(last[1] / H) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-gray-400">
          <span>{days[0].label}</span>
          <span className="hidden sm:inline">{days[Math.floor(days.length / 2)].label}</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ series }: { series: number[] }) {
  const W = 84;
  const H = 28;
  const max = Math.max(1, ...series);
  const step = W / Math.max(1, series.length - 1);
  const points: [number, number][] = series.map((v, i) => [i * step, H - 2 - (v / max) * (H - 4)]);
  const line = smoothPath(points, H);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-7 w-[84px] shrink-0" aria-hidden>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill="#0a0a0a" fillOpacity={0.06} />
      <path d={line} fill="none" stroke="#0a0a0a" strokeOpacity={0.7} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function Donut({ total, segments }: { total: number; segments: { value: number; color: string }[] }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx={50} cy={50} r={r} fill="none" stroke="#f3f4f6" strokeWidth={9} />
        {total > 0 &&
          segments.map((s, i) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={i}
                cx={50}
                cy={50}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={9}
                strokeDasharray={`${Math.max(len - (s.value > 0 ? 1.5 : 0), 0)} ${c}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-playfair text-xl font-bold tabular-nums leading-none">{total}</span>
        <span className="mt-1 text-[9px] uppercase tracking-[0.16em] text-gray-400">orders</span>
      </div>
    </div>
  );
}

function timeAgo(t: number, now: number): string {
  const mins = Math.round((now - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
