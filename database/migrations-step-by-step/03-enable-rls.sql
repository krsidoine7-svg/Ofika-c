-- ========================================
-- ÉTAPE 3: ACTIVATION DE RLS (ROW LEVEL SECURITY)
-- ========================================
-- Copiez et collez ce script dans l'éditeur SQL de Supabase
-- Cette étape active la sécurité au niveau des lignes

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can manage own profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;

-- Vérification que RLS est activé sur toutes les tables
SELECT 
    'RLS Status' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets')
AND schemaname = 'public'
ORDER BY tablename;

SELECT 'Étape 3 terminée: RLS activé avec succès!' as final_status;
