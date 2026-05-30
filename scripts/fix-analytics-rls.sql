-- =====================================================
-- SCRIPT DE FIX (V2) POUR ANALYTICS_EVENTS ET RLS
-- =====================================================

-- 1. Assurer que la table existe avec les bonnes colonnes
-- Note: nous utilisons TEXT pour les IDs de profils car votre projet utilise TEXT pour les IDs d'utilisateurs et profils
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    user_agent TEXT,
    device_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index pour la performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id ON public.analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- 3. Activer RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les anciennes politiques si elles existent pour éviter les duplicatas
DROP POLICY IF EXISTS "Public can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view own profile analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;

-- 5. Créer les nouvelles politiques robustes avec casting TEXT pour les IDs UUID
-- Politique : Tout le monde peut insérer des analytics (essentiel pour les visiteurs anonymes)
CREATE POLICY "Public can insert analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- Politique : Les utilisateurs peuvent voir les analytics de leurs propres profils
CREATE POLICY "Users can view own profile analytics" ON public.analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = analytics_events.profile_id 
            AND profiles.user_id = auth.uid()::text
        )
    );

-- Politique : Les admins peuvent tout voir
CREATE POLICY "Admins can view all analytics" ON public.analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id::text = auth.uid()::text
        )
        OR 
        (SELECT role FROM public.users WHERE id::text = auth.uid()::text) = 'admin'
    );
