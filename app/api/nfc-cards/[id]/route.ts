import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateNFCCardData } from '@/lib/types/nfc-cards'
import { revalidateProfile } from '@/lib/services/public-profile'

export const dynamic = 'force-dynamic'

interface NFCCardResponse {
  success: boolean
  card?: any
  data?: any
  error?: string
}

// GET - Récupérer une carte NFC spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<NFCCardResponse>> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const cardId = params.id
    if (!cardId) {
      return NextResponse.json({ success: false, error: 'ID de carte requis' }, { status: 400 })
    }

    const { data: card, error } = await supabase
      .from('digital_nfc_cards')
      .select(`
        id, user_id, profile_id, design_choice, color_theme, logo_url,
        status, preview_data, profile_name, nfc_link, full_name,
        company, job_title, phone, email, custom_url, created_at, updated_at
      `)
      .eq('id', cardId)
      .eq('user_id', user.id)
      .single()

    if (error || !card) {
      return NextResponse.json({ success: false, error: 'Carte non trouvée ou accès refusé' }, { status: 404 })
    }

    const p = card.preview_data || {}
    const formattedCard = {
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
      logo_url: card.logo_url || p.logo_url
    }

    return NextResponse.json({ success: true, card: formattedCard })

  } catch (error) {
    console.error('Erreur dans l\'API NFC card GET:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}

// PUT - Mettre à jour une carte NFC
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<NFCCardResponse>> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const cardId = params.id
    const body = await request.json() as UpdateNFCCardData

    if (!cardId) {
      return NextResponse.json({ success: false, error: 'ID de carte requis' }, { status: 400 })
    }

    // Vérification d'existence et appartenance
    const { data: existingCard, error: fetchError } = await supabase
      .from('digital_nfc_cards')
      .select('id, user_id, preview_data')
      .eq('id', cardId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCard) {
      return NextResponse.json({ success: false, error: 'Carte non trouvée ou accès refusé' }, { status: 404 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    const previewData: Record<string, any> = { ...((existingCard.preview_data as Record<string, any>) || {}) }

    // On peuple updateData et previewData avec les champs envoyés
    if (body.profile_name !== undefined) {
      const val = body.profile_name.substring(0, 255)
      previewData.profile_name = val
      updateData.profile_name = val
    }
    if (body.design_choice !== undefined) {
      updateData.design_choice = body.design_choice.substring(0, 100)
    }
    if (body.color_theme !== undefined) {
      updateData.color_theme = body.color_theme
      previewData.color_theme = body.color_theme
    }
    if (body.status !== undefined) {
      updateData.status = body.status === 'active' ? 'activated' : body.status
    }
    if (body.nfc_link !== undefined) {
      let nfcLink = body.nfc_link.trim()
      if (nfcLink && !nfcLink.startsWith('http')) {
        nfcLink = `https://${nfcLink}`
      }
      previewData.nfc_link = nfcLink
      updateData.nfc_link = nfcLink
    }
    if (body.profile_id !== undefined) {
      updateData.profile_id = body.profile_id
    }
    if (body.full_name !== undefined) {
      updateData.full_name = body.full_name
      previewData.full_name = body.full_name
    }
    if (body.company !== undefined) {
      updateData.company = body.company
      previewData.company = body.company
    }
    if (body.job_title !== undefined) {
      updateData.job_title = body.job_title
      previewData.job_title = body.job_title
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone
      previewData.phone = body.phone
    }
    if (body.email !== undefined) {
      updateData.email = body.email
      previewData.email = body.email
    }
    if (body.location !== undefined) {
      updateData.location = body.location
      previewData.location = body.location
    }
    if (body.logo_url !== undefined) {
      updateData.logo_url = body.logo_url
      previewData.logo_url = body.logo_url
    }
    if (body.profile_photo_url !== undefined) {
      updateData.profile_photo_url = body.profile_photo_url
      previewData.profile_photo_url = body.profile_photo_url
    }

    updateData.preview_data = previewData

    const { data: updatedCard, error: updateError } = await supabase
      .from('digital_nfc_cards')
      .update(updateData)
      .eq('id', cardId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour NFC:', updateError)
      return NextResponse.json({ success: false, error: 'Erreur technique' }, { status: 500 })
    }

    // ✅ SYNC BACK TO PROFILE: update linked profile if present
    if (updatedCard.profile_id) {
      const profileUpdates: any = {}
      if (body.full_name !== undefined) profileUpdates.name = body.full_name
      if (body.company !== undefined) profileUpdates.company = body.company
      if (body.job_title !== undefined) profileUpdates.job_title = body.job_title

      if (body.phone !== undefined) profileUpdates.phone = body.phone
      if (body.email !== undefined) profileUpdates.email = body.email
      if (body.location !== undefined) profileUpdates.location = body.location
      if (body.logo_url !== undefined || body.profile_photo_url !== undefined) {
        profileUpdates.image_url = body.profile_photo_url || body.logo_url
      }
      
      if (Object.keys(profileUpdates).length > 0) {
        await supabase
          .from('profiles')
          .update({
            ...profileUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedCard.profile_id)
          .eq('user_id', user.id)
      }
    }

    if (updatedCard.custom_url) {
      await revalidateProfile(updatedCard.custom_url)
    }
    if (updatedCard.username) {
      await revalidateProfile(updatedCard.username)
    }

    return NextResponse.json({ success: true, data: updatedCard })

  } catch (error) {
    console.error('Erreur API PUT:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une carte NFC
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<NFCCardResponse>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const { error } = await supabase
      .from('digital_nfc_cards')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ success: false, error: 'Erreur suppression' }, { status: 500 })
    }

    // Revalider tout profil public or nfc card cache
    await revalidateProfile('global')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}