-- Migration sécurisée pour ajouter les colonnes LyGOS si elles n'existent pas
-- Cette migration ne supprime aucune donnée existante

-- Ajouter la colonne lygos_payment_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'lygos_payment_id'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "lygos_payment_id" text;
        RAISE NOTICE 'Colonne lygos_payment_id ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne lygos_payment_id existe déjà';
    END IF;
END $$;

-- Ajouter la colonne lygos_payment_url si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'lygos_payment_url'
    ) THEN
        ALTER TABLE "orders" ADD COLUMN "lygos_payment_url" text;
        RAISE NOTICE 'Colonne lygos_payment_url ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne lygos_payment_url existe déjà';
    END IF;
END $$;

-- Créer un index pour optimiser les recherches par payment_id s'il n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'orders' 
        AND indexname = 'orders_lygos_payment_id_idx'
    ) THEN
        CREATE INDEX "orders_lygos_payment_id_idx" ON "orders"("lygos_payment_id");
        RAISE NOTICE 'Index orders_lygos_payment_id_idx créé avec succès';
    ELSE
        RAISE NOTICE 'Index orders_lygos_payment_id_idx existe déjà';
    END IF;
END $$;

-- Commentaires pour documentation
COMMENT ON COLUMN "orders"."lygos_payment_id" IS 'ID du paiement LyGOS pour tracking';
COMMENT ON COLUMN "orders"."lygos_payment_url" IS 'URL de redirection vers la page de paiement LyGOS';
