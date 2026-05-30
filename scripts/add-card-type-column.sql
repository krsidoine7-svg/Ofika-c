-- ========================================
-- MIGRATION: Ajouter la colonne card_type à la table orders
-- ========================================
-- Cette migration ajoute la colonne card_type manquante dans la table orders
-- pour supporter les différents types de cartes (nfc_qr, qr_only, etc.)

-- Ajouter la colonne card_type si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'card_type'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "card_type" VARCHAR(50);
        RAISE NOTICE 'Colonne card_type ajoutée avec succès à la table orders';
    ELSE
        RAISE NOTICE 'Colonne card_type existe déjà dans la table orders';
    END IF;
END $$;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN "orders"."card_type" IS 'Type de carte commandée (nfc_qr, qr_only, premium_subscription, custom)';

-- Vérifier que la colonne a été ajoutée
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'card_type'
    ) THEN
        RAISE NOTICE '✅ Migration réussie: colonne card_type présente dans orders';
    ELSE
        RAISE EXCEPTION '❌ Migration échouée: colonne card_type manquante dans orders';
    END IF;
END $$;
