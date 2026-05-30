import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { createRateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/security/rate-limiter'
import { InputSanitizer } from '@/lib/security/input-sanitizer'
import { SUBSCRIPTION_PLANS } from '@/lib/hooks/usePayments'
import { createLygosPayment } from '@/lib/services/lygos-api'

export const dynamic = 'force-dynamic'


/**
 * POST /api/subscription/upgrade
 * Met à niveau l'abonnement de l'utilisateur vers un plan premium
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

    // Créer le paiement via LyGOS
    const paymentResult = await createLygosPayment({
      amount: plan.price,
      order_id: orderId,
      message: `Abonnement ${plan.name}${plan.interval ? ` - ${plan.interval}` : ''}`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?plan=${planId}`,
      failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancelled`
    })

    if (!paymentResult.success || !paymentResult.data) {
      console.error('❌ Erreur création paiement abonnement:', paymentResult.error)
      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error || 'Erreur lors de la création du paiement'
        },
        { status: 500 }
      )
    }

    // TODO: Sauvegarder l'intention d'abonnement en base de données
    // Pour l'instant, on redirige directement vers le paiement

    console.log('✅ Paiement abonnement créé:', {
      plan: planId,
      amount: plan.price,
      payment_id: paymentResult.data.id
    })

    return NextResponse.json({
      success: true,
      data: {
        payment_url: paymentResult.data.link,
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
