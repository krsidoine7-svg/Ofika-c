-- =====================================================
-- SCRIPT NFC DATABASE - ADAPTÉ POUR TEXT IDs
-- =====================================================

-- Ce script s'adapte à votre structure existante avec TEXT IDs

-- =====================================================
-- 1. SUPPRESSION DE L'ANCIENNE TABLE
-- =====================================================

DROP TABLE IF EXISTS public.nfc_profiles CASCADE;

-- =====================================================
-- 2. CRÉATION DE LA TABLE NFC_PROFILES (AVEC TEXT IDs)
-- =====================================================

CREATE TABLE public.nfc_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    profile_name VARCHAR(255) NOT NULL,
    nfc_link TEXT NOT NULL,
    qr_code_url TEXT,
    design_choice VARCHAR(100) NOT NULL DEFAULT 'classic',
    color_theme VARCHAR(50) NOT NULL DEFAULT 'black',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'shipped', 'delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    tracking_number VARCHAR(100),
    
    -- Contraintes
    CONSTRAINT nfc_profiles_user_id_check CHECK (user_id IS NOT NULL),
    CONSTRAINT nfc_profiles_profile_name_check CHECK (LENGTH(profile_name) > 0),
    CONSTRAINT nfc_profiles_nfc_link_check CHECK (LENGTH(nfc_link) > 0)
);

-- =====================================================
-- 3. CRÉATION DES INDEX
-- =====================================================

CREATE INDEX idx_nfc_profiles_user_id ON public.nfc_profiles(user_id);
CREATE INDEX idx_nfc_profiles_profile_id ON public.nfc_profiles(profile_id);
CREATE INDEX idx_nfc_profiles_status ON public.nfc_profiles(status);
CREATE INDEX idx_nfc_profiles_created_at ON public.nfc_profiles(created_at);
CREATE INDEX idx_nfc_profiles_user_status ON public.nfc_profiles(user_id, status);

-- =====================================================
-- 4. FONCTION ET TRIGGER POUR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_nfc_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_nfc_profiles_updated_at
    BEFORE UPDATE ON public.nfc_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_nfc_profiles_updated_at();

-- =====================================================
-- 5. ACTIVATION DE RLS
-- =====================================================

ALTER TABLE public.nfc_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CRÉATION DES POLITIQUES RLS
-- =====================================================

CREATE POLICY "Users can view their own NFC cards" ON public.nfc_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own NFC cards" ON public.nfc_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own NFC cards" ON public.nfc_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own NFC cards" ON public.nfc_profiles
    FOR DELETE USING (auth.uid()::text = user_id);

-- =====================================================
-- 7. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que la table a été créée correctement
SELECT 
    'nfc_profiles table created successfully' as result,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'nfc_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les politiques RLS
SELECT 
    'RLS policies created successfully' as result,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'nfc_profiles'
AND schemaname = 'public';

-- Vérifier les index
SELECT 
    'Indexes created successfully' as result,
    indexname
FROM pg_indexes 
WHERE tablename = 'nfc_profiles'
AND schemaname = 'public';

-- =====================================================
-- 8. TEST DE CONNEXION (OPTIONNEL)
-- =====================================================

-- Test simple pour vérifier que tout fonctionne
SELECT 
    'Database setup completed successfully!' as status,
    NOW() as timestamp;
