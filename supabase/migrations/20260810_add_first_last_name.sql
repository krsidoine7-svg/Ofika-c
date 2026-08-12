-- Ajout des colonnes first_name et last_name à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Mise à jour des profils existants pour extraire first_name et last_name depuis name
-- On suppose que last_name est le dernier mot et first_name le reste
UPDATE public.profiles
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
WHERE first_name IS NULL AND last_name IS NULL AND name IS NOT NULL;
