import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { createRateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/security/rate-limiter'
import { InputSanitizer } from '@/lib/security/input-sanitizer'
import { createGeniusPayPayment } from '@/lib/services/geniuspay/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const rateLimitMiddleware = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.payment)
    const rateLimitResponse = await rateLimitMiddleware(request)
    if (rateLimitResponse) return rateLimitResponse

    const protectionResponse = await AuthGuard.protectRoute(request, {
      requireAuth: true,
      allowedMethods: ['POST'],
      validateData: true
    })
    if (protectionResponse) return protectionResponse

    const rawData = await request.json()
    const paymentData = InputSanitizer.sanitizeObject(rawData)

    if (!paymentData.order_id) {
      return NextResponse.json({ success: false, error: 'order_id est requis' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Utilisateur non authentifié' }, { status: 401 })
    }

    // Récupérer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, currency, payment_status')
      .eq('id', paymentData.order_id)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      console.error('Order query error:', orderError, 'Order:', order, 'PaymentData:', paymentData, 'User ID:', user.id);
      return NextResponse.json({ success: false, error: 'Commande non trouvée ou non autorisée', details: orderError }, { status: 404 })
    }

    const amount = Number(order.total_amount)

    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host')
    const baseUrl = `${protocol}://${host}`

    // Appel à GeniusPay
    const transaction = await createGeniusPayPayment({
      amount: amount,
      currency: order.currency || 'XOF',
      description: `Commande ${order.id}`,
      customer: {
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'Client',
        email: user.email || '',
        phone: user.phone || ''
      },
      success_url: `${baseUrl}/dashboard/orders?payment=success&order_id=${order.id}`,
      error_url: `${baseUrl}/dashboard/orders?payment=error&order_id=${order.id}`,
      payment_method: paymentData.payment_method,
      metadata: { order_id: order.id }
    })

    // Mettre à jour la commande
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_provider: 'geniuspay',
        payment_reference: transaction.reference,
        payment_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Erreur mise à jour commande GeniusPay:', updateError)
    }

    return NextResponse.json({
      success: true,
      checkout_url: transaction.checkout_url || transaction.payment_url,
      reference: transaction.reference
    })

  } catch (error) {
    console.error('Erreur GeniusPay initiate:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}
