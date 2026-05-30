-- Script pour synchroniser les emails de auth.users vers la table public.users
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Mettre à jour tous les users qui n'ont pas d'email dans la table users
UPDATE public.users
SET email = auth.users.email
FROM auth.users
WHERE public.users.id::text = auth.users.id::text
  AND (public.users.email IS NULL OR public.users.email = '');

-- Vérifier le résultat
SELECT 
  u.id,
  u.email as users_table_email,
  au.email as auth_email,
  CASE 
    WHEN u.email = au.email THEN '✅ Synchronisé'
    WHEN u.email IS NULL THEN '⚠️ Email manquant dans users'
    ELSE '❌ Emails différents'
  END as status
FROM public.users u
JOIN auth.users au ON u.id::text = au.id::text
ORDER BY u.created_at DESC
LIMIT 10;
