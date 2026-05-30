-- =====================================================
-- SCRIPT DE CONFIGURATION NFC DATABASE
-- =====================================================

-- Ce script doit être exécuté dans l'éditeur SQL de Supabase
-- ou via la CLI Supabase

-- 1. Créer la table nfc_profiles
CREATE TABLE IF NOT EXISTS public.nfc_profiles (
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
    tracking_number VARCHAR(100)
);

-- 2. Créer les index
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_user_id ON public.nfc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_profile_id ON public.nfc_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_status ON public.nfc_profiles(status);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_created_at ON public.nfc_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_user_status ON public.nfc_profiles(user_id, status);

-- 3. Créer la fonction de trigger
CREATE OR REPLACE FUNCTION update_nfc_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger
CREATE TRIGGER trigger_update_nfc_profiles_updated_at
    BEFORE UPDATE ON public.nfc_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_nfc_profiles_updated_at();

-- 5. Activer RLS
ALTER TABLE public.nfc_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS
CREATE POLICY "Users can view their own NFC cards" ON public.nfc_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own NFC cards" ON public.nfc_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFC cards" ON public.nfc_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own NFC cards" ON public.nfc_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que la table a été créée
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'nfc_profiles' 
ORDER BY ordinal_position;

-- Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'nfc_profiles';
