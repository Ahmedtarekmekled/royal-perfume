-- Backfill customer_id on pre-existing orders, reusing find_or_create_customer
-- (same migration set, 20261002_add_customers_table.sql) so backfilled
-- customers are deduped with the exact same normalization/conflict logic
-- that live checkout uses going forward. Processes orders oldest-first so
-- the earliest order's name wins ties the same way live checkout would.
-- Idempotent: only touches orders where customer_id is still null, never
-- modifies order contents, and records (not auto-merges) any email/phone
-- identity conflicts it finds via customer_merge_conflicts for manual review.
do $$
declare
  r record;
  v_result record;
begin
  for r in
    select id, customer_name, customer_email, customer_phone
    from public.orders
    where customer_id is null
    order by created_at asc
  loop
    select * into v_result from public.find_or_create_customer(r.customer_name, r.customer_email, r.customer_phone);
    update public.orders set customer_id = v_result.customer_id where id = r.id;
  end loop;
end;
$$;
