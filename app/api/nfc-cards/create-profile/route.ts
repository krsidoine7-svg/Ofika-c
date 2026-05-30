import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'


// Schéma de validation pour la création de profil
const createProfileSchema = z.object({
  nfcCardId: z.string().uuid(),
  profileData: z.object({
    name: z.string().min(1, 'Nom requis'),
    type: z.enum(['professionnel', 'personnel', 'marque']),
    bio: z.string().min(1, 'Bio requise'),
    social_links: z.array(z.object({
      platform: z.string(),
      url: z.string(),
      label: z.string().optional()
    })).optional().default([]),
    customUrl: z.string().optional(),
    username: z.string().optional(),
    isPublic: z.boolean().default(true)
  })
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { nfcCardId, profileData } = createProfileSchema.parse(body)

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

    // Vérifier la limite de 3 profils par utilisateur
    const { data: existingProfiles, error: countError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting profiles:', countError)
      return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 })
    }

    if ((existingProfiles?.length || 0) >= 3) {
      return NextResponse.json({ error: 'Limite de 3 profils atteinte' }, { status: 400 })
    }

    // Créer le profil avec social_links au format JSONB
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        profile_type: profileData.type,
        name: profileData.name,
        bio: profileData.bio,
        social_links: profileData.social_links || [],
        custom_url: profileData.customUrl,
        username: profileData.username,
        is_public: profileData.isPublic,
        is_active: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json({ error: 'Erreur lors de la création du profil' }, { status: 500 })
    }

    // Générer l'URL publique du profil
    const publicUrl = profileData.customUrl 
      ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/${profileData.customUrl}`
      : `${process.env.NEXT_PUBLIC_APP_URL || ''}/card/${newProfile.id}`

    // Mettre à jour la carte NFC avec l'association
    const previewData = { ...((nfcCard.preview_data as object) || {}) }
    ;(previewData as any).nfc_link = publicUrl

    const { error: updateError } = await supabase
      .from('digital_nfc_cards')
      .update({
        profile_id: newProfile.id,
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
      message: 'Profil créé et associé avec succès',
      data: {
        nfcCardId,
        profileId: newProfile.id,
        publicUrl
      }
    })

  } catch (error) {
    console.error('Error in create-profile API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
