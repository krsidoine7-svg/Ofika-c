-- ============================================================================
-- Migration : Remplacement Wave CI par LyGOS
-- Objectif   : Supprimer les colonnes Wave et s'assurer que LyGOS est configuré
-- Date       : 2025-11-21
-- ============================================================================

-- 1) Vérifier que les colonnes LyGOS existent, sinon les créer
DO $$
BEGIN
  -- Ajouter lygos_payment_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'lygos_payment_id'
  ) THEN
    ALTER TABLE public.orders
      ADD COLUMN lygos_payment_id TEXT;
    
    COMMENT ON COLUMN public.orders.lygos_payment_id 
    IS 'ID unique du paiement LyGOS (gateway_id)';
  END IF;

  -- Ajouter lygos_payment_url si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'lygos_payment_url'
  ) THEN
    ALTER TABLE public.orders
      ADD COLUMN lygos_payment_url TEXT;
    
    COMMENT ON COLUMN public.orders.lygos_payment_url 
    IS 'URL de paiement LyGOS (lien de checkout)';
  END IF;
END $$;

-- 2) Créer un index sur lygos_payment_id pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_orders_lygos_payment_id 
ON public.orders(lygos_payment_id);

-- 3) Migrer les données Wave vers LyGOS (si nécessaire)
-- Note: Cette migration suppose que vous voulez conserver les données existantes
-- Si vous avez des commandes avec wave_payment_id, vous pouvez les migrer ici
-- UPDATE public.orders
-- SET lygos_payment_id = wave_payment_id,
--     lygos_payment_url = wave_payment_url
-- WHERE wave_payment_id IS NOT NULL
--   AND lygos_payment_id IS NULL;

-- 4) Supprimer les colonnes Wave CI (après migration des données si nécessaire)
-- ATTENTION: Décommentez ces lignes seulement après avoir migré les données
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS wave_payment_id;
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS wave_payment_url;

-- 5) Supprimer l'index Wave s'il existe
-- DROP INDEX IF EXISTS idx_orders_wave_payment_id;

-- ============================================================================
-- Vérification
-- ============================================================================
-- Vérifier que les colonnes LyGOS existent
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('lygos_payment_id', 'lygos_payment_url')
ORDER BY column_name;

-- Vérifier l'index
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'orders'
  AND indexname = 'idx_orders_lygos_payment_id';

