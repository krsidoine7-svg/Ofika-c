import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { createRateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/security/rate-limiter'
import { InputSanitizer } from '@/lib/security/input-sanitizer'
import { SUBSCRIPTION_PLANS } from '@/lib/hooks/usePayments'
import { createGeniusPayPayment } from '@/lib/services/geniuspay/client'

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

    // Générer un ID de commande unique pour l'abonnement
    const orderId = `sub_${Date.now()}_${user.id.substring(0, 8)}`

    // Déclencher le paiement sécurisé via GeniusPay (Wave, Orange, MTN, Moov, CB)
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    const transaction = await createGeniusPayPayment({
      amount: plan.price,
      currency: plan.currency || 'XOF',
      description: `Abonnement ${plan.name} (${user.email || user.id})`,
      customer: {
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'Abonné Ofika',
        email: user.email || '',
        phone: user.phone || ''
      },
      success_url: `${baseUrl}/subscription?status=success&plan=${planId}`,
      error_url: `${baseUrl}/subscription?status=error&plan=${planId}`,
      metadata: { order_id: orderId, plan_id: planId, user_id: user.id }
    })

    const paymentLink = transaction.checkout_url || transaction.payment_url

    console.log('✅ Paiement abonnement GeniusPay créé:', {
      plan: planId,
      amount: plan.price,
      order_id: orderId,
      reference: transaction.reference
    })

    return NextResponse.json({
      success: true,
      data: {
        payment_url: paymentLink,
        plan_id: planId,
        amount: plan.price,
        currency: plan.currency,
        order_id: orderId,
        reference: transaction.reference
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
