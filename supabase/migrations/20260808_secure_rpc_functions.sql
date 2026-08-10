-- =====================================================
-- FIX: Sécurisation des fonctions SECURITY DEFINER
-- =====================================================

-- Révocation de l'accès public
REVOKE EXECUTE ON FUNCTION public.cleanup_old_notifications() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_scans(integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_forgotten_contacts(integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_notification_stats(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_order_stats(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_order_status_notification() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_user_login() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_link_click(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_scan_count(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_contact_activity(uuid, text, jsonb) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_user_stats(text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.should_reset_user_stats(text) FROM public, anon, authenticated;

-- Octroi de l'accès au service_role (API privées / Triggers système)
GRANT EXECUTE ON FUNCTION public.cleanup_old_notifications() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_scans(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_forgotten_contacts(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_notification_stats(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_order_stats(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_order_status_notification() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_user_login() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_link_click(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_scan_count(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_contact_activity(uuid, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_user_stats(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.should_reset_user_stats(text) TO service_role;
