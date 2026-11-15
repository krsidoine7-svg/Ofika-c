-- =====================================================
-- Migration: Assurer la cohérence des colonnes first_name et last_name sur public.users
-- Date: 2026-11-14
-- =====================================================

-- 1. Ajout sécurisé des colonnes si inexistantes
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- 2. Rétro-remplissage automatique depuis la colonne 'name' pour les utilisateurs existants
UPDATE public.users
SET 
  first_name = CASE 
    WHEN array_length(string_to_array(name, ' '), 1) > 1 THEN 
      array_to_string((string_to_array(name, ' '))[1:array_length(string_to_array(name, ' '), 1)-1], ' ')
    ELSE name 
  END,
  last_name = CASE 
    WHEN array_length(string_to_array(name, ' '), 1) > 1 THEN 
      (string_to_array(name, ' '))[array_length(string_to_array(name, ' '), 1)]
    ELSE '' 
  END
WHERE (first_name IS NULL OR first_name = '') 
  AND (last_name IS NULL OR last_name = '') 
  AND name IS NOT NULL 
  AND name != '';

-- 3. Mise à jour inverse: si 'name' est vide mais que first_name ou last_name existent
UPDATE public.users
SET name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE (name IS NULL OR name = '') 
  AND (first_name IS NOT NULL OR last_name IS NOT NULL);
