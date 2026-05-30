-- =====================================================
-- MIGRATION: Fix Orders Table Schema
-- Adds missing columns expected by the API endpoints
-- =====================================================

-- 1. Add missing columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS card_type TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_price INTEGER,
ADD COLUMN IF NOT EXISTS total_amount INTEGER,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_delivery TIMESTAMPTZ;

-- 2. Synchronize existing data for consistency
UPDATE public.orders 
SET 
  status = payment_status,
  total_amount = total_cents,
  actual_delivery = delivered_at
WHERE status IS NULL;

-- 3. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_card_type ON public.orders(card_type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);

-- 4. Comments for documentation
COMMENT ON COLUMN public.orders.card_type IS 'Type de carte commandée (nfc_qr, qr_only, premium, etc.)';
COMMENT ON COLUMN public.orders.status IS 'Statut global de la commande (pending, paid, shipped, etc.)';
COMMENT ON COLUMN public.orders.quantity IS 'Nombre d''articles dans la commande';
COMMENT ON COLUMN public.orders.total_amount IS 'Montant total en unité monétaire (redondant avec total_cents pour compatibilité API)';
