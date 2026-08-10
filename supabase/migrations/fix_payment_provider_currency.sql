-- Migration pour corriger les colonnes payment_provider et currency
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter la colonne currency si elle n'existe pas
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'XOF' 
CHECK (currency = ANY (ARRAY['EUR'::text, 'USD'::text, 'XOF'::text]));

ALTER TABLE public.orders 
ALTER COLUMN payment_provider SET DEFAULT 'Wave';

UPDATE public.orders 
SET payment_provider = 'Wave'
WHERE payment_provider IS NULL OR payment_provider = 'Wave';

-- 4. Mettre à jour les commandes existantes avec currency NULL ou 'EUR'
UPDATE public.orders 
SET currency = 'XOF'
WHERE currency IS NULL OR currency = 'EUR';

-- 5. Vérifier les résultats
SELECT 
  id, 
  order_number, 
  payment_provider, 
  currency,
  payment_status,
  total_cents
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;
