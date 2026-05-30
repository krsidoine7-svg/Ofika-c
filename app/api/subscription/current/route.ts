import { NextRequest, NextResponse } from 'next/server'

// Forcer le rendu dynamique pour cette route API
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { SUBSCRIPTION_PLANS } from '@/lib/hooks/usePayments'

/**
 * GET /api/subscription/current
 * Récupère l'abonnement actuel de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Protection de la route
    const protectionResponse = await AuthGuard.protectRoute(request, {
      requireAuth: true,
      allowedMethods: ['GET']
    })
    if (protectionResponse) return protectionResponse

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'abonnement réel depuis la base de données (table users)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      console.error('Erreur récupération utilisateur:', userError)
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé dans la base de données' },
        { status: 404 }
      )
    }

    const tier = userData.subscription_tier || 'free'
    const planInfo = SUBSCRIPTION_PLANS[tier.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS] || SUBSCRIPTION_PLANS.FREE

    const currentSubscription = {
      plan_id: tier,
      status: 'active',
      current_period_start: user.created_at, // Par défaut
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Factice pour l'instant
      cancel_at_period_end: false,
      ...planInfo
    }

    return NextResponse.json({
      success: true,
      subscription: currentSubscription
    })

  } catch (error) {
    console.error('Erreur récupération abonnement:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
}
