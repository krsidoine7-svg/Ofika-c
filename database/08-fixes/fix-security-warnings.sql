-- Script pour corriger les alertes de sécurité Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Corriger les fonctions avec search_path mutable
ALTER FUNCTION generate_custom_url(TEXT) SET search_path = public;
ALTER FUNCTION check_max_profiles_per_user() SET search_path = public;
ALTER FUNCTION check_max_links_per_profile() SET search_path = public;
ALTER FUNCTION check_max_cards_per_user() SET search_path = public;
ALTER FUNCTION generate_unique_card_code() SET search_path = public;
ALTER FUNCTION update_updated_at_column() SET search_path = public;
ALTER FUNCTION handle_new_user() SET search_path = public;
ALTER FUNCTION handle_user_login() SET search_path = public;

-- 2. Vérifier que les corrections ont été appliquées
SELECT 
    'Functions Fixed' as status,
    proname as function_name,
    proconfig as search_path_config
FROM pg_proc 
WHERE proname IN (
    'generate_custom_url',
    'check_max_profiles_per_user', 
    'check_max_links_per_profile',
    'check_max_cards_per_user',
    'generate_unique_card_code',
    'update_updated_at_column',
    'handle_new_user',
    'handle_user_login'
)
ORDER BY proname;

-- 3. Note pour la protection des mots de passe
SELECT 
    'Security Note' as info,
    'Enable leaked password protection in Supabase Auth settings' as action,
    'Go to Authentication > Settings > Password Protection' as instructions;
