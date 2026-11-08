import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { assertSupabaseEnv, getSupabaseAnonKey, getSupabaseUrl } from './supabase/env'

let supabaseSingleton: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseSingleton) {
    assertSupabaseEnv('lib/supabase')
    supabaseSingleton = createClient(getSupabaseUrl(), getSupabaseAnonKey())
  }
  return supabaseSingleton
}

/** @deprecated Préférez getSupabaseClient() pour éviter l'init au chargement du module */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseClient(), prop, receiver)
  },
})

export function checkSupabaseConfig() {
  const config = {
    url: Boolean(getSupabaseUrl()),
    publishableKey: Boolean(getSupabaseAnonKey()),
  }

  console.log('Supabase Configuration:', config)
  return config
}
