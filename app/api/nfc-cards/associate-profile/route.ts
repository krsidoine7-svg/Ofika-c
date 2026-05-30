import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'


// Schéma de validation
const associateProfileSchema = z.object({
  nfcCardId: z.string().uuid(),
  profileId: z.string().uuid()
})

export async function POST(request: NextRequest) {
  try {
    // Import dynamique pour éviter les conflits de build
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { nfcCardId, profileId } = associateProfileSchema.parse(body)

    // Vérifier que la carte NFC appartient à l'utilisateur
    const { data: nfcCard, error: cardError } = await supabase
      .from('digital_nfc_cards')
      .select('id, user_id, preview_data')
      .eq('id', nfcCardId)
      .eq('user_id', user.id)
      .single()

    if (cardError || !nfcCard) {
      return NextResponse.json({ error: 'Carte NFC non trouvée' }, { status: 404 })
    }

    // Vérifier que le profil appartient à l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, custom_url')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    // Générer l'URL publique du profil
    const publicUrl = profile.custom_url 
      ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/${profile.custom_url}`
      : `${process.env.NEXT_PUBLIC_APP_URL || ''}/card/${profileId}`

    // Mettre à jour la carte NFC avec l'association
    const previewData = { ...((nfcCard.preview_data as object) || {}) }
    ;(previewData as any).nfc_link = publicUrl

    const { error: updateError } = await supabase
      .from('digital_nfc_cards')
      .update({
        profile_id: profileId,
        nfc_link: publicUrl,
        preview_data: previewData,
        updated_at: new Date().toISOString()
      })
      .eq('id', nfcCardId)

    if (updateError) {
      console.error('Error updating NFC card:', updateError)
      return NextResponse.json({ error: 'Erreur lors de l\'association' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profil associé avec succès',
      data: {
        nfcCardId,
        profileId,
        publicUrl
      }
    })

  } catch (error) {
    console.error('Error in associate-profile API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}