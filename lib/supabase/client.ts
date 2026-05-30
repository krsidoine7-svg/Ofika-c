import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // ✅ Headers globaux retirés pour permettre les uploads de fichiers
      // Le Content-Type doit être géré automatiquement par Supabase pour les uploads Storage
      // 'Content-Type: application/json' était appliqué à TOUTES les requêtes, y compris les uploads de fichiers
    }
  )
}
