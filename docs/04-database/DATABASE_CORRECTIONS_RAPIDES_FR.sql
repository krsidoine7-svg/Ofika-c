-- =====================================================
-- CORRECTIONS RAPIDES BASE DE DONNÉES
-- Appliquer ces corrections pour résoudre les problèmes identifiés
-- =====================================================

-- =====================================================
-- PRIORITÉ 1 : Supprimer colonne redondante
-- =====================================================

-- Supprimer la colonne 'position' redondante de la table links
-- (order_index existe déjà et est utilisé)
ALTER TABLE links DROP COLUMN IF EXISTS position;

COMMENT ON COLUMN links.order_index IS 'Ordre d''affichage du lien dans le profil (index base 0)';

-- =====================================================
-- PRIORITÉ 2 : Ajouter les index manquants
-- =====================================================

-- Index pour filtrer les profils par template de design
CREATE INDEX IF NOT EXISTS idx_profiles_design_choice 
ON profiles(design_choice) 
WHERE design_choice IS NOT NULL;

-- Index pour filtrer les commandes par statut de paiement
CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
ON orders(payment_status);

-- Index pour filtrer les cartes NFC par type
CREATE INDEX IF NOT EXISTS idx_nfc_cards_card_type 
ON nfc_cards(card_type) 
WHERE card_type IS NOT NULL;

-- Index composite pour patron de requête courant
CREATE INDEX IF NOT EXISTS idx_profiles_user_active 
ON profiles(user_id, is_active);

-- =====================================================
-- PRIORITÉ 3 : Ajouter fonctions de validation JSONB
-- =====================================================

