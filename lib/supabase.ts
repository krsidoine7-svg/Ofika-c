import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  throw new Error(
    'Missing Supabase URL: NEXT_PUBLIC_SUPABASE_URL environment variable is required'
  )
}

if (!supabasePublishableKey) {
  throw new Error(
    'Missing Supabase Key: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable is required'
  )
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Fonction pour vérifier la configuration
export function checkSupabaseConfig() {
  const config = {
    url: !!supabaseUrl,
    publishableKey: !!supabasePublishableKey,
  }
  
  console.log('Supabase Configuration:', config)
  return config
}
