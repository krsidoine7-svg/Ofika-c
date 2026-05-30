-- =====================================================
-- MIGRATION : Ajout de la colonne profile_id à la table orders
-- =====================================================

-- Ajouter la colonne profile_id à la table orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Ajouter un commentaire pour documenter la structure
COMMENT ON COLUMN orders.profile_id IS 'Référence vers le profil NFC associé à cette commande';

-- Créer un index pour les requêtes sur profile_id
CREATE INDEX IF NOT EXISTS idx_orders_profile_id 
ON orders (profile_id);

-- Ajouter une contrainte pour s'assurer que profile_id est fourni lors de la création
-- Note: On ne met pas NOT NULL directement car il peut y avoir des commandes existantes sans profile_id
-- La contrainte sera ajoutée après migration des données existantes

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
