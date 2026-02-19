-- Enable RLS (already done, but good practice to ensure)
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Admins) to INSERT variants
CREATE POLICY "Admins can insert variants" ON public.product_variants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users (Admins) to UPDATE variants
CREATE POLICY "Admins can update variants" ON public.product_variants
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users (Admins) to DELETE variants
CREATE POLICY "Admins can delete variants" ON public.product_variants
  FOR DELETE USING (auth.role() = 'authenticated');

-- Ensure public can SELECT (Viewing) - (This might duplicate the previous one but ensures it exists)
-- DROP POLICY IF EXISTS "Public can view active variants" ON public.product_variants;
-- CREATE POLICY "Public can view active variants" ON public.product_variants
--   FOR SELECT USING (is_active = true); 
-- (Keeping the existing SELECT policy)
