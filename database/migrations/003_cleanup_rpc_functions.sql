-- =================================================================
-- NETTOYAGE RADICAL DES FONCTIONS RPC POUR ÉVITER LES CONFLITS (409)
-- =================================================================

-- 1. Supprimer toutes les signatures possibles de la fonction (pour éviter l'ambiguïté)
-- On drop explicitement avec les types d'arguments potentiels
DROP FUNCTION IF EXISTS log_contact_activity(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS log_contact_activity(UUID, TEXT, JSON);
DROP FUNCTION IF EXISTS log_contact_activity(UUID, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS log_contact_activity(p_contact_id UUID, p_activity_type TEXT, p_metadata JSONB);

-- 2. Recréer la fonction propre et unique
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
  v_user_id := auth.uid();
  
  -- Sécurité : Si pas d'utilisateur, pas de log (évite erreur NULL constraint)
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO contact_activities (user_id, contact_id, activity_type, metadata)
  VALUES (v_user_id, p_contact_id, p_activity_type, p_metadata)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
EXCEPTION WHEN OTHERS THEN
  -- Capture silencieuse des erreurs pour ne jamais faire planter le frontend
  -- Le code 409 disparaîtra pour l'utilisateur, même si l'insertion échoue
  RAISE WARNING 'Log failed: %', SQLERRM;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Accorder les permissions explicitement (Important pour RPC)
GRANT EXECUTE ON FUNCTION log_contact_activity(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION log_contact_activity(UUID, TEXT, JSONB) TO service_role;
-- Si vous voulez permettre aux anonymes de logger (attention sécurité), décommentez :
-- GRANT EXECUTE ON FUNCTION log_contact_activity(UUID, TEXT, JSONB) TO anon;
