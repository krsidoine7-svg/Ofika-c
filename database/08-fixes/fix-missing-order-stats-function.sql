-- =====================================================
-- CORRECTION : FONCTION MANQUANTE get_user_order_stats
-- =====================================================

-- Supprimer la fonction si elle existe déjà
DROP FUNCTION IF EXISTS public.get_user_order_stats(user_uuid UUID);

-- Créer la fonction pour récupérer les statistiques des commandes d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_order_stats(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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
    total_orders := paid_orders + pending_orders + failed_orders + cancelled_orders;
    
    -- Montant total dépensé (seulement les commandes payées)
    SELECT 
        COALESCE(SUM(total_price), 0) INTO total_spent
    FROM orders 
    WHERE user_id = user_uuid AND status = 'paid';
    
    -- Vérifier si l'utilisateur peut commander plus (limite de 2 cartes payées)
    can_order_more := paid_orders < 2;
    
    -- Construire le résultat JSON
    result := json_build_object(
        'total_orders', total_orders,
        'paid_orders', paid_orders,
        'pending_orders', pending_orders,
        'failed_orders', failed_orders,
        'cancelled_orders', cancelled_orders,
        'total_spent', total_spent,
        'can_order_more', can_order_more
    );
    
    RETURN result;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.get_user_order_stats(UUID) TO authenticated;

-- Commentaire pour la documentation
COMMENT ON FUNCTION public.get_user_order_stats(UUID) IS 
'Récupère les statistiques des commandes pour un utilisateur donné. Retourne un JSON avec le nombre de commandes par statut, le montant total dépensé et si l''utilisateur peut commander plus.';
