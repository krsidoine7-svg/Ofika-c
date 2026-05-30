-- =====================================================
-- CORRECTION FINALE : Ajout de la contrainte NOT NULL sur profile_id
-- =====================================================

-- 1. Vérifier l'état actuel de la colonne profile_id
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'profile_id'
AND table_schema = 'public';

-- 2. Vérifier s'il y a des commandes sans profile_id
SELECT 
    COUNT(*) as orders_without_profile_id,
    COUNT(*) FILTER (WHERE profile_id IS NULL) as null_profile_ids
FROM orders;

-- 3. Si des commandes existent sans profile_id, les mettre à jour
UPDATE orders 
SET profile_id = (
    SELECT p.id 
    FROM profiles p 
    WHERE p.user_id = orders.user_id 
    ORDER BY p.created_at ASC 
    LIMIT 1
)
WHERE profile_id IS NULL;

-- 4. Vérifier qu'il n'y a plus de commandes sans profile_id
SELECT 
    COUNT(*) as orders_without_profile_id
FROM orders 
WHERE profile_id IS NULL;

-- 5. Ajouter la contrainte NOT NULL
ALTER TABLE orders 
ALTER COLUMN profile_id SET NOT NULL;

-- 6. Vérifier que la contrainte a été ajoutée
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'profile_id'
AND table_schema = 'public';

-- 7. Créer l'index pour les performances (si pas déjà créé)
CREATE INDEX IF NOT EXISTS idx_orders_profile_id 
ON orders (profile_id);

-- 8. Vérifier l'index
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'orders' 
AND indexname = 'idx_orders_profile_id';

-- 9. Test final : essayer d'insérer une commande sans profile_id (doit échouer)
-- Cette ligne doit générer une erreur si la contrainte fonctionne
-- INSERT INTO orders (user_id, order_number, status, quantity, unit_price, total_amount, currency, payment_method, shipping_address) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'TEST-NULL-PROFILE', 'pending', 1, 15.00, 15.00, 'USD', 'lygos', '{"name": "Test"}');

-- 10. Test réussi : insérer une commande avec profile_id (doit fonctionner)
-- Cette ligne doit fonctionner si tout est correct
-- INSERT INTO orders (user_id, profile_id, order_number, status, quantity, unit_price, total_amount, currency, payment_method, shipping_address) 
-- VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'TEST-WITH-PROFILE', 'pending', 1, 15.00, 15.00, 'USD', 'lygos', '{"name": "Test"}');
