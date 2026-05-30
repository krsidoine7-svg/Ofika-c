-- =====================================================
-- MIGRATION : SYSTÈME DE RÉINITIALISATION AUTOMATIQUE DES STATS (40 JOURS)
-- =====================================================
-- Auteur : Système de gestion des analytics
-- Date : 2025-01-07
-- Description : Ajoute un système de réinitialisation automatique des statistiques tous les 40 jours
-- =====================================================

-- 1. Ajouter la colonne stats_last_reset_at à la table users si elle n'existe pas
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stats_last_reset_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Initialiser la date de dernier reset pour les utilisateurs existants
UPDATE public.users 
SET stats_last_reset_at = NOW() 
WHERE stats_last_reset_at IS NULL;

-- 3. Ajouter un commentaire explicatif sur la colonne
COMMENT ON COLUMN public.users.stats_last_reset_at IS 
'Date du dernier reset des statistiques. Les stats sont automatiquement réinitialisées tous les 40 jours.';

-- 4. Créer un index pour optimiser les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_users_stats_reset 
ON public.users(stats_last_reset_at);

-- 5. Créer une fonction pour réinitialiser les stats d'un utilisateur
CREATE OR REPLACE FUNCTION reset_user_stats(user_uuid TEXT)
RETURNS TABLE(
  success BOOLEAN,
  deleted_count BIGINT,
  message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count BIGINT;
  v_cutoff_date TIMESTAMPTZ;
BEGIN
  -- Calculer la date limite (40 jours avant maintenant)
  SELECT stats_last_reset_at 
  INTO v_cutoff_date
  FROM public.users 
  WHERE id = user_uuid;

  -- Vérifier si l'utilisateur existe
  IF v_cutoff_date IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::BIGINT, 'Utilisateur non trouvé'::TEXT;
    RETURN;
  END IF;

  -- Supprimer tous les événements analytics depuis le dernier reset
  DELETE FROM public.analytics_events
  WHERE (user_id = user_uuid OR profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = user_uuid
  ))
  AND created_at >= v_cutoff_date;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Mettre à jour la date de dernier reset
  UPDATE public.users
  SET stats_last_reset_at = NOW()
  WHERE id = user_uuid;

  -- Retourner le résultat
  RETURN QUERY SELECT TRUE, v_deleted_count, 
    format('Stats réinitialisées avec succès. %s événements supprimés.', v_deleted_count)::TEXT;
END;
$$;

-- 6. Ajouter un commentaire sur la fonction
COMMENT ON FUNCTION reset_user_stats(TEXT) IS 
'Réinitialise les statistiques d''un utilisateur en supprimant ses événements analytics depuis le dernier reset et met à jour stats_last_reset_at';

-- 7. Créer une fonction pour vérifier si un reset est nécessaire
CREATE OR REPLACE FUNCTION should_reset_user_stats(user_uuid TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_reset TIMESTAMPTZ;
  v_threshold TIMESTAMPTZ;
BEGIN
  -- Récupérer la date du dernier reset
  SELECT stats_last_reset_at 
  INTO v_last_reset
  FROM public.users 
  WHERE id = user_uuid;

  -- Si pas de date, pas besoin de reset (déjà initialisé)
  IF v_last_reset IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Calculer le seuil (40 jours avant maintenant)
  v_threshold := NOW() - INTERVAL '40 days';

  -- Retourner TRUE si le dernier reset est plus vieux que 40 jours
  RETURN v_last_reset <= v_threshold;
END;
$$;

-- 8. Ajouter un commentaire sur la fonction de vérification
COMMENT ON FUNCTION should_reset_user_stats(TEXT) IS 
'Vérifie si les statistiques d''un utilisateur doivent être réinitialisées (40 jours écoulés)';

-- 9. Créer une vue pour faciliter le monitoring
CREATE OR REPLACE VIEW public.users_stats_status AS
SELECT 
  u.id,
  u.email,
  u.stats_last_reset_at,
  NOW() - u.stats_last_reset_at AS time_since_reset,
  CASE 
    WHEN should_reset_user_stats(u.id) THEN 'NEEDS_RESET'
    ELSE 'OK'
  END AS reset_status,
  (SELECT COUNT(*) FROM public.analytics_events ae 
   WHERE ae.user_id = u.id OR ae.profile_id IN (
     SELECT p.id FROM public.profiles p WHERE p.user_id = u.id
   )
   AND ae.created_at >= u.stats_last_reset_at
  ) AS current_events_count
FROM public.users u;

-- 10. Ajouter un commentaire sur la vue
COMMENT ON VIEW public.users_stats_status IS 
'Vue pour monitorer l''état des resets de statistiques pour tous les utilisateurs';

-- =====================================================
-- VÉRIFICATION
-- =====================================================
-- Pour vérifier que tout fonctionne :
-- SELECT * FROM users_stats_status LIMIT 10;
-- SELECT should_reset_user_stats('votre-uuid-ici');
-- SELECT * FROM reset_user_stats('votre-uuid-ici');
