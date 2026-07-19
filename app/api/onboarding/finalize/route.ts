// =====================================================
// API ENDPOINT - FINALISER ONBOARDING APRÈS AUTH
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQRCode } from '@/lib/services/qr-code'
import { z } from 'zod'

export const dynamic = 'force-dynamic'


// Schéma de validation pour la finalisation
const finalizeSchema = z.object({
  session_id: z.string().min(1, 'Session ID requis'),
  flow_type: z.enum(['public_page', 'nfc_card']),
})

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

// Générer un username unique
async function generateUniqueUsername(supabase: any, baseName: string): Promise<string> {
  let username = baseName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20)

  let suffix = 0
  let isUnique = false

  while (!isUnique && suffix < 100) {
    const testUsername = suffix === 0 ? username : `${username}${suffix}`
    
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', testUsername)
      .single()

    if (!data) {
      username = testUsername
      isUnique = true
    } else {
      suffix++
    }
  }

  if (!isUnique) {
    username = `${username}${Date.now()}`
  }

  return username
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting par IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    if (!checkRateLimit(ip, 10, 60000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans une minute.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validation avec Zod
    const validationResult = finalizeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { session_id, flow_type } = validationResult.data

    const supabase = await createClient()

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    const mappedType = flow_type === 'nfc_card' ? 'nfc' : 'public_page'

    // Récupérer les données temporaires
    const { data: pendingData, error: fetchError } = await supabase
      .from('pending_creations')
      .select('*')
      .eq('session_id', session_id)
      .eq('type', mappedType)
      .single()

    if (fetchError || !pendingData) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    const payload = pendingData.payload

    let result

    // Traitement selon le type de flow
    if (flow_type === 'public_page') {
      // Créer le profil
      const username = await generateUniqueUsername(
        supabase,
        payload.name || payload.full_name || user.email?.split('@')[0] || 'user'
      )

      const profileData = {
        user_id: user.id,
        name: payload.name || payload.full_name,
        username,
        custom_url: payload.custom_url || username,
        bio: payload.bio,
        email: payload.email || user.email,
        phone: payload.phone,
        image_url: payload.image_url,
        background_image_url: payload.background_image_url,
        social_links: payload.social_links || [],
        custom_links: payload.custom_links || [],
        design: payload.design || 'design1',
        primary_color: payload.primary_color || '#3b82f6',
        is_public: true,
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return NextResponse.json(
          { error: 'Erreur lors de la création du profil' },
          { status: 500 }
        )
      }

      result = { type: 'profile', data: profile }

    } else if (flow_type === 'nfc_card') {
      const nfcData = {
        user_id: user.id,
        design_choice: payload.design || 'design-classic',
        color_theme: payload.color || 'black',
        preview_data: payload,
        status: 'draft',
        profile_id: payload.profile_id || null,
        logo_url: payload.logo_url || payload.custom_logo_url || null,
        card_type: 'physical',
        full_name: payload.full_name || payload.name || '',
        company: payload.company || '',
        job_title: payload.job_title || payload.jobTitle || '',
        phone: payload.phone || '',
        email: payload.email || '',
        profile_name: payload.profile_name || 'Ma Carte',
        custom_url: payload.custom_url || payload.username || ''
      }

      const { data: nfcCard, error: nfcError } = await supabase
        .from('digital_nfc_cards')
        .insert(nfcData)
        .select()
        .single()

      if (nfcError) {
        console.error('Error creating NFC card:', nfcError)
        return NextResponse.json(
          { error: 'Erreur lors de la création de la carte NFC' },
          { status: 500 }
        )
      }

      // Générer l'URL NFC
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.com'
      const nfcLink = `${appUrl}/card/${nfcCard.id}`

      // Générer le QR code dynamique
      const qrResult = await generateQRCode(nfcLink)
      
      let qrCodeUrl = ''
      let redirectId = ''
      
      if (qrResult.success && qrResult.data) {
        qrCodeUrl = qrResult.data.qr_code_url
        redirectId = qrResult.data.redirect_id || ''

        // Mettre à jour la carte paramétrée
        const updatedPreviewData = {
          ...payload,
          nfc_link: nfcLink,
          qr_code_url: qrCodeUrl,
          qr_redirect_id: redirectId
        }

        await supabase
          .from('digital_nfc_cards')
          .update({
            preview_data: updatedPreviewData,
            nfc_link: nfcLink,
            qr_code_url: qrCodeUrl,
            qr_redirect_id: redirectId,
            updated_at: new Date().toISOString()
          })
          .eq('id', nfcCard.id)

        nfcCard.preview_data = updatedPreviewData
      }

      result = { type: 'nfc_card', data: nfcCard }
    } else {
      return NextResponse.json(
        { error: 'Type de flow invalide' },
        { status: 400 }
      )
    }

    // Supprimer les données temporaires
    await supabase
      .from('pending_creations')
      .delete()
      .eq('session_id', session_id)

    return NextResponse.json({
      success: true,
      result,
      message: 'Onboarding finalisé avec succès'
    })

  } catch (error) {
    console.error('Error in finalize endpoint:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Endpoint pour nettoyer les sessions expirées (> 7 jours)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérifier que c'est un admin ou un cron job
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { error } = await supabase
      .from('pending_creations')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString())

    if (error) {
      console.error('Error cleaning up old sessions:', error)
      return NextResponse.json(
        { error: 'Erreur lors du nettoyage' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Sessions expirées nettoyées'
    })

  } catch (error) {
    console.error('Error in cleanup endpoint:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
