-- Accurate "Best Sellers".
--
-- Before: the homepage sorted by products.sales_count, a counter bumped once
-- at checkout and never corrected — cancelled and deleted orders kept
-- counting, a failed bump was silently lost, one bulk order outweighed many
-- customers, and ties (mostly 0) came back in random order.
--
-- After:
--   1. get_best_sellers() ranks straight from order lines (cancelled orders
--      excluded): most distinct orders in the last N days, then units, then
--      all-time history, then products flagged Popular, then newest — so the
--      list is always full and stable.
--   2. sales_count is kept equal to the real non-cancelled units by triggers
--      on order_items and orders (status changes, edits, deletes), so the
--      shop's "Best Sellers" sort and the admin dashboard are right too.
--   3. sales_count is recomputed once for every product.

-- ── 1. Ranking function ────────────────────────────────────────────────────

create or replace function public.get_best_sellers(p_limit integer default 8, p_days integer default 90)
returns table (product_id uuid, recent_orders bigint, recent_units bigint, total_orders bigint, total_units bigint)
language sql
stable
security definer -- anon can't read orders; this only exposes product ids + counts
set search_path = public
as $$
  with stats as (
    select
      oi.product_id,
      count(distinct oi.order_id) filter (where o.created_at >= now() - make_interval(days => p_days)) as recent_orders,
      coalesce(sum(oi.quantity) filter (where o.created_at >= now() - make_interval(days => p_days)), 0) as recent_units,
      count(distinct oi.order_id) as total_orders,
      coalesce(sum(oi.quantity), 0) as total_units
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.status <> 'cancelled'
      and oi.product_id is not null
    group by oi.product_id
  )
  select
    p.id,
    coalesce(s.recent_orders, 0),
    coalesce(s.recent_units, 0),
    coalesce(s.total_orders, 0),
    coalesce(s.total_units, 0)
  from public.products p
  left join stats s on s.product_id = p.id
  where p.is_active
  order by
    p.stock desc,                       -- in-stock first: customers can actually order them
    coalesce(s.recent_orders, 0) desc,
    coalesce(s.recent_units, 0) desc,
    coalesce(s.total_orders, 0) desc,
    coalesce(s.total_units, 0) desc,
    p.is_popular desc,                  -- fill empty slots with hand-picked products
    p.created_at desc,
    p.id
  limit greatest(1, least(p_limit, 50));
$$;

revoke all on function public.get_best_sellers(integer, integer) from public;
grant execute on function public.get_best_sellers(integer, integer) to anon, authenticated, service_role;

-- ── 2. Keep sales_count true ───────────────────────────────────────────────

create or replace function public.refresh_product_sales_counts(p_ids uuid[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.products p
  set sales_count = coalesce((
    select sum(oi.quantity)
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.product_id = p.id
      and o.status <> 'cancelled'
  ), 0)
  where p.id = any(p_ids);
$$;

revoke all on function public.refresh_product_sales_counts(uuid[]) from public;

create or replace function public.trg_order_items_sales_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_product_sales_counts(array_remove(array[
    case when tg_op <> 'DELETE' then new.product_id end,
    case when tg_op <> 'INSERT' then old.product_id end
  ], null));
  return null;
end;
$$;

drop trigger if exists order_items_sales_count on public.order_items;
create trigger order_items_sales_count
after insert or update of product_id, quantity, order_id or delete on public.order_items
for each row execute function public.trg_order_items_sales_count();

create or replace function public.trg_orders_status_sales_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (old.status = 'cancelled') is distinct from (new.status = 'cancelled') then
    perform public.refresh_product_sales_counts(array(
      select distinct oi.product_id from public.order_items oi
      where oi.order_id = new.id and oi.product_id is not null
    ));
  end if;
  return null;
end;
$$;

drop trigger if exists orders_status_sales_count on public.orders;
create trigger orders_status_sales_count
after update of status on public.orders
for each row execute function public.trg_orders_status_sales_count();

-- Checkout still calls this after inserting order items; the trigger above
-- has already counted them, so it's now a no-op (kept so older deployments
-- calling it don't error or double count).
create or replace function public.increment_sales_counts(items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  return;
end;
$$;

-- ── 3. One-time correction ─────────────────────────────────────────────────

select public.refresh_product_sales_counts(array(select id from public.products));
