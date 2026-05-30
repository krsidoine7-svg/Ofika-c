import { NextRequest, NextResponse } from 'next/server'

// Forcer le rendu dynamique pour cette route API
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { createRateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/security/rate-limiter'
import { getLygosPaymentStatus, validateLygosConfig } from '@/lib/services/lygos-api'

/**
 * API Route pour vérifier le statut d'un paiement LyGOS
 * Documentation: https://docs.lygosapp.com/api-reference/gateway/get-gateway
 * 
 * GET /api/payments/lygos/status?id={gateway_id}
 * 
 * Query params:
 * - id: string (requis) - ID du gateway/paiement LyGOS
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Route LyGOS - Vérification statut paiement')
    
    // Rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.payment)
    const rateLimitResponse = await rateLimitMiddleware(request)
    if (rateLimitResponse) return rateLimitResponse
    
    // Protection de la route
    const protectionResponse = await AuthGuard.protectRoute(request, {
      requireAuth: true,
      allowedMethods: ['GET'],
      validateData: false
    })
    if (protectionResponse) return protectionResponse

    // Vérifier la configuration LyGOS
    const configValidation = validateLygosConfig()
    if (!configValidation.valid) {
      console.error('❌ Configuration LyGOS manquante:', configValidation.error)
      return NextResponse.json(
        { success: false, error: `Configuration LyGOS incomplète: ${configValidation.error}` },
        { status: 500 }
      )
    }

    // Récupérer l'ID du paiement depuis les query params
    const { searchParams } = new URL(request.url)
    const gatewayId = searchParams.get('id')

    if (!gatewayId) {
      return NextResponse.json(
        { success: false, error: 'Paramètre "id" (gateway_id) requis' },
        { status: 400 }
      )
    }

    // Vérifier que le paiement appartient à l'utilisateur
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que la commande avec ce payment_id appartient à l'utilisateur
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id, lygos_payment_id')
      .eq('lygos_payment_id', gatewayId)
      .eq('user_id', user.id)
      .single()

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Paiement non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    console.log('🔍 Vérification statut paiement LyGOS:', gatewayId)

    // Vérifier le statut via l'API LyGOS
    const statusResult = await getLygosPaymentStatus(gatewayId)

    if (!statusResult.success || !statusResult.data) {
      console.error('❌ Erreur vérification statut LyGOS:', statusResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: statusResult.error || 'Erreur lors de la vérification du statut'
        },
        { status: 500 }
      )
    }

    const paymentStatus = statusResult.data

    // Déterminer le statut de la commande basé sur le statut du paiement
    let orderStatus: 'pending' | 'paid' | 'failed' | 'cancelled' = 'pending'
    
    // Note: LyGOS ne retourne pas directement un statut "paid" dans la réponse
    // Il faut vérifier via le webhook ou d'autres moyens
    // Pour l'instant, on retourne les données brutes

    // Mettre à jour la commande si nécessaire
    // (Le webhook devrait normalement gérer cela, mais on peut aussi le faire ici)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('❌ Erreur mise à jour commande:', updateError)
    }

    console.log('✅ Statut paiement LyGOS récupéré:', {
      payment_id: paymentStatus.id,
      amount: paymentStatus.amount,
      currency: paymentStatus.currency
    })

    // Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        id: paymentStatus.id,
        amount: paymentStatus.amount,
        currency: paymentStatus.currency,
        shop_name: paymentStatus.shop_name,
        message: paymentStatus.message,
        link: paymentStatus.link,
        order_id: paymentStatus.order_id,
        success_url: paymentStatus.success_url,
        failure_url: paymentStatus.failure_url,
        creation_date: paymentStatus.creation_date,
        user_country: paymentStatus.user_country
      },
      message: 'Statut du paiement récupéré avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur dans l\'API Route LyGOS Status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur',
        message: 'Impossible de vérifier le statut du paiement'
      },
      { status: 500 }
    )
  }
}

