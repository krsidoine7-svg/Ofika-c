-- Création de la table pour stocker les contacts capturés (Leads)
CREATE TABLE IF NOT EXISTS captured_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Infos du visiteur
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  message TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  latitude NUMERIC, -- Pour la géolocalisation future
  longitude NUMERIC
);

-- Activer la sécurité (RLS)
ALTER TABLE captured_contacts ENABLE ROW LEVEL SECURITY;

-- 1. Tout le monde (public/anonyme) peut INSÉRER un contact (quand ils scannent votre carte)
CREATE POLICY "Public can insert contacts" 
ON captured_contacts 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 2. Seul le propriétaire du profil peut VOIR les contacts de SON profil
CREATE POLICY "Users can view their own profile contacts" 
ON captured_contacts 
FOR SELECT 
TO authenticated 
USING (
  profile_id::text IN (
    SELECT id::text FROM profiles WHERE user_id::uuid = auth.uid()
  )
);

-- 3. Le propriétaire peut supprimer (nettoyer) ses contacts
CREATE POLICY "Users can delete their own profile contacts" 
ON captured_contacts 
FOR DELETE 
TO authenticated 
USING (
  profile_id::text IN (
    SELECT id::text FROM profiles WHERE user_id::uuid = auth.uid()
  )
);

-- Index pour les perfs
CREATE INDEX IF NOT EXISTS idx_captured_contacts_profile_id ON captured_contacts(profile_id);
CREATE INDEX IF NOT EXISTS idx_captured_contacts_created_at ON captured_contacts(created_at);
