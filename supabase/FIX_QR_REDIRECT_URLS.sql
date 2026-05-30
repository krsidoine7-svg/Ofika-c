-- =====================================================
-- CORRECTION : URLs de Redirection QR Code Incorrectes
-- =====================================================
-- Ce script corrige les QR codes qui pointent vers de mauvaises URLs
-- =====================================================

-- 1. DIAGNOSTIC : Afficher tous les QR codes avec URLs incorrectes
SELECT 
    '=== QR CODES AVEC PROBLÈMES ===' as section,
    qr.short_code,
    qr.nfc_link as "URL Actuelle (Incorrecte)",
    CONCAT(
        'http://localhost:3000/', 
        COALESCE(p.custom_url, p.username, 'profil')
    ) as "URL Correcte",
    p.name as "Nom du Profil",
    qr.is_active as "Actif"
FROM qr_redirects qr
LEFT JOIN nfc_profiles nfc ON nfc.qr_redirect_id = qr.id
LEFT JOIN profiles p ON p.id = nfc.profile_id
WHERE 
    qr.nfc_link LIKE '%vercel.app%' 
    OR qr.nfc_link LIKE '%1jghTtdTNaworId%'
    OR qr.nfc_link NOT LIKE '%localhost%'
ORDER BY qr.created_at DESC;

-- 2. VÉRIFIER VOTRE PROFIL
SELECT 
    '=== VOTRE PROFIL ===' as section,
    id,
    username,
    custom_url,
    name,
    CONCAT('http://localhost:3000/', COALESCE(custom_url, username)) as "URL à utiliser"
FROM profiles
WHERE user_id = auth.uid();

-- 3. CORRECTION AUTOMATIQUE
-- ⚠️ ATTENTION : Cette requête va modifier vos données !
-- Vérifiez d'abord les résultats ci-dessus avant d'exécuter

DO $$
DECLARE
    v_count INTEGER;
    v_short_code TEXT;
    v_old_url TEXT;
    v_new_url TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DÉBUT DE LA CORRECTION DES QR CODES';
    RAISE NOTICE '========================================';
    
    -- Corriger les QR codes liés à des profils NFC
    WITH corrections AS (
        SELECT 
            qr.id as qr_id,
            qr.short_code,
            qr.nfc_link as old_url,
            CONCAT(
                'http://localhost:3000/', 
                COALESCE(p.custom_url, p.username, 'profil')
            ) as new_url
        FROM qr_redirects qr
        LEFT JOIN nfc_profiles nfc ON nfc.qr_redirect_id = qr.id
        LEFT JOIN profiles p ON p.id = nfc.profile_id
        WHERE 
            (qr.nfc_link LIKE '%vercel.app%' 
            OR qr.nfc_link LIKE '%1jghTtdTNaworId%'
            OR qr.nfc_link NOT LIKE '%localhost%')
            AND p.username IS NOT NULL
    )
    UPDATE qr_redirects
    SET 
        nfc_link = corrections.new_url,
        updated_at = NOW()
    FROM corrections
    WHERE qr_redirects.id = corrections.qr_id
    RETURNING qr_redirects.short_code, corrections.old_url, qr_redirects.nfc_link
    INTO v_short_code, v_old_url, v_new_url;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    IF v_count > 0 THEN
        RAISE NOTICE '✅ % QR code(s) corrigé(s)', v_count;
        RAISE NOTICE 'Exemple :';
        RAISE NOTICE '  Short code: %', v_short_code;
        RAISE NOTICE '  Ancienne URL: %', v_old_url;
        RAISE NOTICE '  Nouvelle URL: %', v_new_url;
    ELSE
        RAISE NOTICE '⚠️ Aucun QR code trouvé à corriger';
        RAISE NOTICE 'Vérifiez les résultats de la section DIAGNOSTIC ci-dessus';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FIN DE LA CORRECTION';
    RAISE NOTICE '========================================';
END $$;

-- 4. VÉRIFICATION : Afficher les QR codes après correction
SELECT 
    '=== QR CODES APRÈS CORRECTION ===' as section,
    short_code,
    nfc_link,
    CASE 
        WHEN nfc_link LIKE '%localhost%' THEN '✅ Corrigé'
        WHEN nfc_link LIKE '%vercel.app%' THEN '❌ Toujours incorrect'
        ELSE '⚠️ À vérifier'
    END as statut,
    is_active,
    scan_count as scans,
    created_at
FROM qr_redirects
ORDER BY created_at DESC
LIMIT 10;

-- 5. CORRECTION MANUELLE POUR UN QR SPÉCIFIQUE
-- Décommentez et modifiez selon vos besoins :

/*
UPDATE qr_redirects
SET 
    nfc_link = 'http://localhost:3000/krsidoine',  -- ⬅️ VOTRE URL ICI
    updated_at = NOW()
WHERE short_code = '0dSShblf';  -- ⬅️ VOTRE SHORT CODE ICI

-- Vérifier
SELECT short_code, nfc_link FROM qr_redirects WHERE short_code = '0dSShblf';
*/

-- 6. CORRIGER AUSSI LES CARTES NFC
UPDATE nfc_profiles nfc
SET 
    nfc_link = CONCAT(
        'http://localhost:3000/', 
        COALESCE(p.custom_url, p.username)
    ),
    updated_at = NOW()
FROM profiles p
WHERE 
    nfc.profile_id = p.id
    AND (
        nfc.nfc_link LIKE '%vercel.app%'
        OR nfc.nfc_link LIKE '%1jghTtdTNaworId%'
        OR nfc.nfc_link NOT LIKE '%localhost%'
    );

-- 7. RAPPORT FINAL
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RAPPORT FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'QR codes actifs: %', (SELECT COUNT(*) FROM qr_redirects WHERE is_active = true);
    RAISE NOTICE 'QR codes avec localhost: %', (SELECT COUNT(*) FROM qr_redirects WHERE nfc_link LIKE '%localhost%');
    RAISE NOTICE 'QR codes avec vercel: %', (SELECT COUNT(*) FROM qr_redirects WHERE nfc_link LIKE '%vercel%');
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Correction terminée !';
    RAISE NOTICE 'Testez votre QR code : http://localhost:3000/qr/0dSShblf';
    RAISE NOTICE '========================================';
END $$;
