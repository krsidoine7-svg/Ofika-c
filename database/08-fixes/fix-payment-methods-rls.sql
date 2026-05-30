-- Script pour activer RLS sur la table payment_methods
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Activer RLS sur la table payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- 2. Créer des politiques RLS pour payment_methods
-- Politique pour la lecture des méthodes de paiement (lecture publique)
CREATE POLICY "payment_methods_read" ON payment_methods
FOR SELECT USING (is_active = true);

-- Politique pour l'insertion (admin uniquement - optionnel)
-- CREATE POLICY "payment_methods_insert" ON payment_methods
-- FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Politique pour la mise à jour (admin uniquement - optionnel)
-- CREATE POLICY "payment_methods_update" ON payment_methods
-- FOR UPDATE USING (auth.role() = 'service_role');

-- Politique pour la suppression (admin uniquement - optionnel)
-- CREATE POLICY "payment_methods_delete" ON payment_methods
-- FOR DELETE USING (auth.role() = 'service_role');

-- 3. Vérifier que RLS est activé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'payment_methods' AND schemaname = 'public';

-- 4. Lister les politiques créées
SELECT 
    policyname,
    cmd as operation,
    permissive
FROM pg_policies 
WHERE tablename = 'payment_methods' 
AND schemaname = 'public'
ORDER BY policyname;
