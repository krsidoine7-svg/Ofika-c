// =====================================================
// API ROUTE: PATCH /api/profiles/[id]/theme
// Enregistre la personnalisation d'une page publique :
// - couleurs (fond + accent) dans profiles.theme_settings
// - ordre des liens personnalisés (réordonne profiles.custom_links)
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidateProfile } from '@/lib/services/public-profile'
import { isCurrentTemplate, resolveTemplateId } from '@/lib/templates/registry'

export const dynamic = 'force-dynamic'

const HEX_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Le profil doit appartenir à l'utilisateur connecté
    const { data: profile, error: checkError } = await supabase
      .from('profiles')
      .select('id, username, custom_url, custom_links, design_choice')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !profile) {
      return NextResponse.json({ error: 'Profil non trouvé ou non autorisé' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }

    // --- Couleurs ---
    // Chaque couleur est facultative : absente/null = le template garde sa couleur d'origine
    const { primary_color, secondary_color, link_order } = body as Record<string, unknown>
    const themeSettings: Record<string, string> = {}
    for (const [key, value] of [['primary_color', primary_color], ['secondary_color', secondary_color]] as const) {
      if (value === null || value === undefined) continue
      if (typeof value !== 'string' || !HEX_REGEX.test(value)) {
        return NextResponse.json({ error: 'Couleur invalide (format attendu : #RRGGBB)' }, { status: 400 })
      }
      themeSettings[key] = value
    }

    // --- Ordre des liens : doit être une permutation exacte des liens existants ---
    const currentLinks: any[] = Array.isArray(profile.custom_links) ? profile.custom_links : []
    let reorderedLinks: any[] | null = null
    if (link_order !== undefined) {
      const isPermutation =
        Array.isArray(link_order) &&
        link_order.length === currentLinks.length &&
        link_order.every((i) => Number.isInteger(i) && i >= 0 && i < currentLinks.length) &&
        new Set(link_order).size === currentLinks.length
      if (!isPermutation) {
        return NextResponse.json({ error: 'Ordre des liens invalide, rechargez la page' }, { status: 400 })
      }
      reorderedLinks = (link_order as number[]).map((i) => currentLinks[i])
    }

    const update: Record<string, unknown> = {
      theme_settings: themeSettings,
      updated_at: new Date().toISOString()
    }
    if (reorderedLinks) update.custom_links = reorderedLinks
    // Ancien design : on passe sur le nouveau template correspondant, sinon les couleurs seraient ignorées
    if (!isCurrentTemplate(profile.design_choice)) update.design_choice = resolveTemplateId(profile.design_choice)

    let { error: updateError } = await supabase.from('profiles').update(update).eq('id', id)

    // Colonne theme_settings absente (migration non appliquée) : on enregistre au moins l'ordre des liens
    let themeSaved = true
    if (updateError && updateError.code === '42703') {
      themeSaved = false
      delete update.theme_settings
      ;({ error: updateError } = await supabase.from('profiles').update(update).eq('id', id))
    }

    if (updateError) {
      console.error('Error updating profile theme:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
    }

    if (profile.username) await revalidateProfile(profile.username)
    if (profile.custom_url) await revalidateProfile(profile.custom_url)

    if (!themeSaved) {
      return NextResponse.json(
        {
          success: false,
          error: "Les couleurs n'ont pas pu être enregistrées : la colonne theme_settings manque en base (migration à appliquer). L'ordre des liens, lui, est enregistré."
        },
        { status: 503 }
      )
    }

    return NextResponse.json({ success: true, theme_settings: themeSettings })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/profiles/[id]/theme:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