-- Fonction de validation pour profiles.custom_links
CREATE OR REPLACE FUNCTION validate_custom_links(links JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Doit être un tableau
  IF jsonb_typeof(links) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Chaque élément doit avoir 'title' et 'url'
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(links) AS link
    WHERE NOT (link ? 'title' AND link ? 'url')
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction de validation pour orders.shipping_address
CREATE OR REPLACE FUNCTION validate_shipping_address(address JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Doit être un objet
  IF jsonb_typeof(address) != 'object' THEN
    RETURN FALSE;
  END IF;
  
  -- Doit avoir les champs requis
  IF NOT (
    address ? 'name' AND
    address ? 'address_line1' AND
    address ? 'city' AND
    address ? 'postal_code' AND
    address ? 'country'
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction de validation pour card_designs.front_design et back_design
CREATE OR REPLACE FUNCTION validate_card_design(design JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Doit être un objet
  IF jsonb_typeof(design) != 'object' THEN
    RETURN FALSE;
  END IF;
  
  -- Doit avoir background_color et text_color
  IF NOT (design ? 'background_color' AND design ? 'text_color') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PRIORITÉ 4 : Ajouter contraintes CHECK
-- =====================================================

-- Ajouter validation pour profiles.custom_links
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS valid_custom_links_structure;

ALTER TABLE profiles 
ADD CONSTRAINT valid_custom_links_structure 
CHECK (validate_custom_links(custom_links));

-- Ajouter validation pour orders.shipping_address
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS valid_shipping_address_structure;

ALTER TABLE orders 
ADD CONSTRAINT valid_shipping_address_structure 
CHECK (validate_shipping_address(shipping_address));

-- Ajouter validation pour card_designs
ALTER TABLE card_designs 
DROP CONSTRAINT IF EXISTS valid_front_design_structure;

ALTER TABLE card_designs 
ADD CONSTRAINT valid_front_design_structure 
CHECK (validate_card_design(front_design));

ALTER TABLE card_designs 
DROP CONSTRAINT IF EXISTS valid_back_design_structure;

ALTER TABLE card_designs 
ADD CONSTRAINT valid_back_design_structure 
CHECK (validate_card_design(back_design));

-- =====================================================
-- PRIORITÉ 5 : Ajouter commentaires documentation
-- =====================================================

-- Commentaires sur les tables
COMMENT ON TABLE users IS 'Comptes utilisateurs avec authentification, abonnement et gestion des profils';
COMMENT ON TABLE profiles IS 'Profils utilisateurs (plusieurs par utilisateur) : types professionnel, personnel ou événement';
COMMENT ON TABLE links IS 'Liens personnalisés attachés aux profils avec suivi analytique des clics';
COMMENT ON TABLE cards IS 'Cartes de visite NFC physiques et virtuelles liant utilisateurs aux profils';
COMMENT ON TABLE card_designs IS 'Configuration du design visuel des cartes de visite (recto et verso)';
COMMENT ON TABLE orders IS 'Commandes utilisateurs pour cartes NFC physiques avec suivi expédition et paiement';
COMMENT ON TABLE payment_methods IS 'Méthodes de paiement enregistrées pour les comptes utilisateurs (carte, mobile money, PayPal)';
COMMENT ON TABLE analytics_events IS 'Suivi d''événements pour vues de profil, clics de liens et interactions';
COMMENT ON TABLE dashboard_widgets IS 'Configuration des widgets du tableau de bord utilisateur avec positionnement en grille';
COMMENT ON TABLE qr_redirects IS 'Système de redirection QR code dynamique avec analytiques';
COMMENT ON TABLE qr_scans IS 'Analytiques détaillées des scans de QR codes avec données appareil et localisation';
COMMENT ON TABLE template_schemas IS 'Définitions de templates dynamiques avec schémas de champs personnalisés (8 préconfigurations)';
COMMENT ON TABLE profile_template_data IS 'Valeurs de champs de template spécifiques au profil (relation 1:1 avec profiles)';
COMMENT ON TABLE nfc_profiles IS 'Configurations de profils spécifiques NFC avec liens réseaux sociaux';
COMMENT ON TABLE nfc_cards IS 'Inventaire des cartes NFC physiques avec suivi production et livraison';

-- Commentaires sur colonnes JSONB clés
COMMENT ON COLUMN profiles.custom_links IS 'Tableau de liens personnalisés : [{title: string, url: string, icon?: string}]';
COMMENT ON COLUMN orders.shipping_address IS 'Adresse de livraison : {name, address_line1, address_line2?, city, postal_code, country, phone}';
COMMENT ON COLUMN card_designs.front_design IS 'Config design carte recto : {background_color, text_color, logo_url?, elements: [{type, value?, style?, position?}]}';
COMMENT ON COLUMN card_designs.back_design IS 'Config design carte verso : {background_color, text_color, logo_url?, elements: [{type, value?, style?, position?}]}';
COMMENT ON COLUMN template_schemas.schema IS 'Définitions de champs template : {fields: [{name, type, label, placeholder?, required?, max?, options?}]}';
COMMENT ON COLUMN profile_template_data.fields IS 'Valeurs de champs template : {[nomChamp]: valeur, ...}';

-- =====================================================
-- OPTIONNEL : Standardiser types VARCHAR dans système QR
-- =====================================================

-- Note : Ces changements nécessitent des tests minutieux car ils peuvent
-- affecter les données existantes. Exécuter d'abord en staging.

-- qr_redirects : standardiser colonnes text
-- ALTER TABLE qr_redirects ALTER COLUMN short_code TYPE VARCHAR(20);
-- ALTER TABLE qr_redirects ALTER COLUMN redirect_type TYPE VARCHAR(50);
-- ALTER TABLE qr_redirects ALTER COLUMN title TYPE VARCHAR(200);

-- qr_scans : standardiser colonnes text
-- ALTER TABLE qr_scans ALTER COLUMN device_type TYPE VARCHAR(20);
-- ALTER TABLE qr_scans ALTER COLUMN os TYPE VARCHAR(50);
-- ALTER TABLE qr_scans ALTER COLUMN browser TYPE VARCHAR(50);
-- ALTER TABLE qr_scans ALTER COLUMN ip_address TYPE VARCHAR(45);
-- ALTER TABLE qr_scans ALTER COLUMN country TYPE VARCHAR(2);
-- ALTER TABLE qr_scans ALTER COLUMN city TYPE VARCHAR(100);
-- ALTER TABLE qr_scans ALTER COLUMN referrer TYPE VARCHAR(500);

-- =====================================================
-- REQUÊTES DE VÉRIFICATION
-- =====================================================

-- Vérifier que la colonne redondante est supprimée
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'links' 
AND column_name IN ('position', 'order_index');

-- Vérifier que les nouveaux index sont créés
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('profiles', 'orders', 'nfc_cards')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Vérifier que les fonctions de validation existent
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE 'validate_%'
ORDER BY proname;

-- Vérifier que les contraintes CHECK sont ajoutées
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE contype = 'c'
AND conname LIKE 'valid_%'
ORDER BY conname;

-- Vérifier les commentaires des tables
SELECT tablename, obj_description(oid)
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'profiles', 'links', 'cards', 'card_designs',
  'orders', 'payment_methods', 'analytics_events', 
  'dashboard_widgets', 'qr_redirects', 'qr_scans',
  'template_schemas', 'profile_template_data',
  'nfc_profiles', 'nfc_cards'
)
ORDER BY tablename;

-- =====================================================
-- SCRIPT DE ROLLBACK (Si nécessaire)
-- =====================================================

-- Décommenter pour annuler les changements

-- Ré-ajouter colonne position
-- ALTER TABLE links ADD COLUMN position INTEGER DEFAULT 0;

-- Supprimer nouveaux index
-- DROP INDEX IF EXISTS idx_profiles_design_choice;
-- DROP INDEX IF EXISTS idx_orders_payment_status;
-- DROP INDEX IF EXISTS idx_nfc_cards_card_type;
-- DROP INDEX IF EXISTS idx_profiles_user_active;

-- Supprimer fonctions de validation
-- DROP FUNCTION IF EXISTS validate_custom_links(JSONB);
-- DROP FUNCTION IF EXISTS validate_shipping_address(JSONB);
-- DROP FUNCTION IF EXISTS validate_card_design(JSONB);

-- Supprimer contraintes CHECK
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_custom_links_structure;
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_shipping_address_structure;
-- ALTER TABLE card_designs DROP CONSTRAINT IF EXISTS valid_front_design_structure;
-- ALTER TABLE card_designs DROP CONSTRAINT IF EXISTS valid_back_design_structure;

-- =====================================================
-- FIN DES CORRECTIONS RAPIDES
-- =====================================================

-- Exécuter ce script avec :
-- psql -U postgres -d votre_base -f DATABASE_CORRECTIONS_RAPIDES_FR.sql
--
-- Ou dans Supabase Dashboard :
-- 1. Aller dans SQL Editor
-- 2. Copier et coller tout ce fichier
-- 3. Exécuter la requête
-- 4. Vérifier les résultats avec requêtes de vérification à la fin
