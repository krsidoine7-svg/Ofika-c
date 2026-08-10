-- 1. Réinitialiser la colonne 'role' sur la table users (pour être sûr des valeurs)
ALTER TABLE public.users DROP COLUMN IF EXISTS role CASCADE;
ALTER TABLE public.users ADD COLUMN role text DEFAULT 'client' CHECK (role IN ('client', 'admin', 'super_admin'));

-- 2. Migrer les données (tout le monde en client)
UPDATE public.users SET role = 'client';

-- 3. Fonction pour synchroniser le rôle avec les app_metadata du token (JWT)
CREATE OR REPLACE FUNCTION public.sync_user_role_to_jwt()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    json_build_object('role', NEW.role)::jsonb
  WHERE id = NEW.id::uuid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger pour déclencher la synchronisation
DROP TRIGGER IF EXISTS on_user_role_updated ON public.users;
CREATE TRIGGER on_user_role_updated
  AFTER UPDATE OF role OR INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_to_jwt();

-- 5. Forcer la synchronisation immédiate pour tous les utilisateurs existants
UPDATE public.users SET role = 'client'; -- Ce second UPDATE va déclencher le trigger pour tout le monde

-- 6. Mettre à jour les politiques RLS qui utilisaient admin_users
-- On remplace "EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = (auth.uid())::text)"
-- par "(auth.jwt() ->> 'role' IN ('admin', 'super_admin'))"

-- admin_audit_logs
DROP POLICY IF EXISTS "Admins can manage audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can manage audit logs" ON public.admin_audit_logs FOR ALL TO authenticated USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

-- announcements
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL TO authenticated USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

-- system_config
DROP POLICY IF EXISTS "Admins can manage system config" ON public.system_config;
CREATE POLICY "Admins can manage system config" ON public.system_config FOR ALL TO authenticated USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

-- cards
DROP POLICY IF EXISTS "Admins can view all cards" ON public.cards;
CREATE POLICY "Admins can view all cards" ON public.cards FOR SELECT TO public USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

-- orders
DROP POLICY IF EXISTS "Admin full access to orders" ON public.orders;
CREATE POLICY "Admin full access to orders" ON public.orders FOR ALL TO public USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

-- users
DROP POLICY IF EXISTS "users_admin_all" ON public.users;
CREATE POLICY "users_admin_all" ON public.users FOR ALL TO authenticated USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

-- companies
DROP POLICY IF EXISTS "Admin Full Access Companies" ON public.companies;
CREATE POLICY "Admin Full Access Companies" ON public.companies FOR ALL TO authenticated 
USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')))
WITH CHECK ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

-- analytics_events
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;
CREATE POLICY "Admins can view all analytics" ON public.analytics_events FOR SELECT TO public USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

-- profiles
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

-- 7. Supprimer la table admin_users (puisqu'elle n'est plus utilisée nulle part)
DROP TABLE IF EXISTS public.admin_users CASCADE;
