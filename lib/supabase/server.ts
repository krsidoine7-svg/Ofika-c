import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

export const createClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorer si appelé depuis un Server Component
          }
        },
      },
      // ✅ Headers globaux retirés pour permettre les uploads de fichiers
      // Le Content-Type doit être géré automatiquement par Supabase
    }
  )
}