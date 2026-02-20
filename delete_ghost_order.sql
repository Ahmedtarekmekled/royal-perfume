-- =========================================================================
-- SCRIPT: Delete Ghost Order
-- PURPOSE: Safely removes ghost/test orders from the database, including 
--          associated order_items to prevent foreign key constraint errors.
-- =========================================================================

-- Replace the UUID below with the actual Order ID you wish to delete.
-- You can find the full Order ID in your Supabase 'orders' table.

BEGIN;

  -- 1. First, delete all order items associated with this ghost order.
  DELETE FROM public.order_items 
  WHERE order_id = 'YOUR-ORDER-ID-GOES-HERE';
  
  -- 2. Then, delete the order record itself.
  DELETE FROM public.orders 
  WHERE id = 'YOUR-ORDER-ID-GOES-HERE';

COMMIT;

-- 💡 HOW TO USE:
-- 1. Go to your Supabase Dashboard -> SQL Editor.
-- 2. Copy and paste this script.
-- 3. Replace 'YOUR-ORDER-ID-GOES-HERE' with the ID of the ghost order.
-- 4. Click 'Run'.
