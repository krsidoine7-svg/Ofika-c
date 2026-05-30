-- =====================================================
-- MIGRATION : Correction des cartes NFC sans profile_id
-- =====================================================

-- 1. Vérifier les cartes NFC sans profile_id
SELECT 
    COUNT(*) as nfc_cards_without_profile_id
FROM nfc_profiles 
WHERE profile_id IS NULL OR profile_id = '';

-- 2. Mettre à jour les cartes NFC sans profile_id
-- Nous allons lier ces cartes au premier profil de l'utilisateur
UPDATE nfc_profiles 
SET profile_id = (
    SELECT p.id 
    FROM profiles p 
    WHERE p.user_id = nfc_profiles.user_id 
    ORDER BY p.created_at ASC 
    LIMIT 1
)
WHERE profile_id IS NULL OR profile_id = '';

-- 3. Vérifier qu'il n'y a plus de cartes sans profile_id
SELECT 
    COUNT(*) as remaining_nfc_cards_without_profile_id
FROM nfc_profiles 
WHERE profile_id IS NULL OR profile_id = '';

-- 4. Ajouter la contrainte NOT NULL sur profile_id
ALTER TABLE nfc_profiles 
ALTER COLUMN profile_id SET NOT NULL;

-- 5. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_profile_id 
ON nfc_profiles (profile_id);

-- 6. Ajouter un commentaire pour la documentation
COMMENT ON COLUMN nfc_profiles.profile_id IS 'Référence au profil associé à cette carte NFC (obligatoire après cette migration).';
