-- =========================================================================
-- SCRIPT: Drop Ghost Order Column
-- PURPOSE: Completely removes the 'is_verified' (ghost order) column from
--          the database schema, as it is no longer needed in the new flow.
-- =========================================================================

BEGIN;

  -- Drop the column if it exists
  ALTER TABLE public.orders 
  DROP COLUMN IF EXISTS is_verified;

COMMIT;

-- 💡 HOW TO USE:
-- 1. Go to your Supabase Dashboard -> SQL Editor.
-- 2. Copy and paste this script.
-- 3. Click 'Run'.
