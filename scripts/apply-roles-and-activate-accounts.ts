import postgres from 'postgres'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.local') })

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { prepare: false })

async function run() {
  console.log("🚀 Mise à jour de la contrainte CHECK et attribution des rôles ADMIN & TECH...")

  // 1. Mettre à jour la contrainte CHECK pour accepter 'tech' et 'TECH'
  await sql`
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
  `
  await sql`
    ALTER TABLE public.users 
    ADD CONSTRAINT users_role_check 
    CHECK (role IN ('client', 'admin', 'tech', 'super_admin', 'CLIENT', 'ADMIN', 'TECH'));
  `
  console.log("✅ Contrainte users_role_check mise à jour avec succès.")

  // 2. Mettre à jour la fonction de synchronisation JWT
  await sql`
    CREATE OR REPLACE FUNCTION public.sync_user_role_to_jwt()
    RETURNS trigger AS $$
    DECLARE
      normalized_role text;
    BEGIN
      normalized_role := LOWER(NEW.role);
      IF normalized_role = 'super_admin' THEN
        normalized_role := 'admin';
      END IF;

      UPDATE auth.users
      SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        json_build_object('role', normalized_role)::jsonb
      WHERE id = NEW.id::uuid;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  console.log("✅ Trigger function sync_user_role_to_jwt mise à jour.")

  // 3. Mettre à jour le rôle de admin.ofika@gmail.com dans public.users et auth.users
  await sql`
    UPDATE public.users 
    SET role = 'admin', subscription_tier = 'admin', updated_at = NOW()
    WHERE email = 'admin.ofika@gmail.com';
  `
  await sql`
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    WHERE email = 'admin.ofika@gmail.com';
  `
  console.log("✅ Compte admin.ofika@gmail.com configuré avec le rôle 'admin'.")

  // 4. Mettre à jour le rôle de tech.ofika@gmail.com dans public.users et auth.users
  await sql`
    UPDATE public.users 
    SET role = 'tech', subscription_tier = 'admin', updated_at = NOW()
    WHERE email = 'tech.ofika@gmail.com';
  `
  await sql`
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "tech"}'::jsonb
    WHERE email = 'tech.ofika@gmail.com';
  `
  console.log("✅ Compte tech.ofika@gmail.com configuré avec le rôle 'tech'.")

  // 5. Vérifier les rôles finaux
  const results = await sql`
    SELECT u.id, u.email, u.role, au.raw_app_meta_data->>'role' as jwt_role
    FROM public.users u
    JOIN auth.users au ON au.id = u.id::uuid
    WHERE u.email IN ('admin.ofika@gmail.com', 'tech.ofika@gmail.com');
  `
  console.log("\n📊 État final des comptes dans la base :")
  console.table(results)

  await sql.end()
}

run().catch(err => {
  console.error("❌ Erreur:", err)
  process.exit(1)
})
