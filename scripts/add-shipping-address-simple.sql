-- =====================================================
-- AJOUT SIMPLE DE LA COLONNE SHIPPING_ADDRESS
-- =====================================================

-- Ajouter la colonne shipping_address de type JSONB
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- Vérifier que la colonne a été ajoutée
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'shipping_address';
