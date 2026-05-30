-- Nettoyer les politiques existantes
DROP POLICY IF EXISTS "Profiles are viewable by everyone when public" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;

-- Créer des politiques propres
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture des profils publics
CREATE POLICY "public_profiles_read" ON profiles
FOR SELECT USING (is_public = true);

-- Politique pour la lecture des profils privés
CREATE POLICY "private_profiles_read" ON profiles
FOR SELECT USING (auth.uid()::text = user_id);

-- Politique pour l'insertion
CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Politique pour la mise à jour
CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid()::text = user_id);

-- Politique pour la suppression
CREATE POLICY "profiles_delete" ON profiles
FOR DELETE USING (auth.uid()::text = user_id);

-- Appliquer les mêmes corrections aux autres tables
-- Table links
DROP POLICY IF EXISTS "Users can view their own links" ON links;
DROP POLICY IF EXISTS "Users can insert their own links" ON links;
DROP POLICY IF EXISTS "Users can update their own links" ON links;
DROP POLICY IF EXISTS "Users can delete their own links" ON links;

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "links_read" ON links
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = links.profile_id 
    AND (profiles.is_public = true OR profiles.user_id = auth.uid()::text)
  )
);

CREATE POLICY "links_insert" ON links
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = links.profile_id 
    AND profiles.user_id = auth.uid()::text
  )
);

CREATE POLICY "links_update" ON links
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = links.profile_id 
    AND profiles.user_id = auth.uid()::text
  )
);

CREATE POLICY "links_delete" ON links
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = links.profile_id 
    AND profiles.user_id = auth.uid()::text
  )
);

-- Table analytics_events
DROP POLICY IF EXISTS "Users can view their own analytics" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON analytics_events;

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_read" ON analytics_events
FOR SELECT USING (
  user_id = auth.uid()::text OR 
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "analytics_insert" ON analytics_events
FOR INSERT WITH CHECK (
  user_id = auth.uid()::text OR 
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()::text
  )
);
