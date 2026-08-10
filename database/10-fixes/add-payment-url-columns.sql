-- =====================================================
-- =====================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS Wave_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS Wave_payment_url TEXT;

-- Ajouter des commentaires pour documenter la structure
COMMENT ON COLUMN orders.Wave_payment_id IS 'ID du paiement Wave (ex: 65167356-d2d2-43ef-b242-4d371ce75805)';
COMMENT ON COLUMN orders.Wave_payment_url IS 'URL de paiement Wave (ex: https://pay.Waveapp.com/checkout/65167356-d2d2-43ef-b242-4d371ce75805)';

-- Créer un index pour les requêtes sur l'ID de paiement
CREATE INDEX IF NOT EXISTS idx_orders_Wave_payment_id 
ON orders (Wave_payment_id);

-- Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;
