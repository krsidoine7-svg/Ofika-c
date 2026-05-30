-- ========================================
-- ÉTAPE 8: VÉRIFICATION FINALE
-- ========================================
-- Copiez et collez ce script dans l'éditeur SQL de Supabase
-- Cette étape vérifie que tout a été configuré correctement

-- Vérifier que toutes les tables ont été créées
SELECT 
    'Tables Created' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets');

-- Vérifier que RLS est activé sur toutes les tables
SELECT 
    'RLS Status' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets')
AND schemaname = 'public'
ORDER BY tablename;

-- Vérifier les politiques RLS créées
SELECT 
    'RLS Policies' as status,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets')
GROUP BY tablename
ORDER BY tablename;

-- Vérifier les buckets de storage
SELECT 
    'Storage Buckets' as status,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('profile-images', 'card-designs')
ORDER BY name;

-- Vérifier les fonctions créées
SELECT 
    'Functions Created' as status,
    COUNT(*) as function_count
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('generate_default_user_image', 'clean_url', 'is_valid_url', 'check_rls_enabled', 'check_max_cards', 'update_updated_at_column', 'set_default_user_image');

-- Vérifier les triggers créés
SELECT 
    'Triggers Created' as status,
    COUNT(*) as trigger_count
FROM pg_trigger 
WHERE tgrelid IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'dashboard_widgets')
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
);

-- Vérifier les index créés
SELECT 
    'Indexes Created' as status,
    COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Message de confirmation final
SELECT 'Configuration de la base de données Ofika terminée avec succès!' as final_status;
SELECT 'Vous pouvez maintenant utiliser votre application!' as ready_status;
