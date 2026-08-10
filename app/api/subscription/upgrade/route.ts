import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { createRateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/security/rate-limiter'
import { InputSanitizer } from '@/lib/security/input-sanitizer'
import { SUBSCRIPTION_PLANS } from '@/lib/hooks/usePayments'
import { generateWavePaymentUrl, WaveApiConfig } from '@/lib/services/wave-api'

export const dynamic = 'force-dynamic'

/**
 * POST /api/subscription/upgrade
 * Met à niveau l'abonnement de l'utilisateur vers un plan premium via Wave
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Route Abonnement - Mise à niveau')

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

    // Récupérer les données et les sanitiser
    const rawData = await request.json()
    const data = InputSanitizer.sanitizeObject(rawData)

    const planId = data.plan_id
    if (!planId || !Object.keys(SUBSCRIPTION_PLANS).includes(planId.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Plan d\'abonnement invalide' },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan d\'abonnement non trouvé' },
        { status: 404 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // 1. Récupérer la configuration Wave
    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .single()

    const waveConfig = dbConfig?.value?.wave || {}
    const isWaveActive = waveConfig.is_active ?? true
    
    if (!isWaveActive) {
      return NextResponse.json(
        { success: false, error: 'La méthode de paiement Wave est temporairement désactivée.' },
        { status: 403 }
      )
    }

    // Générer un ID de commande unique pour l'abonnement
    const orderId = `sub_${Date.now()}_${user.id.substring(0, 8)}`

    // Déterminer le lien de paiement Wave
    let paymentLink = waveConfig.wave_payment_link
    if (!paymentLink) {
      paymentLink = generateWavePaymentUrl({
        amount: plan.price,
        orderId: orderId,
        merchantId: waveConfig.wave_merchant_id || WaveApiConfig.merchantId,
        countryCode: 'ci'
      })
    } else {
      if (paymentLink.includes('?')) {
        paymentLink = `${paymentLink}&a=${plan.price}`
      } else {
        paymentLink = `${paymentLink}?a=${plan.price}`
      }
    }

    console.log('✅ Paiement abonnement créé:', {
      plan: planId,
      amount: plan.price,
      order_id: orderId
    })

    return NextResponse.json({
      success: true,
      data: {
        payment_url: paymentLink,
        plan_id: planId,
        amount: plan.price,
        currency: plan.currency,
        order_id: orderId
      },
      message: 'Redirection vers le paiement en cours...'
    })

  } catch (error) {
    console.error('❌ Erreur mise à niveau abonnement:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne du serveur'
      },
      { status: 500 }
    )
  }
}
