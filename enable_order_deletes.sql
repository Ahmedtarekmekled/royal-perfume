-- =========================================================================
-- SCRIPT: Enable Deletions in Supabase
-- PURPOSE: By default, Supabase blocks deleting rows for security (RLS).
--          This script creates a policy to allow authenticated users 
--          (like Admins) to safely delete orders and their items.
-- =========================================================================

BEGIN;

  -- 1. Enable deletes on the orders table
  CREATE POLICY "Enable deletes for authenticated users" 
  ON public.orders FOR DELETE TO authenticated USING (true);

  -- 2. Enable deletes on the order_items table (required to delete the order)
  CREATE POLICY "Enable deletes for authenticated users" 
  ON public.order_items FOR DELETE TO authenticated USING (true);

COMMIT;

-- 💡 HOW TO USE:
-- 1. Go to your Supabase Dashboard -> SQL Editor.
-- 2. Click "New Query".
-- 3. Copy and paste this script.
-- 4. Click 'Run'.
