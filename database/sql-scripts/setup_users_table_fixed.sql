-- =====================================================
-- CORRECTION DES POLITIQUES DE SÉCURITÉ (RLS) POUR USERS
-- =====================================================

-- 1. Activation de la sécurité (au cas où)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Nettoyage des anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for own user" ON public.users;
DROP POLICY IF EXISTS "Enable update access for own user" ON public.users;

-- 3. Création des politiques correctes (compatible avec id text)
-- Lecture
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid()::text = id);

-- Mise à jour
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid()::text = id);

-- Insertion (si besoin d'insertion manuelle côté client, sinon le trigger serveur insert déjà)
CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid()::text = id);


-- =====================================================
-- CORRECTION DE LA SYNCHRONISATION AUTH -> PUBLIC
-- =====================================================

-- 4. Fonction de trigger améliorée (compatible id text)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, image, created_at, updated_at)
  VALUES (
    new.id::text, -- Cast UUID to text
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    -- On ne met à jour le nom/image que s'ils sont vides dans la table users
    name = CASE WHEN public.users.name IS NULL OR public.users.name = '' THEN EXCLUDED.name ELSE public.users.name END,
    image = CASE WHEN public.users.image IS NULL OR public.users.image = '' THEN EXCLUDED.image ELSE public.users.image END,
    last_login = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-appliquer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Rétro-synchronisation des utilisateurs manquants
INSERT INTO public.users (id, email, name, image, created_at, updated_at)
SELECT 
  id::text, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', ''),
  created_at,
  created_at
FROM auth.users
WHERE id::text NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Vérification
SELECT count(*) as users_count FROM public.users;
