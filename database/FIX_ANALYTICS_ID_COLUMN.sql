-- =====================================================
-- 🔧 FIX: Colonne ID avec valeur par défaut
-- =====================================================
-- Erreur: "null value in column "id" violates not-null constraint"
-- Solution: Ajouter gen_random_uuid() comme valeur par défaut

-- ✅ Ajouter la valeur par défaut pour la colonne id
ALTER TABLE analytics_events 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ✅ Vérifier la structure
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'analytics_events'
AND column_name = 'id';

-- ✅ Résultat attendu:
-- column_name | data_type | column_default    | is_nullable
-- ------------|-----------|-------------------|------------
-- id          | uuid      | gen_random_uuid() | NO
