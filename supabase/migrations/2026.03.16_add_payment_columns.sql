-- =====================================================
-- MIGRATION: Add Payment Columns to Orders
-- =====================================================

-- 1. Add payment tracking columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS Wave_payment_id TEXT,
ADD COLUMN IF NOT EXISTS Wave_payment_url TEXT,
ADD COLUMN IF NOT EXISTS payment_provider TEXT,
ADD COLUMN IF NOT EXISTS checkout_url TEXT; -- Generic column for future use

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(Wave_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider ON public.orders(payment_provider);

-- 3. Comments for documentation
COMMENT ON COLUMN public.orders.Wave_payment_id IS 'ID de transaction renvoyé par le fournisseur de paiement';
COMMENT ON COLUMN public.orders.Wave_payment_url IS 'URL de redirection vers la page de paiement';
COMMENT ON COLUMN public.orders.payment_provider IS 'Fournisseur utilisé (Wave, wave, etc.)';
COMMENT ON COLUMN public.orders.checkout_url IS 'URL générique de paiement (recommandé)';
