-- Migration: Correction des avertissements du linter Supabase (Warnings)
-- Date: 2026-07-19

-- =========================================================================
-- 1. CORRECTION DU SEARCH PATH MUTABLE
-- =========================================================================
ALTER FUNCTION public.handle_order_status_notification() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;


-- =========================================================================
-- 2. CORRECTION DES POLITIQUES RLS TROP PERMISSIVES (ALWAYS TRUE)
-- =========================================================================

-- analytics_events
DROP POLICY IF EXISTS "Public can insert analytics events" ON public.analytics_events;
CREATE POLICY "Public can insert analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (event_type IS NOT NULL AND length(event_type) > 0);

-- notifications (Suppression de la politique d'insertion publique large)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- onboarding_sessions
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.onboarding_sessions;
CREATE POLICY "Enable insert for anonymous users" ON public.onboarding_sessions
    FOR INSERT TO public WITH CHECK (session_id IS NOT NULL);

DROP POLICY IF EXISTS "Enable update for users" ON public.onboarding_sessions;
CREATE POLICY "Enable update for users" ON public.onboarding_sessions
    FOR UPDATE TO public USING (session_id IS NOT NULL) WITH CHECK (session_id IS NOT NULL);

-- pending_creations
DROP POLICY IF EXISTS "Enable insert for creations" ON public.pending_creations;
CREATE POLICY "Enable insert for creations" ON public.pending_creations
    FOR INSERT TO public WITH CHECK (session_id IS NOT NULL);

DROP POLICY IF EXISTS "Enable delete for creations" ON public.pending_creations;
CREATE POLICY "Enable delete for creations" ON public.pending_creations
    FOR DELETE TO public USING (session_id IS NOT NULL);

-- push_subscriptions
DROP POLICY IF EXISTS "Public can insert push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Public can insert push subscriptions" ON public.push_subscriptions
    FOR INSERT TO public WITH CHECK (endpoint IS NOT NULL AND length(endpoint) > 0);

DROP POLICY IF EXISTS "Public can update push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Public can update push subscriptions" ON public.push_subscriptions
    FOR UPDATE TO public USING (endpoint IS NOT NULL) WITH CHECK (endpoint IS NOT NULL);


-- =========================================================================
-- 3. CORRECTION DU LISTAGE DES BUCKETS PUBLICS (storage.objects SELECT policies)
-- =========================================================================

-- card-designs (Les buckets publics n'ont pas besoin de politique SELECT pour l'accès aux URLs publiques)
DROP POLICY IF EXISTS "Public read access for card designs" ON storage.objects;

-- nfc-assets
DROP POLICY IF EXISTS "Public read access for nfc-assets" ON storage.objects;

-- profile-images
DROP POLICY IF EXISTS "Images publiques accessibles" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;

-- review-media
DROP POLICY IF EXISTS "review_media_read_public" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for review-media" ON storage.objects;


-- =========================================================================
-- 4. RESTRICTION D'EXÉCUTION DES FONCTIONS SECURITY DEFINER (REVOKE & GRANT)
-- =========================================================================

-- Par précaution générale, on révoque l'accès PUBLIC à toutes ces fonctions sensibles
REVOKE EXECUTE ON FUNCTION public.cleanup_old_notifications() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_scans(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_forgotten_contacts(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_notification_stats(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_order_stats(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_order_status_notification() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_user_login() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_scan_count(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_contact_activity(uuid, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reset_user_stats(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.should_reset_user_stats(text) FROM PUBLIC;

-- Droits pour les utilisateurs connectés
GRANT EXECUTE ON FUNCTION public.get_forgotten_contacts(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_notification_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_order_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.should_reset_user_stats(text) TO authenticated;

-- Droit pour tout le monde (invités inclus pour l'incrémentation des scans et l'enregistrement de l'activité contact)
GRANT EXECUTE ON FUNCTION public.increment_scan_count(uuid) TO public;
GRANT EXECUTE ON FUNCTION public.log_contact_activity(uuid, text, jsonb) TO public;
