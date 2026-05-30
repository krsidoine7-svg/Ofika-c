-- =====================================================
-- VÉRIFIER UN QR CODE SPÉCIFIQUE
-- =====================================================
-- Utilisez ce script pour voir où pointe votre QR code
-- =====================================================

-- Remplacez '0dSShblf' par votre short_code
DO $$
DECLARE
    v_short_code TEXT := '0dSShblf';  -- ⬅️ VOTRE SHORT CODE ICI
    v_nfc_link TEXT;
    v_title TEXT;
    v_is_active BOOLEAN;
    v_scan_count INTEGER;
BEGIN
    -- Récupérer les infos du QR code
    SELECT 
        nfc_link,
        title,
        is_active,
        scan_count
    INTO 
        v_nfc_link,
        v_title,
        v_is_active,
        v_scan_count
    FROM qr_redirects
    WHERE short_code = v_short_code;
    
    IF NOT FOUND THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '❌ QR CODE NON TROUVÉ';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Short code: %', v_short_code;
        RAISE NOTICE 'Ce QR code n''existe pas dans la base de données.';
        RAISE NOTICE '';
        RAISE NOTICE 'Actions possibles:';
        RAISE NOTICE '1. Vérifiez le short_code dans votre QR';
        RAISE NOTICE '2. Créez un nouveau QR code dans le dashboard';
        RAISE NOTICE '========================================';
    ELSE
        RAISE NOTICE '========================================';
        RAISE NOTICE '📱 INFORMATIONS DU QR CODE';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Short code: %', v_short_code;
        RAISE NOTICE 'Titre: %', COALESCE(v_title, '(Pas de titre)');
        RAISE NOTICE 'URL cible: %', v_nfc_link;
        RAISE NOTICE 'Statut: %', CASE WHEN v_is_active THEN '✅ ACTIF' ELSE '❌ DÉSACTIVÉ' END;
        RAISE NOTICE 'Nombre de scans: %', COALESCE(v_scan_count, 0);
        RAISE NOTICE '========================================';
        RAISE NOTICE '';
        RAISE NOTICE 'Quand vous scannez ce QR code:';
        RAISE NOTICE '1. Vous allez sur: http://localhost:3000/qr/%', v_short_code;
        RAISE NOTICE '2. Le système enregistre le scan';
        IF v_is_active THEN
            RAISE NOTICE '3. Vous êtes redirigé vers: %', v_nfc_link;
        ELSE
            RAISE NOTICE '3. ❌ ERREUR: QR code désactivé, pas de redirection';
        END IF;
        RAISE NOTICE '========================================';
    END IF;
END $$;

-- Afficher tous les détails en format tableau
SELECT 
    'Détails complets' as section,
    short_code,
    title,
    nfc_link,
    is_active,
    scan_count,
    created_at,
    updated_at
FROM qr_redirects
WHERE short_code = '0dSShblf';  -- ⬅️ VOTRE SHORT CODE ICI

-- Vérifier les derniers scans
SELECT 
    'Derniers scans' as section,
    scanned_at,
    user_agent,
    ip_address
FROM qr_scans
WHERE short_code = '0dSShblf'  -- ⬅️ VOTRE SHORT CODE ICI
ORDER BY scanned_at DESC
LIMIT 5;

-- Liste de TOUS les QR codes dans votre système
SELECT 
    '=== TOUS VOS QR CODES ===' as section,
    short_code,
    title,
    nfc_link,
    CASE WHEN is_active THEN '✅ Actif' ELSE '❌ Désactivé' END as statut,
    scan_count as scans,
    created_at
FROM qr_redirects
ORDER BY created_at DESC;
