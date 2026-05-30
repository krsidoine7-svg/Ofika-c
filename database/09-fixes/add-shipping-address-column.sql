-- =====================================================
-- MIGRATION : Ajout de la colonne shipping_address
-- =====================================================

-- Ajouter la colonne shipping_address à la table orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- Ajouter un commentaire pour documenter la structure
COMMENT ON COLUMN orders.shipping_address IS 'Adresse de livraison au format JSON: {name, email, phone, address, city, postalCode}';

-- Créer un index pour les requêtes sur les adresses
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address 
ON orders USING GIN (shipping_address);

-- Ajouter une contrainte de validation pour s'assurer que les champs requis sont présents
ALTER TABLE orders 
ADD CONSTRAINT check_shipping_address_structure 
CHECK (
  shipping_address IS NULL OR (
    shipping_address ? 'name' AND 
    shipping_address ? 'email' AND
    jsonb_typeof(shipping_address->'name') = 'string' AND
    jsonb_typeof(shipping_address->'email') = 'string'
  )
);