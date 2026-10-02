-- Customer Management: dedupe guest checkout orders into a single Customer
-- record per real person, matched by normalized email/phone. No customer
-- login/auth is introduced — customers stay guest-only; this table exists
-- purely for admin-side order history and is never exposed to the public API.

create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  normalized_email text,
  phone text,
  normalized_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partial unique indexes: NULLs (customer had no email, or no phone, on
-- their first order) are allowed to repeat; a real value can only belong
-- to one customer. This is the actual dedupe guarantee, enforced by
-- Postgres itself rather than application code.
create unique index customers_normalized_email_key on public.customers (normalized_email) where normalized_email is not null;
create unique index customers_normalized_phone_key on public.customers (normalized_phone) where normalized_phone is not null;

alter table public.orders add column customer_id uuid references public.customers(id) on delete set null;
create index idx_orders_customer_id on public.orders(customer_id);

-- Order/spend totals are intentionally NOT stored on customers (would be
-- redundant, derived data that could drift out of sync with orders). They
-- are computed on read via this view instead.
create or replace view public.customer_stats as
select
  c.id as customer_id,
  count(o.id) as order_count,
  coalesce(sum(o.total_amount) filter (where o.status <> 'cancelled'), 0) as total_spent,
  min(o.created_at) as first_order_at,
  max(o.created_at) as last_order_at
from public.customers c
left join public.orders o on o.customer_id = c.id
group by c.id;

-- Logged when a new order's email matches one existing customer but its
-- phone matches a *different* existing customer. We never auto-merge in
-- this case (could wrongly combine two real people); the order is attached
-- to the email match and the conflict is parked here for a human to review.
create table public.customer_merge_conflicts (
  id uuid primary key default uuid_generate_v4(),
  email_customer_id uuid references public.customers(id) on delete cascade,
  phone_customer_id uuid references public.customers(id) on delete cascade,
  attempted_name text,
  attempted_email text,
  attempted_phone text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.customer_merge_conflicts enable row level security;
-- No insert policy on customers for anon or authenticated: the only way to
-- create a customer is the find_or_create_customer RPC below (SECURITY
-- DEFINER, bypasses RLS on purpose). Authenticated admins get select/update
-- (update is for editing the notes field from the dashboard) but never insert.
create policy "Admins can view customers" on public.customers for select to authenticated using (true);
create policy "Admins can update customers" on public.customers for update to authenticated using (true) with check (true);

create policy "Admins can view merge conflicts" on public.customer_merge_conflicts for select to authenticated using (true);
create policy "Admins can resolve merge conflicts" on public.customer_merge_conflicts for update to authenticated using (true) with check (true);

-- Atomic find-or-create, callable from the browser client exactly like the
-- existing increment_sales_counts RPC. One call = one implicit transaction;
-- the advisory lock additionally serializes concurrent calls for the same
-- identity so two near-simultaneous orders from the same new customer can't
-- both pass the "no match found" check and insert two customer rows (the
-- unique indexes above are the final backstop if that ever happened anyway).
create or replace function public.find_or_create_customer(
  p_name text,
  p_email text,
  p_phone text
) returns table(customer_id uuid, had_conflict boolean) as $$
declare
  v_norm_email text;
  v_norm_phone text;
  v_email_customer_id uuid;
  v_phone_customer_id uuid;
  v_customer_id uuid;
  v_conflict boolean := false;
begin
  v_norm_email := nullif(lower(trim(p_email)), '');
  -- Keep digits and a leading '+' so real international country codes
  -- survive; strip spaces/dashes/parens/dots which carry no identity.
  v_norm_phone := nullif(regexp_replace(trim(p_phone), '[^0-9+]', '', 'g'), '');

  perform pg_advisory_xact_lock(hashtext(coalesce(v_norm_email, '') || '|' || coalesce(v_norm_phone, '')));

  if v_norm_email is not null then
    select id into v_email_customer_id from public.customers where normalized_email = v_norm_email;
  end if;

  if v_norm_phone is not null then
    select id into v_phone_customer_id from public.customers where normalized_phone = v_norm_phone;
  end if;

  if v_email_customer_id is not null and v_phone_customer_id is not null and v_email_customer_id <> v_phone_customer_id then
    v_conflict := true;
    v_customer_id := v_email_customer_id; -- prefer the email match; never auto-merge
  elsif v_email_customer_id is not null then
    v_customer_id := v_email_customer_id;
  elsif v_phone_customer_id is not null then
    v_customer_id := v_phone_customer_id;
  end if;

  if v_customer_id is null then
    insert into public.customers (name, email, normalized_email, phone, normalized_phone)
    values (p_name, p_email, v_norm_email, p_phone, v_norm_phone)
    returning id into v_customer_id;
  else
    update public.customers set
      name = p_name,
      email = coalesce(public.customers.email, p_email),
      normalized_email = coalesce(public.customers.normalized_email, v_norm_email),
      phone = coalesce(public.customers.phone, p_phone),
      normalized_phone = coalesce(public.customers.normalized_phone, v_norm_phone),
      updated_at = now()
    where id = v_customer_id;
  end if;

  return query select v_customer_id, v_conflict;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.find_or_create_customer(text, text, text) to anon, authenticated;
