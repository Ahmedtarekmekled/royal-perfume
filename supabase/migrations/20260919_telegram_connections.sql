-- Per-dashboard-user Telegram connections. Each admin/employee links their
-- own Telegram account to their own RoyalPerfume login; the bot token stays
-- a server env var (TELEGRAM_BOT_TOKEN) and is never stored here.
create table public.telegram_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  telegram_user_id bigint not null unique,
  telegram_username text,
  telegram_first_name text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Short-lived, single-use tokens minted when a dashboard user clicks
-- "Connect Telegram". The bot's /start handler hashes the token it
-- receives and looks it up here to know which dashboard user to link.
create table public.telegram_connection_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.telegram_connections enable row level security;
alter table public.telegram_connection_requests enable row level security;
-- No policies added on purpose: both tables are only ever touched by
-- server-side route handlers using the service role client (bypasses RLS).
-- Dashboard users interact through /api/telegram/connect, never directly.
