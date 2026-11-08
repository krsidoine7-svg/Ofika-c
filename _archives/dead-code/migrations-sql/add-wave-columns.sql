-- =====================================================
-- MIGRATION WAVE CI - Ajout des Colonnes de Paiement
-- =====================================================
-- Date: 2025-11-09
-- À exécuter dans: Supabase SQL Editor

-- =====================================================
-- ÉTAPE 1 : Ajouter les colonnes Wave CI
-- =====================================================

-- Colonnes Wave CI (système actif)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS wave_payment_id text;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS wave_payment_url text;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS Wave_payment_id text;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS Wave_payment_url text;

-- =====================================================
-- ÉTAPE 2 : Créer les index pour optimiser les recherches
-- =====================================================

-- Index sur wave_payment_id pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_orders_wave_payment_id 
ON orders(wave_payment_id);

CREATE INDEX IF NOT EXISTS idx_orders_Wave_payment_id 
ON orders(Wave_payment_id);

-- =====================================================
-- ÉTAPE 3 : Ajouter les commentaires de documentation
-- =====================================================

-- Documentation des colonnes
COMMENT ON COLUMN orders.wave_payment_id 
IS 'ID unique du paiement Wave CI - Format: wave_TIMESTAMP_RANDOMSTRING';

COMMENT ON COLUMN orders.wave_payment_url 
IS 'URL de paiement Wave CI générée dynamiquement - Format: https://pay.wave.com/m/{merchant_id}/c/{country}/?amount={amount}';

COMMENT ON COLUMN orders.Wave_payment_id 
IS 'DEPRECATED - ID du paiement Wave (en cours de migration vers Wave CI)';

COMMENT ON COLUMN orders.Wave_payment_url 
IS 'DEPRECATED - URL du paiement Wave (en cours de migration vers Wave CI)';

-- =====================================================
-- ÉTAPE 4 : Vérification de la migration
-- =====================================================

-- Afficher toutes les colonnes liées aux paiements
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND (column_name LIKE '%payment%' OR column_name LIKE '%wave%' OR column_name LIKE '%Wave%')
ORDER BY ordinal_position;

-- Compter les enregistrements
SELECT 
    COUNT(*) as total_orders,
    COUNT(wave_payment_id) as with_wave_payment,
    COUNT(Wave_payment_id) as with_Wave_payment
FROM orders;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================
/*
✅ Migration réussie si :
   - 4 nouvelles colonnes ajoutées (wave_payment_id, wave_payment_url, Wave_payment_id, Wave_payment_url)
   - 2 index créés
   - Aucune erreur lors de l'exécution
   
⚠️ Cette migration est idempotente (peut être exécutée plusieurs fois sans erreur)
   grâce aux clauses IF NOT EXISTS

📝 Prochaines étapes :
   1. Vérifier les résultats de la requête SELECT ci-dessus
   2. Tester la création d'une commande avec Wave CI
   3. Redémarrer l'application Next.js
   
🗑️ Nettoyage futur :
   - Les colonnes Wave_* pourront être supprimées après migration complète
   - Prévoir une date de suppression (ex: 3-6 mois après mise en production Wave CI)
*/
