-- =============================================
-- FIX FOR: "new row violates row-level security policy for table orders"
-- =============================================
-- Run this SQL in your Supabase SQL Editor to fix the RLS error
-- Dashboard → SQL Editor → New Query → Paste this → Run

-- Drop existing restrictive policies
drop policy if exists "Public can create orders" on public.orders;
drop policy if exists "Public can create order items" on public.order_items;

-- Create new policies that allow public INSERT
create policy "Public can create orders" 
  on public.orders 
  for insert 
  to anon, authenticated
  with check (true);

create policy "Public can create order items" 
  on public.order_items 
  for insert 
  to anon, authenticated
  with check (true);

-- Allow public to read orders (for future order tracking)
drop policy if exists "Public can read orders" on public.orders;
drop policy if exists "Public can read order items" on public.order_items;

create policy "Public can read orders" 
  on public.orders 
  for select 
  to anon, authenticated
  using (true);

create policy "Public can read order items" 
  on public.order_items 
  for select 
  to anon, authenticated
  using (true);

-- Verify policies were created
select schemaname, tablename, policyname, permissive, roles, cmd 
from pg_policies 
where tablename in ('orders', 'order_items')
order by tablename, policyname;
