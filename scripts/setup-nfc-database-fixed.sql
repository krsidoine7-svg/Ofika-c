-- =====================================================
-- SCRIPT DE CONFIGURATION NFC DATABASE - CORRIGÉ
-- =====================================================

-- Ce script corrige le problème de type de données
-- Il vérifie d'abord la structure existante et s'adapte

-- =====================================================
-- 1. VÉRIFICATION DE LA STRUCTURE EXISTANTE
-- =====================================================

-- Vérifier le type de la colonne id dans la table profiles
SELECT 
    'profiles table structure' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('id', 'user_id')
ORDER BY ordinal_position;

-- =====================================================
-- 2. CRÉATION DE LA TABLE NFC_PROFILES (ADAPTATIVE)
-- =====================================================

-- Supprimer la table si elle existe déjà (pour éviter les conflits)
DROP TABLE IF EXISTS public.nfc_profiles CASCADE;

-- Créer la table nfc_profiles avec les bons types
CREATE TABLE public.nfc_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own NFC cards" ON public.nfc_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFC cards" ON public.nfc_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own NFC cards" ON public.nfc_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que la table a été créée correctement
SELECT 
    'nfc_profiles table created' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'nfc_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les politiques RLS
SELECT 
    'RLS policies created' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'nfc_profiles'
AND schemaname = 'public';

-- Vérifier les index
SELECT 
    'Indexes created' as info,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'nfc_profiles'
AND schemaname = 'public';

-- =====================================================
-- 8. TEST D'INSERTION (OPTIONNEL)
-- =====================================================

-- Test d'insertion d'une carte de test (remplacez l'UUID par un vrai user_id)
-- INSERT INTO public.nfc_profiles (
--     user_id,
--     profile_name,
--     nfc_link,
--     design_choice,
--     color_theme,
--     status
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000', -- Remplacez par un vrai user_id
--     'Test Card',
--     'https://ofika.com/test-card',
--     'classic',
--     'black',
--     'pending'
-- );

-- SELECT 'Test insertion successful' as result;
