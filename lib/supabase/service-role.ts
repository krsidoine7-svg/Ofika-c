import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase utilisant la PUBLISHABLE_KEY
 * À utiliser côté serveur uniquement.
 * Les accès sont contrôlés par les politiques RLS de Supabase.
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Variables d\'environnement Supabase manquantes (URL ou PUBLISHABLE_KEY)')
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
