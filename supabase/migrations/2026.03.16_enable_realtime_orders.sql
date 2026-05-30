-- =====================================================
-- MIGRATION: Enable Realtime for Orders
-- Allows the admin dashboard to receive instant notifications
-- =====================================================

-- 1. Add orders to the realtime publication
-- Note: This is idempotent, it won't fail if already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

COMMENT ON TABLE public.orders IS 'Table des commandes avec notifications temps réel activées';
