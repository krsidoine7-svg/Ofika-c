-- Script à exécuter dans Supabase SQL Editor
-- Ajouter les colonnes pour le paiement Lygos

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS lygos_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS lygos_payment_url TEXT;

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_orders_lygos_payment_id 
ON orders (lygos_payment_id);

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('lygos_payment_id', 'lygos_payment_url')
ORDER BY column_name;
