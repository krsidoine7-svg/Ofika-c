-- ========================================
-- MODULE AVIS CLIENTS - OFIKA
-- Triggers et Contraintes Métier
-- ========================================
-- Version: 1.0
-- Date: 2025-12-08
-- Description: Triggers automatiques et validation métier

-- ========================================
-- TRIGGER : updated_at automatique
-- ========================================

-- Note: La fonction update_updated_at_column() existe déjà dans Ofika
-- On crée simplement les triggers pour nos nouvelles tables

-- Trigger pour review_links
DROP TRIGGER IF EXISTS trigger_review_links_updated_at ON review_links;

CREATE TRIGGER trigger_review_links_updated_at
  BEFORE UPDATE ON review_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour reviews
DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FONCTION : Validation du slug unique
-- ========================================

CREATE OR REPLACE FUNCTION validate_review_link_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que le slug est unique (pas vide et pas de caractères spéciaux)
  IF NEW.slug IS NULL OR LENGTH(TRIM(NEW.slug)) = 0 THEN
    RAISE EXCEPTION 'Le slug ne peut pas être vide';
  END IF;
  
  -- Vérifier format du slug (lettres, chiffres, tirets uniquement)
  IF NEW.slug !~ '^[a-z0-9-]+$' THEN
    RAISE EXCEPTION 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets';
  END IF;
  
  -- Limiter la longueur
  IF LENGTH(NEW.slug) > 200 THEN
    RAISE EXCEPTION 'Le slug ne peut pas dépasser 200 caractères';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS trigger_validate_slug ON review_links;

CREATE TRIGGER trigger_validate_slug
  BEFORE INSERT OR UPDATE ON review_links
  FOR EACH ROW
  EXECUTE FUNCTION validate_review_link_slug();

-- ========================================
-- FONCTION : Nettoyage automatique des données
-- ========================================

CREATE OR REPLACE FUNCTION sanitize_review_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Nettoyer les espaces dans les champs texte
  IF NEW.client_name IS NOT NULL THEN
    NEW.client_name := TRIM(NEW.client_name);
    -- Vider si trop court
    IF LENGTH(NEW.client_name) = 0 THEN
      NEW.client_name := NULL;
    END IF;
  END IF;
  
  IF NEW.client_email IS NOT NULL THEN
    NEW.client_email := TRIM(LOWER(NEW.client_email));
    -- Validation basique email
    IF NEW.client_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
      RAISE EXCEPTION 'Format d''email invalide: %', NEW.client_email;
    END IF;
  END IF;
  
  IF NEW.comment IS NOT NULL THEN
    NEW.comment := TRIM(NEW.comment);
    IF LENGTH(NEW.comment) = 0 THEN
      NEW.comment := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS trigger_sanitize_review ON reviews;

CREATE TRIGGER trigger_sanitize_review
  BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_review_data();

-- ========================================
-- FONCTION : Statistiques automatiques (optionnel)
-- ========================================

-- Cette fonction peut être utilisée pour calculer des stats en temps réel
CREATE OR REPLACE FUNCTION get_review_link_stats(p_link_id UUID)
RETURNS TABLE(
  total_reviews BIGINT,
  avg_rating NUMERIC,
  rating_5_count BIGINT,
  rating_4_count BIGINT,
  rating_3_count BIGINT,
  rating_2_count BIGINT,
  rating_1_count BIGINT,
  positive_rate NUMERIC,
  latest_review_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_reviews,
    ROUND(AVG(rating), 2) as avg_rating,
    COUNT(*) FILTER (WHERE rating = 5)::BIGINT as rating_5_count,
    COUNT(*) FILTER (WHERE rating = 4)::BIGINT as rating_4_count,
    COUNT(*) FILTER (WHERE rating = 3)::BIGINT as rating_3_count,
    COUNT(*) FILTER (WHERE rating = 2)::BIGINT as rating_2_count,
    COUNT(*) FILTER (WHERE rating = 1)::BIGINT as rating_1_count,
    ROUND(
      (COUNT(*) FILTER (WHERE rating >= 4)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      1
    ) as positive_rate,
    MAX(created_at) as latest_review_at
  FROM reviews
  WHERE link_id = p_link_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_review_link_stats IS 'Calcule les statistiques agrégées pour un lien de collecte d''avis';

-- ========================================
-- VÉRIFICATION
-- ========================================

-- Lister tous les triggers créés
SELECT 
  'Triggers créés' as status,
  trigger_schema,
  event_object_table as table_name,
  trigger_name,
  event_manipulation as event,
  action_statement as function
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('review_links', 'reviews')
ORDER BY event_object_table, trigger_name;

-- Lister les fonctions créées
SELECT 
  'Fonctions créées' as status,
  routine_name as function_name,
  routine_type as type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'validate_review_link_slug',
    'sanitize_review_data',
    'get_review_link_stats'
  )
ORDER BY routine_name;
