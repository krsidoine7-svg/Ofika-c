-- FINAL FIX FOR ADMIN MANAGEMENT RLS
-- Objectif: permettre aux admins de promouvoir d'autres admins sans boucle

-- 1. On s'assure que la lecture est plate pour tout le monde (évite l'infinite recursion)
DROP POLICY IF EXISTS "admin_users_read_flat" ON admin_users;
CREATE POLICY "admin_users_read_flat" ON admin_users 
FOR SELECT TO authenticated 
USING (true);

-- 2. On autorise les admins existants à MANAGE (INSERT/UPDATE/DELETE) les autres admins
-- Comme la lecture (SELECT) est en 'USING true', cette vérification EXISTS ne bouclera pas.
DROP POLICY IF EXISTS "admin_users_admin_manage" ON admin_users;
CREATE POLICY "admin_users_admin_manage" ON admin_users 
FOR ALL TO authenticated 
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id::text = auth.uid()::text)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id::text = auth.uid()::text)
);
