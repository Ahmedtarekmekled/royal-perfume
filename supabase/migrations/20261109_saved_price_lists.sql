-- Saved price lists for the admin Price List page. A row stores the builder's
-- settings (the same query string the builder/export route read), so opening
-- or downloading a saved list always renders with current catalog prices.
create table if not exists public.price_lists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text not null default '',
  params text not null,
  product_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists price_lists_updated_at_idx on public.price_lists (updated_at desc);

alter table public.price_lists enable row level security;

-- Dashboard-only, same model as customers: every authenticated user is staff.
create policy "Admins can view price lists" on public.price_lists for select to authenticated using (true);
create policy "Admins can create price lists" on public.price_lists for insert to authenticated with check (true);
create policy "Admins can update price lists" on public.price_lists for update to authenticated using (true) with check (true);
create policy "Admins can delete price lists" on public.price_lists for delete to authenticated using (true);
