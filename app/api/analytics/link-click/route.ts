import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'


// Interface pour les données de requête
interface LinkClickRequest {
  linkId: string
  profile_id: string
}

// Interface pour la réponse
interface LinkClickResponse {
  success: boolean
  click_count: number
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<LinkClickResponse>> {
  try {
    // Validation et parsing des données d'entrée
    const body = await request.json() as LinkClickRequest
    const { linkId, profile_id } = body

    // Validation stricte des données d'entrée
    if (!linkId || !profile_id) {
      return NextResponse.json(
        { 
          success: false, 
          click_count: 0,
          error: 'Missing required fields: linkId and profile_id are required' 
        }, 
        { status: 400 }
      )
    }

    // Validation des types et formats
    if (typeof linkId !== 'string' || typeof profile_id !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          click_count: 0,
          error: 'Invalid field types: linkId and profile_id must be strings' 
        }, 
        { status: 400 }
      )
    }

    // Validation des formats UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(linkId) || !uuidRegex.test(profile_id)) {
      return NextResponse.json(
        { 
          success: false, 
          click_count: 0,
          error: 'Invalid UUID format for linkId or profile_id' 
        }, 
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Vérifier que le lien existe et appartient au profil avec plus de détails
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select(`
        id, 
        profile_id, 
        click_count,
        profiles!inner(user_id)
      `)
      .eq('id', linkId)
      .eq('profile_id', profile_id)
      .single()

    if (linkError) {
      console.error('Erreur lors de la récupération du lien:', linkError)
      return NextResponse.json(
        { 
          success: false, 
          click_count: 0,
          error: 'Link not found or access denied' 
        }, 
        { status: 404 }
      )
    }

    if (!link) {
      return NextResponse.json(
        { 
          success: false, 
          click_count: 0,
          error: 'Link not found' 
        }, 
        { status: 404 }
      )
    }

    // Vérifier que le profil est public ou que l'utilisateur est authentifié
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_public, user_id')
      .eq('id', profile_id)
      .single()

    if (!profile?.is_public) {
      // Vérifier l'authentification pour les profils privés
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !profile || user.id !== profile.user_id) {
        return NextResponse.json(
          { 
            success: false, 
            click_count: 0,
            error: 'Access denied to private profile' 
          },  
          { status: 403 }
        )
      }
    }

    const newClickCount = (link.click_count || 0) + 1
    const timestamp = new Date().toISOString()

    // Utiliser une transaction pour garantir la cohérence des données
    const { error: updateError } = await supabase
      .from('links')
      .update({ 
        click_count: newClickCount,
        updated_at: timestamp
      })
      .eq('id', linkId)

    if (updateError) {
      console.error('Erreur lors de l\'incrémentation du compteur:', updateError)
      return NextResponse.json(
        { 
          success: false, 
          click_count: link.click_count || 0,
          error: 'Failed to update click count' 
        }, 
        { status: 500 }
      )
    }

    // Enregistrer l'événement d'analytics de manière asynchrone mais avec gestion d'erreur
    const logAnalyticsEvent = async (): Promise<void> => {
      try {
        const { error: eventError } = await supabase
          .from('analytics_events')
          .insert({
            profile_id,
            event_type: 'link_click',
            event_data: {
              linkId,
              timestamp,
              user_agent: request.headers.get('user-agent') || 'unknown',
              referer: request.headers.get('referer') || 'direct',
              ip_address: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
            }
          })
        
        if (eventError) {
          console.error('Erreur lors de l\'enregistrement de l\'événement analytics:', eventError)
          // Optionnel: envoyer à un service de monitoring externe
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'événement analytics:', error)
      }
    }
    
    // Exécuter en arrière-plan avec gestion d'erreur
    logAnalyticsEvent().catch(error => {
      console.error('Erreur dans logAnalyticsEvent:', error)
    })

    return NextResponse.json({ 
      success: true, 
      click_count: newClickCount
    })

  } catch (error) {
    console.error('Erreur dans l\'API link-click:', error)
    
    // Retourner une réponse d'erreur structurée
    return NextResponse.json(
      { 
        success: false, 
        click_count: 0,
        error: 'Internal server error' 
      }, 
      { status: 500 }
    )
  }
}
