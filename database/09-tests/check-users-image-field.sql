-- Script pour analyser le champ image dans la table users
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Analyser les valeurs du champ image
SELECT 
    'Image Field Analysis' as analysis_type,
    COUNT(*) as total_users,
    COUNT(image) as users_with_image,
    COUNT(*) - COUNT(image) as users_without_image,
    ROUND(
        (COUNT(image)::float / COUNT(*)::float) * 100, 2
    ) as percentage_with_image
FROM users;

-- 3. Voir les utilisateurs sans image
SELECT 
    id,
    email,
    name,
    image,
    created_at,
    updated_at
FROM users 
WHERE image IS NULL
ORDER BY created_at DESC;

-- 4. Voir les utilisateurs avec image
SELECT 
    id,
    email,
    name,
    image,
    created_at,
    updated_at
FROM users 
WHERE image IS NOT NULL
ORDER BY created_at DESC;

-- 5. Vérifier les métadonnées des utilisateurs Supabase Auth
SELECT 
    'Auth Metadata Analysis' as analysis_type,
    COUNT(*) as total_auth_users
FROM auth.users;

-- 6. Analyser les métadonnées d'image dans Auth
SELECT 
    id,
    email,
    raw_user_meta_data->>'avatar_url' as auth_avatar_url,
    raw_user_meta_data->>'picture' as auth_picture,
    raw_user_meta_data->>'image' as auth_image,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 7. Vérifier la synchronisation entre Auth et users
SELECT 
    'Sync Analysis' as analysis_type,
    COUNT(DISTINCT u.id) as users_in_table,
    COUNT(DISTINCT au.id) as users_in_auth,
    COUNT(DISTINCT CASE WHEN u.id = au.id THEN u.id END) as synced_users
FROM users u
FULL OUTER JOIN auth.users au ON u.id = au.id;

-- 8. Recommandations
SELECT 
    'RECOMMENDATIONS' as category,
    '1. Sync image from Auth metadata' as recommendation
UNION ALL
SELECT 
    'RECOMMENDATIONS',
    '2. Add default placeholder image'
UNION ALL
SELECT 
    'RECOMMENDATIONS',
    '3. Update user creation logic'
UNION ALL
SELECT 
    'RECOMMENDATIONS',
    '4. Add image upload for users'
UNION ALL
SELECT 
    'RECOMMENDATIONS',
    '5. Sync image on user login';
