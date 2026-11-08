-- =====================================================
-- MIGRATION : CENTRALISATION DES RÔLES (CLIENT, ADMIN, TECH)
-- =====================================================

-- 1. Mise à jour de la contrainte CHECK sur public.users.role
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('client', 'admin', 'tech', 'super_admin', 'CLIENT', 'ADMIN', 'TECH'));

-- Rôle par défaut : 'client'
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'client';

-- 2. Mise à jour du trigger de synchronisation JWT
CREATE OR REPLACE FUNCTION public.sync_user_role_to_jwt()
RETURNS trigger AS $$
DECLARE
  normalized_role text;
BEGIN
  -- Normaliser en minuscules pour la cohérence des politiques RLS
  normalized_role := LOWER(NEW.role);
  IF normalized_role = 'super_admin' THEN
    normalized_role := 'admin';
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    json_build_object('role', normalized_role)::jsonb
  WHERE id = NEW.id::uuid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Mettre à jour les politiques RLS pour inclure le rôle 'tech'
-- Le rôle tech a accès aux logs d'audit et à la configuration système
DROP POLICY IF EXISTS "Admins and Tech can manage audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins and Tech can manage audit logs" 
  ON public.admin_audit_logs FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'tech')));

DROP POLICY IF EXISTS "Admins and Tech can manage system config" ON public.system_config;
CREATE POLICY "Admins and Tech can manage system config" 
  ON public.system_config FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'tech')));
