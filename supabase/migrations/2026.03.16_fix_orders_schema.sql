-- =====================================================
-- MIGRATION: Fix Orders Table Schema
-- Adds missing columns expected by the API
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

-- Si delivered_at existe, on peut peupler actual_delivery
UPDATE public.orders SET actual_delivery = delivered_at WHERE actual_delivery IS NULL AND delivered_at IS NOT NULL;

-- 2. Update existing records (optional, but good for consistency)
UPDATE public.orders 
SET status = payment_status 
WHERE status IS NULL;

-- 3. Add Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_orders_card_type ON public.orders(card_type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

COMMENT ON COLUMN public.orders.card_type IS 'Type de carte commandée (nfc_qr, qr_only, etc.)';
COMMENT ON COLUMN public.orders.status IS 'Statut global de la commande';
