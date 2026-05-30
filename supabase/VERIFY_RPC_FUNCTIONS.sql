-- =====================================================
-- VÉRIFICATION DES FONCTIONS RPC DANS SUPABASE
-- =====================================================
-- Ce script vérifie si toutes les fonctions RPC nécessaires existent
-- =====================================================

-- 1. Lister toutes les fonctions RPC existantes
SELECT 
    '=== FONCTIONS RPC EXISTANTES ===' as section,
    routine_name as fonction,
    routine_type as type,
    data_type as retour
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 2. Vérifier spécifiquement get_user_order_stats
SELECT 
    '=== VÉRIFICATION get_user_order_stats ===' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'get_user_order_stats'
        ) THEN '✅ EXISTE'
        ELSE '❌ MANQUANTE - Exécutez CREATE_ORDER_STATS_FUNCTION.sql'
    END as statut;

-- 3. Vérifier les permissions sur get_user_order_stats
SELECT 
    '=== PERMISSIONS get_user_order_stats ===' as section,
    grantee as role,
    privilege_type as permission
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'get_user_order_stats'
ORDER BY grantee;

-- 4. Vérifier la table orders (nécessaire pour la fonction)
SELECT 
    '=== TABLE ORDERS ===' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'orders'
        ) THEN '✅ EXISTE'
        ELSE '❌ MANQUANTE - Créez la table orders'
    END as statut;

-- 5. Vérifier les colonnes de la table orders
SELECT 
    '=== COLONNES TABLE ORDERS ===' as section,
    column_name as colonne,
    data_type as type,
    is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
ORDER BY ordinal_position;

-- 6. DIAGNOSTIC FINAL
DO $$
DECLARE
    has_function BOOLEAN;
    has_table BOOLEAN;
    has_permissions BOOLEAN;
BEGIN
    -- Vérifier la fonction
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'get_user_order_stats'
    ) INTO has_function;
    
    -- Vérifier la table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
    ) INTO has_table;
    
    -- Vérifier les permissions
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routine_privileges
        WHERE routine_schema = 'public'
        AND routine_name = 'get_user_order_stats'
        AND grantee = 'authenticated'
    ) INTO has_permissions;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSTIC DES FONCTIONS RPC';
    RAISE NOTICE '========================================';
    
    IF has_function THEN
        RAISE NOTICE '✅ Fonction get_user_order_stats : EXISTE';
    ELSE
        RAISE NOTICE '❌ Fonction get_user_order_stats : MANQUANTE';
        RAISE NOTICE 'Action: Exécutez CREATE_ORDER_STATS_FUNCTION.sql';
    END IF;
    
    IF has_table THEN
        RAISE NOTICE '✅ Table orders : EXISTE';
    ELSE
        RAISE NOTICE '❌ Table orders : MANQUANTE';
        RAISE NOTICE 'Action: Créez la table orders dans votre schéma';
    END IF;
    
    IF has_permissions THEN
        RAISE NOTICE '✅ Permissions : CONFIGURÉES';
    ELSE
        RAISE NOTICE '⚠️  Permissions : MANQUANTES ou INCOMPLÈTES';
        RAISE NOTICE 'Action: Réexécutez CREATE_ORDER_STATS_FUNCTION.sql';
    END IF;
    
    RAISE NOTICE '========================================';
    
    IF has_function AND has_table AND has_permissions THEN
        RAISE NOTICE '🎉 Tout est OK ! L''erreur 404 devrait disparaître.';
    ELSE
        RAISE NOTICE '⚠️  Des éléments sont manquants. Suivez les actions ci-dessus.';
    END IF;
END $$;
