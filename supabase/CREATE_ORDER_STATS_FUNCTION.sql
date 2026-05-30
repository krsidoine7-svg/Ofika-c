-- =====================================================
-- CRÉER FONCTION MANQUANTE : get_user_order_stats
-- =====================================================
-- Exécutez ce script dans Supabase SQL Editor
-- =====================================================

-- Supprimer la fonction si elle existe déjà
DROP FUNCTION IF EXISTS public.get_user_order_stats(user_uuid UUID);

-- Créer la fonction pour récupérer les statistiques des commandes
CREATE OR REPLACE FUNCTION public.get_user_order_stats(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    total_orders INTEGER;
    paid_orders INTEGER;
    pending_orders INTEGER;
    failed_orders INTEGER;
    cancelled_orders INTEGER;
    total_spent NUMERIC;
    can_order_more BOOLEAN;
BEGIN
    -- Vérifier que l'utilisateur est authentifié
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié';
    END IF;
    
    -- Vérifier que l'utilisateur demande ses propres statistiques
    IF auth.uid() != user_uuid THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;
    
    -- Compter les commandes par statut
    SELECT 
        COUNT(*) FILTER (WHERE status = 'paid') INTO paid_orders
    FROM orders 
    WHERE user_id = user_uuid;
    
    SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') INTO pending_orders
    FROM orders 
    WHERE user_id = user_uuid;
    
    SELECT 
        COUNT(*) FILTER (WHERE status = 'failed') INTO failed_orders
    FROM orders 
    WHERE user_id = user_uuid;
    
    SELECT 
        COUNT(*) FILTER (WHERE status = 'cancelled') INTO cancelled_orders
    FROM orders 
    WHERE user_id = user_uuid;
    
    -- Total des commandes
    total_orders := COALESCE(paid_orders, 0) + COALESCE(pending_orders, 0) + COALESCE(failed_orders, 0) + COALESCE(cancelled_orders, 0);
    
    -- Montant total dépensé (seulement les commandes payées)
    SELECT 
        COALESCE(SUM(total_price), 0) INTO total_spent
    FROM orders 
    WHERE user_id = user_uuid AND status = 'paid';
    
    -- Vérifier si l'utilisateur peut commander plus (limite de 2 cartes payées)
    can_order_more := COALESCE(paid_orders, 0) < 2;
    
    -- Construire le résultat JSON
    result := json_build_object(
        'total_orders', total_orders,
        'paid_orders', COALESCE(paid_orders, 0),
        'pending_orders', COALESCE(pending_orders, 0),
        'failed_orders', COALESCE(failed_orders, 0),
        'cancelled_orders', COALESCE(cancelled_orders, 0),
        'total_spent', total_spent,
        'can_order_more', can_order_more
    );
    
    RETURN result;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.get_user_order_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_order_stats(UUID) TO anon;

-- Commentaire pour la documentation
COMMENT ON FUNCTION public.get_user_order_stats(UUID) IS 
'Récupère les statistiques des commandes pour un utilisateur donné. Retourne un JSON avec le nombre de commandes par statut, le montant total dépensé et si l''utilisateur peut commander plus.';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Fonction get_user_order_stats créée avec succès !';
    RAISE NOTICE 'Vous pouvez maintenant l''utiliser via Supabase RPC';
    RAISE NOTICE 'Exemple: supabase.rpc("get_user_order_stats", { user_uuid: "..." })';
END $$;

-- Test de la fonction (optionnel - commentez si vous n'avez pas de données)
-- SELECT get_user_order_stats(auth.uid());
