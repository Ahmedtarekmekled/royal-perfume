-- Minimum total pieces per order, enforced in the cart, checkout and the
-- createOrder server action, and shown on the homepage new-buyer strap.
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS min_order_quantity integer NOT NULL DEFAULT 30
  CHECK (min_order_quantity >= 1);
