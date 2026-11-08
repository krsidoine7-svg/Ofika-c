// =====================================================
// Vérification "équipe Ofika" pour les routes API d'administration
// Le middleware ne protège que les pages /dashboard : chaque route /api/admin
// doit appeler requireStaff() elle-même avant toute action.
// =====================================================

import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole, type UserRole } from '@/lib/roles'

type StaffCheck =
  | { ok: true; user: User; role: UserRole }
  | { ok: false; response: NextResponse }

/**
 * Autorise uniquement les rôles ADMIN et TECH (mêmes règles que les pages /dashboard/admin).
 * Le rôle est lu en base (table users) ou dans app_metadata (modifiable seulement côté serveur),
 * jamais dans user_metadata, que l'utilisateur peut modifier lui-même.
 */
export async function requireStaff(): Promise<StaffCheck> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }

  let rawRole: string | undefined = (user.app_metadata as any)?.role
  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (dbUser?.role) rawRole = dbUser.role

  const role = normalizeRole(rawRole)
  if (role !== 'ADMIN' && role !== 'TECH') {
    return { ok: false, response: NextResponse.json({ error: 'Non autorisé' }, { status: 403 }) }
  }

  return { ok: true, user, role }
}
