import { NextRequest, NextResponse } from 'next/server'

// Forcer le rendu dynamique pour cette route API
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { createRateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/security/rate-limiter'
import { InputSanitizer } from '@/lib/security/input-sanitizer'
import { createLygosPayment, validateLygosConfig } from '@/lib/services/lygos-api'

/**
 * API Route pour créer un paiement LyGOS
 * Documentation: https://docs.lygosapp.com/api-reference/gateway/create-payment-gateway
 * 
 * POST /api/payments/lygos/create
 * 
 * Body:
 * {
 *   amount: number (requis)
 *   order_id: string (requis)
 *   message?: string
 *   success_url?: string
 *   failure_url?: string
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Route LyGOS - Création de paiement')
    
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

    // 1. Vérifier la configuration LyGOS (Env Vars)
    const configValidation = validateLygosConfig()
    if (!configValidation.valid) {
      console.error('❌ Configuration LyGOS manquante:', configValidation.error)
      return NextResponse.json(
        { success: false, error: `Configuration LyGOS incomplète: ${configValidation.error}` },
        { status: 500 }
      )
    }

    // 2. Vérifier si la méthode est activée dans le dashboard admin
    const supabase = await createClient()
    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .single()

    const isLygosActive = dbConfig?.value?.lygos?.is_active ?? true // Par défaut true si non défini
    if (!isLygosActive) {
      return NextResponse.json(
        { success: false, error: 'La méthode de paiement LyGOS est temporairement désactivée par l\'administrateur.' },
        { status: 403 }
      )
    }

    // Récupérer les données de paiement et les sanitiser
    const rawData = await request.json()
    const paymentData = InputSanitizer.sanitizeObject(rawData)
    
    console.log('💳 Données de paiement LyGOS:', {
      amount: paymentData.amount,
      order_id: paymentData.order_id,
      message: paymentData.message
    })

    // Validation des données requises
    if (!paymentData.amount || paymentData.amount <= 0) {
      console.error('❌ Montant invalide:', paymentData.amount)
      return NextResponse.json(
        { success: false, error: 'Montant invalide (doit être > 0)' },
        { status: 400 }
      )
    }

    if (!paymentData.order_id) {
      console.error('❌ ID de commande manquant')
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
      console.error('❌ Commande non trouvée:', orderError)
      return NextResponse.json(
        { success: false, error: 'Commande non trouvée ou non autorisée' },
        { status: 404 }
      )
    }

    // Créer le paiement via LyGOS
    const paymentResult = await createLygosPayment({
      amount: paymentData.amount,
      order_id: paymentData.order_id,
      message: paymentData.message || `Commande ${order.id}`,
      success_url: paymentData.success_url || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${order.id}`,
      failure_url: paymentData.failure_url || `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`
    })

    if (!paymentResult.success || !paymentResult.data) {
      console.error('❌ Erreur création paiement LyGOS:', paymentResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: paymentResult.error || 'Erreur lors de la création du paiement'
        },
        { status: 500 }
      )
    }

    // Mettre à jour la commande avec les informations de paiement LyGOS
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        lygos_payment_id: paymentResult.data.id,
        lygos_payment_url: paymentResult.data.link,
        payment_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentData.order_id)

    if (updateError) {
      console.error('❌ Erreur mise à jour commande:', updateError)
      // Ne pas échouer la requête si la mise à jour échoue
      // Le paiement a été créé avec succès
    }

    console.log('✅ Paiement LyGOS créé avec succès:', {
      payment_id: paymentResult.data.id,
      payment_url: paymentResult.data.link
    })

    // Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        id: paymentResult.data.id,
        link: paymentResult.data.link,
        amount: paymentResult.data.amount,
        currency: paymentResult.data.currency,
        order_id: paymentResult.data.order_id,
        status: 'pending',
        created_at: paymentResult.data.creation_date
      },
      message: 'Paiement LyGOS créé avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur dans l\'API Route LyGOS:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur',
        message: 'Impossible de créer le paiement LyGOS'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint pour vérifier la disponibilité de l'API
 */
export async function GET() {
  const configValidation = validateLygosConfig()
  
  return NextResponse.json({
    success: configValidation.valid,
    message: configValidation.valid 
      ? 'LyGOS Payment API - Opérationnel'
      : `LyGOS Payment API - Configuration incomplète: ${configValidation.error}`,
    provider: 'LyGOS',
    configured: configValidation.valid,
    timestamp: new Date().toISOString(),
    base_url: process.env.LYGOS_BASE_URL || 'https://api.lygosapp.com'
  })
}

