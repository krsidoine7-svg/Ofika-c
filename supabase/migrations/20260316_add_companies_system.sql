-- =====================================================
-- MIGRATION: Gestion Multi-Entreprises (Dashboard Corporate)
-- Date: 2026-03-16
-- =====================================================

-- 1. Table des Entreprises
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    website TEXT,
    description TEXT,
    industry TEXT,
    size_range TEXT, -- '1-10', '11-50', '51-200', '201-500', '500+'
    contact_email TEXT,
    contact_phone TEXT,
    billing_address JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Relation Utilisateur <> Entreprise
-- Permet de rattacher des employés à une entreprise
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- 3. Relation Profil <> Entreprise
-- Permet de forcer un design d'entreprise sur certains profils
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT false;

-- 4. Sécurité RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir les infos de leur propre entreprise
CREATE POLICY "Users can view their own company"
ON public.companies
FOR SELECT
TO authenticated
USING (
    id IN (SELECT company_id FROM public.users WHERE users.id = auth.uid())
);

-- Les admins peuvent tout faire
CREATE POLICY "Admins can manage companies"
ON public.companies
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

COMMENT ON TABLE public.companies IS 'Gestion des entités corporate pour le déploiement en flotte.';
