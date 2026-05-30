-- =====================================================
-- SCRIPT DE TEST : Générer des événements analytics
-- =====================================================
-- Utilisez ce script pour créer des événements de test
-- afin de voir les statistiques s'afficher dans le dashboard

-- 1. Vérifier s'il y a des profils
SELECT id, name, user_id FROM profiles LIMIT 5;

-- 2. Insérer des événements de test pour VOS profils
-- Remplacez 'VOTRE-PROFILE-ID-ICI' par un vrai ID de profil

-- Exemple: Ajouter 10 vues de profil
INSERT INTO analytics_events (profile_id, event_type, device_type, created_at)
SELECT 
  'VOTRE-PROFILE-ID-ICI',
  'profile_viewed',
  CASE (random() * 2)::int 
    WHEN 0 THEN 'mobile'
    WHEN 1 THEN 'desktop'
    ELSE 'tablet'
  END,
  NOW() - (random() * interval '7 days')
FROM generate_series(1, 10);

-- Exemple: Ajouter 5 clics de lien
INSERT INTO analytics_events (profile_id, event_type, device_type, created_at)
SELECT 
  'VOTRE-PROFILE-ID-ICI',
  'link_clicked',
  CASE (random() * 2)::int 
    WHEN 0 THEN 'mobile'
    WHEN 1 THEN 'desktop'
    ELSE 'tablet'
  END,
  NOW() - (random() * interval '7 days')
FROM generate_series(1, 5);

-- Exemple: Ajouter 3 scans QR
INSERT INTO analytics_events (profile_id, event_type, device_type, created_at)
SELECT 
  'VOTRE-PROFILE-ID-ICI',
  'qr_scanned',
  'mobile',
  NOW() - (random() * interval '7 days')
FROM generate_series(1, 3);

-- 3. Vérifier que les événements ont été créés
SELECT 
  event_type, 
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM analytics_events
WHERE profile_id = 'VOTRE-PROFILE-ID-ICI'
GROUP BY event_type;

-- 4. Voir les totaux groupés par type
SELECT 
  event_type,
  device_type,
  COUNT(*) as count
FROM analytics_events
GROUP BY event_type, device_type
ORDER BY event_type, count DESC;

-- 5. Supprimer les événements de test (si besoin)
-- DELETE FROM analytics_events WHERE profile_id = 'VOTRE-PROFILE-ID-ICI';
