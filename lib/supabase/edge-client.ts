import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Client optimisé pour l'Edge Runtime
export const createEdgeClient = () => {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false, // Désactiver la persistance de session pour l'Edge Runtime
      autoRefreshToken: false, // Désactiver le refresh automatique
      detectSessionInUrl: false, // Désactiver la détection de session dans l'URL
    }
  })
}
