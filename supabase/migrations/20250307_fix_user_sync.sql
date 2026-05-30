-- =====================================================
-- MIGRATION: Correction de la synchronisation Auth -> Public
-- Date: 2025-03-07
-- Description: Assure que le nom et le téléphone sont correctement synchronisés
-- =====================================================

-- 1. Mise à jour de la fonction de trigger pour inclure le téléphone et plus de clés de métadonnées
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_full_name TEXT;
    v_phone TEXT;
BEGIN
    -- Extraction du nom complet depuis diverses clés possibles
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'fullName',
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'display_name',
        ''
    );

    -- Extraction du téléphone (champ direct auth.users ou metadata)
    v_phone := COALESCE(
        new.phone,
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'phoneNumber',
        new.raw_user_meta_data->>'telephone',
        new.raw_user_meta_data->>'mobile'
    );

    INSERT INTO public.users (
        id, 
        email, 
        phone,
        name, 
        image, 
        created_at, 
        updated_at,
        last_login
    )
    VALUES (
        new.id::text,
        new.email,
        v_phone,
        v_full_name,
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        COALESCE(new.created_at, now()),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        -- On met à jour le nom si celui en base est vide
        name = CASE 
            WHEN public.users.name IS NULL OR public.users.name = '' 
            THEN EXCLUDED.name 
            ELSE public.users.name 
        END,
        image = CASE 
            WHEN public.users.image IS NULL OR public.users.image = '' 
            THEN EXCLUDED.image 
            ELSE public.users.image 
        END,
        updated_at = now(),
        last_login = now();
        
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-appliquer le trigger pour être sûr
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Rétro-synchronisation massive pour corriger les utilisateurs existants
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT * FROM auth.users LOOP
        UPDATE public.users
        SET 
            name = COALESCE(
                r.raw_user_meta_data->>'full_name',
                r.raw_user_meta_data->>'fullName',
                r.raw_user_meta_data->>'name',
                r.raw_user_meta_data->>'display_name',
                name
            ),
            phone = COALESCE(
                r.phone,
                r.raw_user_meta_data->>'phone',
                r.raw_user_meta_data->>'phoneNumber',
                r.raw_user_meta_data->>'telephone',
                r.raw_user_meta_data->>'mobile',
                phone
            ),
            updated_at = now()
        WHERE id::text = r.id::text
        AND (
            name IS NULL OR name = '' OR
            phone IS NULL OR phone = ''
        );
    END LOOP;
END $$;
