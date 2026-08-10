import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { createRateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/security/rate-limiter'
import { InputSanitizer } from '@/lib/security/input-sanitizer'
import { generateWavePaymentUrl, WaveApiConfig } from '@/lib/services/wave-api'

export const dynamic = 'force-dynamic'

/**
 * API Route pour créer un paiement Wave Direct
 * POST /api/payments/wave/create
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Route Wave - Création de paiement direct')
    
    // Rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.payment)
    const rateLimitResponse = await rateLimitMiddleware(request)
    if (rateLimitResponse) return rateLimitResponse
    
    // Protection de la route
    const protectionResponse = await AuthGuard.protectRoute(request, {
      requireAuth: true,
      allowedMethods: ['POST'],
      validateData: true
    })
    if (protectionResponse) return protectionResponse

    // 1. Récupérer la configuration depuis la DB
    const supabase = await createClient()
    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .single()

    const waveConfig = dbConfig?.value?.wave || {}
    const isWaveActive = waveConfig.is_active ?? true
    
    if (!isWaveActive) {
      return NextResponse.json(
        { success: false, error: 'La méthode de paiement Wave Direct est temporairement désactivée par l\'administrateur.' },
        { status: 403 }
      )
    }

    // Récupérer les données de paiement et les sanitiser
    const rawData = await request.json()
    const paymentData = InputSanitizer.sanitizeObject(rawData)
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Montant invalide (doit être > 0)' },
        { status: 400 }
      )
    }

    if (!paymentData.order_id) {
      return NextResponse.json(
        { success: false, error: 'order_id est requis' },
        { status: 400 }
      )
    }

    // Vérifier que la commande existe et appartient à l'utilisateur
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, total_cents, payment_status')
      .eq('id', paymentData.order_id)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Commande non trouvée ou non autorisée' },
        { status: 404 }
      )
    }

    // Déterminer le lien de paiement (utiliser le lien configuré en DB s'il existe, sinon générer dynamiquement)
    let paymentLink = waveConfig.wave_payment_link
    if (!paymentLink) {
      paymentLink = generateWavePaymentUrl({
        amount: paymentData.amount,
        orderId: paymentData.order_id,
        merchantId: waveConfig.wave_merchant_id || WaveApiConfig.merchantId,
        countryCode: 'ci'
      })
    } else {
      // Si un lien statique est configuré, on s'assure qu'il a le montant
      if (paymentLink.includes('?')) {
        paymentLink = `${paymentLink}&a=${paymentData.amount}`
      } else {
        paymentLink = `${paymentLink}?a=${paymentData.amount}`
      }
    }

    // Mettre à jour la commande
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_provider: 'wave',
        checkout_url: paymentLink,
        wave_payment_url: paymentLink, // Ex lygos_payment_url, migré vers wave
        payment_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentData.order_id)

    if (updateError) {
      console.error('❌ Erreur mise à jour commande Wave:', updateError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: `wave_${Date.now()}`,
        link: paymentLink,
        amount: paymentData.amount,
        currency: 'XOF',
        order_id: paymentData.order_id,
        status: 'pending'
      },
      message: 'Lien de paiement Wave généré avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur dans l\'API Route Wave:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur'
      },
      { status: 500 }
    )
  }
}
