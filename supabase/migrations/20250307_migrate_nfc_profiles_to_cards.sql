-- =====================================================
-- MIGRATION: nfc_profiles -> nfc_cards
-- Date: 2025-03-07
-- =====================================================

DO $$ 
BEGIN
    -- 1. Migration des données
    INSERT INTO public.nfc_cards (
        id,
        user_id,
        profile_id,
        design_id,
        color_theme,
        custom_logo_url,
        status,
        preview_data,
        created_at,
        updated_at
    )
    SELECT 
        id,
        user_id,
        profile_id,
        COALESCE(design_choice, 'design-classic') as design_id,
        COALESCE(color_theme, 'orange') as color_theme,
        logo_url as custom_logo_url,
        CASE 
            WHEN status = 'active' THEN 'activated'::text
            WHEN status = 'shipped' THEN 'shipped'::text
            WHEN status = 'delivered' THEN 'delivered'::text
            WHEN status = 'ordered' THEN 'ordered'::text
            ELSE 'draft'::text
        END as status,
        jsonb_strip_nulls(jsonb_build_object(
            'profile_name', profile_name,
            'nfc_link', nfc_link,
            'qr_code_url', qr_code_url,
            'full_name', full_name,
            'company', company,
            'job_title', job_title,
            'phone', phone,
            'email', email,
            'logo_url', logo_url,
            'profile_photo_url', profile_photo_url,
            'custom_url', custom_url,
            'migrated_at', NOW()
        )) as preview_data,
        created_at,
        updated_at
    FROM public.nfc_profiles
    ON CONFLICT (id) DO UPDATE SET
        preview_data = EXCLUDED.preview_data,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at;

    RAISE NOTICE 'Migration terminée avec succès';
END $$;
