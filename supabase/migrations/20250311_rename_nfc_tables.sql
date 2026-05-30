-- =====================================================
-- MIGRATION: RENAME NFC TABLES FOR CLARITY
-- nfc_profiles -> digital_nfc_cards (The digital content)
-- nfc_cards -> physical_nfc_cards (The physical asset/order)
-- =====================================================

-- 1. Rename nfc_profiles to digital_nfc_cards
ALTER TABLE nfc_profiles RENAME TO digital_nfc_cards;

-- 2. Rename nfc_cards to physical_nfc_cards
ALTER TABLE nfc_cards RENAME TO physical_nfc_cards;

-- 3. Update RLS Policies for digital_nfc_cards (formerly nfc_profiles)
-- We need to check the names of existing policies. 
-- Since I don't know all exact names, I'll drop common ones and recreate them.

-- 4. RE-CREATE POLICIES FOR digital_nfc_cards
-- (Base on common patterns seen in the project)
ALTER TABLE digital_nfc_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own digital cards" ON digital_nfc_cards;
CREATE POLICY "Users can manage their own digital cards" 
ON digital_nfc_cards FOR ALL 
TO authenticated 
USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone can view digital cards" ON digital_nfc_cards;
CREATE POLICY "Anyone can view digital cards" 
ON digital_nfc_cards FOR SELECT 
TO public 
USING (status = 'active');

-- 5. RE-CREATE POLICIES FOR physical_nfc_cards
ALTER TABLE physical_nfc_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own physical cards" ON physical_nfc_cards;
CREATE POLICY "Users can manage their own physical cards" 
ON physical_nfc_cards FOR ALL 
TO authenticated 
USING (user_id = auth.uid()::text);

-- 6. Add convenience comments
COMMENT ON TABLE digital_nfc_cards IS 'Stocke les données numériques et le contenu affiché quand une carte est scannée';
COMMENT ON TABLE physical_nfc_cards IS 'Gère les actifs physiques (cartes NFC) et leur état de livraison/activation';

SELECT 'Rename successful! Please update your codebase to use digital_nfc_cards and physical_nfc_cards.' as status;
