-- Fix RLS policies to correctly read 'role' from 'app_metadata' instead of root jwt

-- admin_audit_logs
DROP POLICY IF EXISTS "Admins can manage audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can manage audit logs" ON public.admin_audit_logs FOR ALL TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')));

-- announcements
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')));

-- system_config
DROP POLICY IF EXISTS "Admins can manage system config" ON public.system_config;
CREATE POLICY "Admins can manage system config" ON public.system_config FOR ALL TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')));

-- cards
DROP POLICY IF EXISTS "Admins can view all cards" ON public.cards;
CREATE POLICY "Admins can view all cards" ON public.cards FOR SELECT TO public USING ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')));

-- orders
DROP POLICY IF EXISTS "Admin full access to orders" ON public.orders;
CREATE POLICY "Admin full access to orders" ON public.orders FOR ALL TO public USING ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')));

-- users
DROP POLICY IF EXISTS "users_admin_all" ON public.users;
CREATE POLICY "users_admin_all" ON public.users FOR ALL TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
CREATE POLICY "Admins can manage users" ON public.users FOR ALL TO authenticated 
USING ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')));

-- analytics_events
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;
CREATE POLICY "Admins can view all analytics" ON public.analytics_events FOR SELECT TO public USING ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')));

-- profiles
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'super_admin')));
