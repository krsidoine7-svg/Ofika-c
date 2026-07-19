-- Migration: Correction des politiques RLS manquantes (Linter Fix)
-- Date: 2026-07-19

-- 1. Nettoyage et application RLS pour captured_contacts
ALTER TABLE public.captured_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert contacts" ON public.captured_contacts;
DROP POLICY IF EXISTS "Users can view their own profile contacts" ON public.captured_contacts;
DROP POLICY IF EXISTS "Users can delete their own profile contacts" ON public.captured_contacts;
DROP POLICY IF EXISTS "captured_contacts_admin_all" ON public.captured_contacts;

-- Insertion pour tout le monde si le profil existe
CREATE POLICY "Public can insert contacts" ON public.captured_contacts
    FOR INSERT TO public
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = captured_contacts.profile_id)
    );

-- Sélection restreinte à l'utilisateur connecté via son profil
CREATE POLICY "Users can view their own profile contacts" ON public.captured_contacts
    FOR SELECT TO authenticated
    USING (
        profile_id::text IN (
            SELECT id::text FROM public.profiles WHERE user_id::uuid = auth.uid()
        )
    );

-- Suppression restreinte au propriétaire du profil
CREATE POLICY "Users can delete their own profile contacts" ON public.captured_contacts
    FOR DELETE TO authenticated
    USING (
        profile_id::text IN (
            SELECT id::text FROM public.profiles WHERE user_id::uuid = auth.uid()
        )
    );

-- Accès admin total
CREATE POLICY "captured_contacts_admin_all" ON public.captured_contacts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid()::text 
            AND users.subscription_tier = 'admin'
        )
    );


-- 2. Nettoyage et application RLS pour template_schemas
ALTER TABLE public.template_schemas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active templates" ON public.template_schemas;
DROP POLICY IF EXISTS "Only admins can manage templates" ON public.template_schemas;

-- Lecture publique des templates actifs
CREATE POLICY "Anyone can read active templates" ON public.template_schemas
    FOR SELECT TO public
    USING (is_active = true);

-- Gestion complète réservée aux administrateurs
CREATE POLICY "Only admins can manage templates" ON public.template_schemas
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid()::text 
            AND users.subscription_tier = 'admin'
        )
    );
