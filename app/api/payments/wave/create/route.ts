import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { createRateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/security/rate-limiter'
import { InputSanitizer } from '@/lib/security/input-sanitizer'
import { generateWavePaymentUrl, WaveApiConfig } from '@/lib/services/wave-api'

export const dynamic = 'force-dynamic'

/**
 * API Route pour créer un paiement Wave Direct
 * 
 * POST /api/payments/wave/create
 * 
 * Body:
 * {
 *   amount: number (requis)
 *   order_id: string (requis)
 *   message?: string
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

    // 1. Vérifier si la méthode est activée dans le dashboard admin
    const supabase = await createClient()
    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .single()

    const waveConfig = dbConfig?.value?.wave || {}
    const isWaveActive = waveConfig.is_active ?? false // Par défaut false pour Wave Direct car demande config manuelle
    
    if (!isWaveActive) {
      return NextResponse.json(
        { success: false, error: 'La méthode de paiement Wave Direct est temporairement désactivée par l\'administrateur.' },
        { status: 403 }
      )
    }

    // Récupérer les données de paiement et les sanitiser
    const rawData = await request.json()
    const paymentData = InputSanitizer.sanitizeObject(rawData)
    
    console.log('💳 Données de paiement Wave:', {
      amount: paymentData.amount,
      order_id: paymentData.order_id
    })

    // Validation des données requises
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

    // Générer le lien de paiement Wave Direct (Merchant Link)
    const paymentLink = generateWavePaymentUrl({
      amount: paymentData.amount,
      orderId: paymentData.order_id,
      merchantId: waveConfig.merchant_id,
      countryCode: waveConfig.country_code
    })

    // Mettre à jour la commande avec les informations Wave
    // Note: On réutilise lygos_payment_url pour simplifier si possible, ou on ajoute l'info en metadata
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_provider: 'wave',
        lygos_payment_url: paymentLink, // On stocke l'URL finale dans ce champ pour l'instant
        payment_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentData.order_id)

    if (updateError) {
      console.error('❌ Erreur mise à jour commande Wave:', updateError)
    }

    console.log('✅ Lien Wave généré:', paymentLink)

    // Retourner la réponse
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
