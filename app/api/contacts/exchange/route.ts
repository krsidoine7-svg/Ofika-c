// =====================================================
// POST /api/contacts/exchange
// Un visiteur laisse ses coordonnées sur un profil public (bouton « Échanger »).
// → enregistre le contact + prévient le propriétaire (cloche + push).
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { checkRateLimit } from '@/lib/security/rate-limiting'
import { getProfileOwner, notifyUser } from '@/lib/notifications/server'

export const dynamic = 'force-dynamic'

const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s.length ? s : null
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    // 50 envois / heure / IP (config « contact »)
    const rl = checkRateLimit(request, 'contact')
    if (!rl.allowed) return NextResponse.json({ error: 'Trop de demandes, réessayez plus tard.' }, { status: 429 })

    const body = await request.json().catch(() => null)
    const profileId = clean(body?.profileId, 64)
    const name = clean(body?.name, 120)
    const email = clean(body?.email, 160)
    const phone = clean(body?.phone, 40)
    if (!profileId || !name) return NextResponse.json({ error: 'Nom manquant.' }, { status: 400 })
    if (!email && !phone) return NextResponse.json({ error: 'Indiquez un e-mail ou un téléphone.' }, { status: 400 })
    if (email && !EMAIL.test(email)) return NextResponse.json({ error: 'E-mail invalide.' }, { status: 400 })

    const admin = createAdminClient()
    // Le profil doit exister et être public
    const { data: profile } = await admin.from('profiles').select('id').eq('id', profileId).eq('is_public', true).eq('is_active', true).maybeSingle()
    if (!profile) return NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 })

    const { error } = await admin.from('captured_contacts').insert({
      profile_id: profileId,
      name,
      email,
      phone,
      company: clean(body?.company, 120),
      job_title: clean(body?.job_title, 120),
      message: clean(body?.message, 1000),
    })
    if (error) {
      console.error('[exchange] Insertion impossible', error.message)
      return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 })
    }

    // Prévenir le propriétaire du profil
    const owner = await getProfileOwner(profileId)
    if (owner) {
      await notifyUser(owner.userId, {
        type: 'new_contact',
        title: '🤝 Nouveau contact',
        message: `${name} vous a laissé ses coordonnées. Recontactez-le vite !`,
        url: '/dashboard/contacts',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[exchange] Erreur', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
