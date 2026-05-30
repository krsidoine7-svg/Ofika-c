-- Script de diagnostic pour vérifier les valeurs social_links
-- Exécutez ceci dans votre console Supabase SQL Editor

-- Voir toutes les valeurs de social_links stockées
SELECT 
  id,
  name,
  social_links,
  jsonb_array_length(social_links) as nombre_liens
FROM profiles
WHERE social_links IS NOT NULL 
  AND jsonb_array_length(social_links) > 0
ORDER BY created_at DESC
LIMIT 10;

-- Voir les valeurs exactes des plateformes
SELECT 
  p.id,
  p.name,
  link->>'platform' as platform_value,
  link->>'url' as url_value,
  LENGTH(link->>'platform') as platform_length
FROM profiles p,
     jsonb_array_elements(p.social_links) as link
WHERE p.social_links IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 20;
