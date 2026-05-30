-- =====================================================
-- SCRIPT DE CRÉATION CONTACT_ANALYTICS - ADAPTÉ POUR TEXT IDs
-- =====================================================

-- Ce script s'adapte à votre structure existante avec TEXT IDs

-- =====================================================
-- 1. SUPPRESSION DE L'ANCIENNE TABLE
-- =====================================================

DROP TABLE IF EXISTS public.contact_analytics CASCADE;

-- =====================================================
-- 2. CRÉATION DE LA TABLE CONTACT_ANALYTICS (AVEC TEXT IDs)
-- =====================================================

CREATE TABLE public.contact_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_agent TEXT,
    device_type VARCHAR(20),
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('vcard_generated', 'vcard_downloaded', 'vcard_shared')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CRÉATION DES INDEX
-- =====================================================

CREATE INDEX idx_contact_analytics_profile_id ON public.contact_analytics(profile_id);
CREATE INDEX idx_contact_analytics_action_type ON public.contact_analytics(action_type);
CREATE INDEX idx_contact_analytics_created_at ON public.contact_analytics(created_at);
CREATE INDEX idx_contact_analytics_device_type ON public.contact_analytics(device_type);

-- =====================================================
-- 4. FONCTION ET TRIGGER POUR UPDATED_AT (si nécessaire)
-- =====================================================

-- Pas de colonne updated_at pour les analytics (données immuables)

-- =====================================================
-- 5. ACTIVATION DE RLS
-- =====================================================

ALTER TABLE public.contact_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CRÉATION DES POLITIQUES RLS
-- =====================================================

-- Politique : Tout le monde peut insérer des analytics (pour les visiteurs)
CREATE POLICY "Public can insert contact analytics" ON public.contact_analytics
    FOR INSERT WITH CHECK (true);

-- Politique : Les utilisateurs peuvent voir les analytics de leurs propres profils
CREATE POLICY "Users can view own profile analytics" ON public.contact_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = contact_analytics.profile_id 
            AND profiles.user_id = auth.uid()::text
        )
    );

-- =====================================================
-- 7. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que la table a été créée correctement
SELECT 
    'contact_analytics table created successfully' as result,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'contact_analytics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les politiques RLS
SELECT 
    'RLS policies created successfully' as result,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'contact_analytics'
AND schemaname = 'public';

-- Vérifier les index
SELECT 
    'Indexes created successfully' as result,
    indexname
FROM pg_indexes 
WHERE tablename = 'contact_analytics'
AND schemaname = 'public';

-- =====================================================
-- 8. TEST D'INSERTION (OPTIONNEL)
-- =====================================================

-- Test d'insertion d'un analytics de test
-- INSERT INTO public.contact_analytics (
--     profile_id,
--     user_agent,
--     device_type,
--     action_type
-- ) VALUES (
--     'test-profile-id', -- Remplacez par un vrai profile_id
--     'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
--     'mobile',
--     'vcard_generated'
-- );

-- SELECT 'Test insertion successful' as result;
