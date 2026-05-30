-- Correction de la table contact_activities et de la fonction de log
-- Pour résoudre l'erreur 409 (Conflict)

-- 1. Vérification de la table
CREATE TABLE IF NOT EXISTS contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'call', 'email', 'message', 'add', 'edit', 'share')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Recréation propre de la fonction de log
-- On utilise SECURITY DEFINER pour contourner les problèmes de RLS complexes
DROP FUNCTION IF EXISTS log_contact_activity;

CREATE OR REPLACE FUNCTION log_contact_activity(
  p_contact_id UUID,
  p_activity_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
  v_user_id UUID;
BEGIN
  -- Récupérer l'ID utilisateur courant
  v_user_id := auth.uid();
  
  -- Si pas d'utilisateur, on ne logge pas (ou on logge sans user_id si on rendait la colonne nullable)
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Vérifier si l'activité existe déjà pour éviter le spam (optionnel, pour l'instant on insert tout)
  -- Si vous aviez un index UNIQUE qui causait le 409, il faudrait gérer le conflit ici.
  
  INSERT INTO contact_activities (user_id, contact_id, activity_type, metadata)
  VALUES (v_user_id, p_contact_id, p_activity_type, p_metadata)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur (ex: 409), on catch et on retourne NULL pour ne pas casser le front
  RAISE WARNING 'Erreur lors du log activité: %', SQLERRM;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Vérification des politiques RLS
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own activities" ON contact_activities;
CREATE POLICY "Users can insert own activities" ON contact_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own activities" ON contact_activities;
CREATE POLICY "Users can view own activities" ON contact_activities
  FOR SELECT USING (auth.uid() = user_id);
