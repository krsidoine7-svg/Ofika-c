-- =====================================================
-- CORRECTION : FONCTION get_user_order_stats (Version 3)
-- FIX: Utiliser payment_status au lieu de status
-- =====================================================
-- Exécutez ce script dans Supabase Dashboard > SQL Editor
-- Date: 2025-01-11

-- Supprimer les anciennes versions
DROP FUNCTION IF EXISTS public.get_user_order_stats(user_uuid UUID);
DROP FUNCTION IF EXISTS public.get_user_order_stats(user_uuid TEXT);

-- Créer la fonction corrigée qui utilise payment_status
CREATE OR REPLACE FUNCTION public.get_user_order_stats(user_uuid TEXT)
RETURNS TABLE (
    total_orders bigint,
    paid_orders bigint,
    pending_orders bigint,
    failed_orders bigint,
    cancelled_orders bigint,
    total_spent numeric,
    can_order_more boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est authentifié
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié';
    END IF;
    
    -- Vérifier que l'utilisateur demande ses propres statistiques
    IF auth.uid()::text != user_uuid THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;
    
    -- Retourner les statistiques en utilisant payment_status (PAS status)
    RETURN QUERY
    SELECT
        COUNT(o.id)::bigint AS total_orders,
        COUNT(CASE WHEN o.payment_status = 'succeeded' THEN o.id END)::bigint AS paid_orders,
        COUNT(CASE WHEN o.payment_status IN ('pending', 'processing') THEN o.id END)::bigint AS pending_orders,
        COUNT(CASE WHEN o.payment_status = 'failed' THEN o.id END)::bigint AS failed_orders,
        COUNT(CASE WHEN o.payment_status = 'cancelled' THEN o.id END)::bigint AS cancelled_orders,
        COALESCE(SUM(CASE WHEN o.payment_status = 'succeeded' THEN o.total_cents ELSE 0 END), 0)::numeric / 100 AS total_spent,
        (COUNT(CASE WHEN o.payment_status = 'succeeded' THEN o.id END) < 2) AS can_order_more
    FROM
        public.orders o
    WHERE
        o.user_id = user_uuid;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.get_user_order_stats(TEXT) TO authenticated;

-- Commentaire pour la documentation
COMMENT ON FUNCTION public.get_user_order_stats(TEXT) IS 
'Récupère les statistiques des commandes pour un utilisateur donné. Utilise payment_status (succeeded, pending, processing, failed, cancelled, refunded). Le total_spent est en euros (total_cents / 100).';

-- Logs de succès
SELECT 'Fonction get_user_order_stats v3 créée avec succès!' as message;
SELECT 'FIX: Utilise payment_status au lieu de status' as note;
SELECT 'Status valides: succeeded, pending, processing, failed, cancelled, refunded' as status_list;
