-- =====================================================
-- CORRECTION : Ajout de la contrainte NOT NULL sur profile_id
-- =====================================================

-- 1. D'abord, vérifier s'il y a des commandes sans profile_id
SELECT 
    COUNT(*) as orders_without_profile_id
FROM orders 
WHERE profile_id IS NULL;

-- 2. Si des commandes existent sans profile_id, les mettre à jour avec un profil par défaut
-- (Cette partie doit être adaptée selon votre logique métier)
DO $$
DECLARE
    default_profile_id UUID;
BEGIN
    -- Trouver le premier profil de l'utilisateur pour chaque commande sans profile_id
    UPDATE orders 
    SET profile_id = (
        SELECT p.id 
        FROM profiles p 
        WHERE p.user_id = orders.user_id 
        ORDER BY p.created_at ASC 
        LIMIT 1
    )
    WHERE profile_id IS NULL;
    
    -- Vérifier s'il reste des commandes sans profile_id
    IF EXISTS (SELECT 1 FROM orders WHERE profile_id IS NULL) THEN
        RAISE NOTICE 'ATTENTION: Il reste des commandes sans profile_id. Vérifiez la logique métier.';
    ELSE
        RAISE NOTICE 'SUCCÈS: Toutes les commandes ont maintenant un profile_id.';
    END IF;
END $$;

-- 3. Ajouter la contrainte NOT NULL maintenant que toutes les données sont corrigées
ALTER TABLE orders 
ALTER COLUMN profile_id SET NOT NULL;

-- 4. Vérifier la contrainte
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'profile_id'
AND table_schema = 'public';

-- 5. Tester l'insertion d'une nouvelle commande avec profile_id
-- (Cette partie peut être commentée en production)
/*
INSERT INTO orders (
    user_id, 
    order_number, 
    status, 
    quantity, 
    unit_price, 
    total_amount, 
    currency, 
    payment_method, 
    shipping_address,
    profile_id
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- user_id de test
    'TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'pending',
    1,
    15.00,
    15.00,
    'USD',
    'Wave',
    '{"name": "Test User", "email": "test@example.com"}',
    '00000000-0000-0000-0000-000000000000'  -- profile_id de test
);
*/
