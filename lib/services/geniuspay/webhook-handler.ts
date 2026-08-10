import { createAdminClient } from '@/lib/supabase/service-role'
import { GeniusPayWebhookPayload } from './types'

export async function handleGeniusPayWebhookEvent(payload: GeniusPayWebhookPayload): Promise<void> {
  const event = payload.event
  const data = payload.data

  switch (event) {
    case 'payment.success':
      await handlePaymentSuccess(data)
      break
    case 'payment.failed':
      await handlePaymentFailed(data)
      break
    case 'payment.cancelled':
      await handlePaymentCancelled(data)
      break
    case 'payment.expired':
      await handlePaymentExpired(data)
      break
    case 'payment.refunded':
      await handlePaymentRefunded(data)
      break
    default:
      console.log(`Événement webhook GeniusPay non géré: ${event}`)
  }
}

async function handlePaymentSuccess(data: any): Promise<void> {
  const orderId = data.metadata?.order_id
  if (!orderId) {
    console.error('Aucun order_id trouvé dans les métadonnées de la transaction GeniusPay:', data.id)
    return
  }

  const supabase = createAdminClient()

  // 1. Vérifier si la commande n'est pas déjà complétée
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, payment_status, status')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    console.error('Commande non trouvée pour order_id:', orderId)
    return
  }

  if (order.payment_status === 'paid' || order.status === 'paid') {
    console.log(`Commande ${orderId} déjà marquée comme payée. Idempotence respectée.`)
    return
  }

  // 2. Mettre à jour la commande
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'succeeded',
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (updateError) {
    console.error('Erreur lors de la mise à jour de la commande (success):', updateError)
    throw updateError
  }

  console.log(`Paiement GeniusPay réussi pour la commande ${orderId}`)
}

async function handlePaymentFailed(data: any): Promise<void> {
  const orderId = data.metadata?.order_id
  if (!orderId) return

  const supabase = createAdminClient()
  await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    
  console.log(`Paiement GeniusPay échoué pour la commande ${orderId}`)
}

async function handlePaymentCancelled(data: any): Promise<void> {
  const orderId = data.metadata?.order_id
  if (!orderId) return

  const supabase = createAdminClient()
  await supabase
    .from('orders')
    .update({
      payment_status: 'cancelled',
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
}

async function handlePaymentExpired(data: any): Promise<void> {
  const orderId = data.metadata?.order_id
  if (!orderId) return

  const supabase = createAdminClient()
  await supabase
    .from('orders')
    .update({
      payment_status: 'expired',
      status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
}

async function handlePaymentRefunded(data: any): Promise<void> {
  const orderId = data.metadata?.order_id
  if (!orderId) return

  const supabase = createAdminClient()
  await supabase
    .from('orders')
    .update({
      payment_status: 'refunded',
      status: 'refunded',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
}
