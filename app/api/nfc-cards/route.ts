import { NextRequest, NextResponse } from 'next/server'

// Forcer le rendu dynamique pour cette route API
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

// Interface pour la réponse
interface NFCCardsResponse {
  success: boolean
  cards?: any[]
  error?: string
}

// GET - Récupérer les cartes NFC d'un utilisateur
export async function GET(request: NextRequest): Promise<NextResponse<NFCCardsResponse>> {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer les cartes NFC de l'utilisateur
    const { data: cards, error } = await supabase
      .from('digital_nfc_cards')
      .select(`
        id,
        user_id,
        profile_id,
        design_choice,
        color_theme,
        logo_url,
        status,
        preview_data,
        nfc_link,
        qr_code_url,
        full_name,
        company,
        job_title,
        phone,
        email,
        profile_name,
        custom_url,
        created_at,
        updated_at,
        card_type
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des cartes NFC:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des cartes' },
        { status: 500 }
      )
    }

    const formattedCards = (cards || []).map(card => {
      const p = card.preview_data || {}
      return {
        id: card.id,
        profile_name: card.profile_name || p.profile_name || 'Carte',
        nfc_link: card.nfc_link || p.nfc_link,
        design_choice: card.design_choice || 'design-classic',
        color_theme: card.color_theme || 'black',
        status: card.status === 'activated' ? 'active' : card.status,
        created_at: card.created_at,
        updated_at: card.updated_at,
        profile_id: card.profile_id,
        username: card.custom_url || p.username,
        custom_url: card.custom_url || p.custom_url,
        full_name: card.full_name || p.full_name,
        company: card.company || p.company,
        job_title: card.job_title || p.job_title,
        phone: card.phone || p.phone,
        email: card.email || p.email,
        logo_url: card.logo_url || p.logo_url,
        card_type: card.card_type
      }
    })

    return NextResponse.json({
      success: true,
      cards: formattedCards
    })

  } catch (error) {
    console.error('Erreur dans l\'API NFC cards GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
