import { createClient } from '@supabase/supabase-js'
import { assertSupabaseEnv, getSupabaseAnonKey, getSupabaseUrl } from './env'

export const createPublicClient = () => {
  assertSupabaseEnv('@supabase/supabase-js public client')
  return createClient(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  )
}
