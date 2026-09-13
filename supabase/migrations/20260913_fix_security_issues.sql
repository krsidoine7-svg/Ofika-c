-- 1. Set a safe search_path for mutable functions
ALTER FUNCTION public.sync_user_role_to_jwt()
    SET search_path = public;
ALTER FUNCTION public.notify_on_order_status_change()
    SET search_path = public;
ALTER FUNCTION public.handle_order_status_notification()
    SET search_path = public;

-- 2. Revoke EXECUTE from anon and authenticated roles on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.sync_user_role_to_jwt() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_order_status_change() FROM anon, authenticated;

-- 3. Change functions to SECURITY INVOKER (if business logic permits)
ALTER FUNCTION public.sync_user_role_to_jwt() SECURITY INVOKER;
ALTER FUNCTION public.notify_on_order_status_change() SECURITY INVOKER;
-- (Optionally move to a private schema if you prefer)
-- CREATE SCHEMA internal;
-- ALTER FUNCTION public.sync_user_role_to_jwt() SET SCHEMA internal;
-- ALTER FUNCTION public.notify_on_order_status_change() SET SCHEMA internal;

-- 4. Tighten RLS policy on notifications table
DROP POLICY "Admins full access to notifications" ON public.notifications;
-- Example restrictive policy (adjust to your needs)
CREATE POLICY "Authenticated users can read notifications"
    ON public.notifications
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Owners can modify their notifications"
    ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Remove public bucket listing policy
REVOKE SELECT ON storage.objects FROM public;
-- Keep object download permission if needed (object-level SELECT with a specific condition)
-- Example: allow read of objects only when a signed URL is provided (handled by Supabase client).

-- 6. Enable leaked password protection in Auth
UPDATE auth.settings
SET leaked_password_detection = true;
