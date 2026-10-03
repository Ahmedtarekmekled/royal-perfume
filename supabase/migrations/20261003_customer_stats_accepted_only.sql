-- order_count/total_spent/last_order_at on the Customers page should only
-- reflect orders the admin has actually accepted, not every pending guest
-- checkout — otherwise a customer's "order count" inflates the moment they
-- submit the form, before anyone has confirmed the order is real. The
-- customer detail page's order-history table still lists every order
-- (pending/shipped/cancelled) with its status badge; only the aggregate
-- counters here are restricted. first_order_at is left based on all orders
-- so "customer since" still reflects when they first showed up, not just
-- when they were first accepted.
create or replace view public.customer_stats
with (security_invoker = true)
as
select
  c.id as customer_id,
  count(o.id) filter (where o.status in ('shipped', 'delivered')) as order_count,
  coalesce(sum(o.total_amount) filter (where o.status in ('shipped', 'delivered')), 0) as total_spent,
  min(o.created_at) as first_order_at,
  max(o.created_at) filter (where o.status in ('shipped', 'delivered')) as last_order_at
from public.customers c
left join public.orders o on o.customer_id = c.id
group by c.id;
