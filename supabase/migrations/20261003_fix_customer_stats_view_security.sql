-- The customer_stats view (20261002_add_customers_table.sql) was created
-- with Postgres's default view behavior, which runs as the view owner
-- rather than the querying user — effectively bypassing RLS on customers/
-- orders for anyone who can select from the view. security_invoker makes it
-- run with the querying role's own permissions/RLS instead, closing that
-- gap (Supabase security linter: "Security Definer View").
alter view public.customer_stats set (security_invoker = true);
