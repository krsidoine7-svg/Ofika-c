-- =====================================================
-- MIGRATION: AJOUT COLONNES ANALYTICS DETAILLEES SUR QR_SCANS
-- =====================================================

ALTER TABLE public.qr_scans 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_qr_scans_created_at ON public.qr_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_redirect_id ON public.qr_scans(qr_redirect_id);
