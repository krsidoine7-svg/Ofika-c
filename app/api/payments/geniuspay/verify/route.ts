import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { getGeniusPayPayment } from '@/lib/services/geniuspay/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { order_id, reference } = await request.json()

    if (!order_id || !reference) {
      return NextResponse.json({ success: false, error: 'Paramètres manquants' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Récupérer la transaction depuis GeniusPay
    const transaction = await getGeniusPayPayment(reference)

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction non trouvée chez GeniusPay' }, { status: 404 })
    }

    // Sécurité supplémentaire : vérifier que la transaction correspond bien à la commande
    if (transaction.metadata?.order_id !== order_id) {
      console.error(`Tentative de validation croisée. L'order_id GeniusPay (${transaction.metadata?.order_id}) ne correspond pas à l'order_id reçu (${order_id})`)
      return NextResponse.json({ success: false, error: 'Transaction invalide pour cette commande' }, { status: 400 })
    }

    // 2. Traiter le statut de la transaction
    const status = transaction.status.toLowerCase()
    
    if (status === 'completed' || status === 'successful' || status === 'succeeded') {
      // Vérifier idempotence
      const { data: order } = await supabase
        .from('orders')
        .select('payment_status, status')
        .eq('id', order_id)
        .single()

      if (order && (order.payment_status === 'paid' || order.payment_status === 'succeeded' || order.status === 'paid')) {
        return NextResponse.json({ success: true, payment_status: 'succeeded', message: 'Déjà validé' })
      }

      // Mettre à jour la commande
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'succeeded',
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id)

      if (updateError) throw updateError

      return NextResponse.json({ success: true, payment_status: 'succeeded' })
    } 
    else if (status === 'failed' || status === 'cancelled') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id)

      if (updateError) throw updateError
      
      return NextResponse.json({ success: false, payment_status: 'failed', error: 'Paiement échoué' })
    }

    return NextResponse.json({ success: false, payment_status: status, error: 'Statut en attente ou inconnu' })

  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}
