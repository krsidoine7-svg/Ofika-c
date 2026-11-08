// =====================================================
// API ROUTE: POST /api/profiles/[id]/revalidate
// Vide le cache de la page publique après une modification faite depuis le
// navigateur (profil, template, photos…), pour qu'elle soit à jour tout de suite.
// =====================================================

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidateProfile } from '@/lib/services/public-profile'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Seul le propriétaire du profil peut demander la mise à jour
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, custom_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profil non trouvé ou non autorisé' }, { status: 404 })
  }

  await revalidateProfile(profile.custom_url || profile.username || 'global')
  return NextResponse.json({ success: true })
}
