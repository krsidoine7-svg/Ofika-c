import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase avec la SERVICE_ROLE_KEY.
 * ⚠️ À utiliser UNIQUEMENT côté serveur (API routes, Server Actions).
 * Ce client bypasse les RLS et a les droits admin complets.
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Variables d\'environnement Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY). ' +
      'Vérifiez votre fichier .env.local'
    )
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
