-- ========================================
-- VÉRIFICATION: Contrôler que la colonne card_type existe
-- ========================================

-- Vérifier si la colonne card_type existe dans la table orders
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'card_type';

-- Si la colonne existe, cette requête retournera une ligne
-- Sinon, elle ne retournera rien

-- Test d'insertion pour vérifier que la colonne fonctionne
-- (Cette ligne sera commentée pour éviter l'insertion)
/*
INSERT INTO orders (
    user_id,
    order_number,
    quantity,
    unit_price,
    total_amount,
    currency,
    payment_method,
    payment_status,
    shipping_address,
    card_type
) VALUES (
    'test-user-id',
    'TEST-ORDER-123',
    1,
    100.00,
    100.00,
    'XOF',
    'lygos',
    'pending',
    '{"name": "Test User", "address": "Test Address", "city": "Test City"}'::jsonb,
    'nfc_qr'
);
*/
