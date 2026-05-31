import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

export const createClient = () => {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      // ✅ Headers globaux retirés pour permettre les uploads de fichiers
      // Le Content-Type doit être géré automatiquement par Supabase pour les uploads Storage
      // 'Content-Type: application/json' était appliqué à TOUTES les requêtes, y compris les uploads de fichiers
    }
  )
}
