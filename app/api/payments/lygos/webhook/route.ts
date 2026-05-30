import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyLygosWebhookSignature, validateLygosConfig } from '@/lib/services/lygos-api'
import { WebhookService } from '@/lib/services/business-rules'
import { sendOrderConfirmationEmail } from '@/lib/services/email-notifications'

export const dynamic = 'force-dynamic'


/**
 * API Route pour recevoir les webhooks LyGOS
 * 
 * POST /api/payments/lygos/webhook
 * 
 * Cette route:
 * - Vérifie la signature HMAC du webhook
 * - Met à jour le statut de la commande dans la base de données
 * - Est idempotente (peut être appelée plusieurs fois sans effet de bord)
 * - Retourne toujours 200 OK pour éviter les retries inutiles
 */

export async function POST(request: NextRequest) {
  let webhookData: any = null

  try {
    console.log('📥 Webhook LyGOS reçu')

    // Vérifier la configuration LyGOS
    const configValidation = validateLygosConfig()
    if (!configValidation.valid) {
      console.error('❌ Configuration LyGOS manquante:', configValidation.error)
      // Retourner 200 pour éviter les retries
      return NextResponse.json(
        { success: false, error: 'Configuration incomplète' },
        { status: 200 }
      )
    }

    // Récupérer le corps de la requête
    const rawBody = await request.text()
    webhookData = JSON.parse(rawBody)

    // Récupérer la signature depuis les headers
    const signature = request.headers.get('x-lygos-signature') || 
                     request.headers.get('signature') ||
                     request.headers.get('x-signature')

    // Vérifier la signature HMAC
    if (signature) {
      const isValid = verifyLygosWebhookSignature(rawBody, signature)
      
      if (!isValid) {
        console.error('❌ Signature webhook invalide')
        // Retourner 200 pour éviter les retries mais logger l'erreur
        return NextResponse.json(
          { success: false, error: 'Signature invalide' },
          { status: 200 }
        )
      }
      
      console.log('✅ Signature webhook vérifiée')
    } else {
      console.warn('⚠️ Aucune signature trouvée dans les headers')
      // En développement, on peut accepter sans signature
      // En production, il faudrait rejeter
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Signature manquante' },
          { status: 200 }
        )
      }
    }

    console.log('📦 Données webhook LyGOS:', {
      operationId: webhookData.operationId,
      orderId: webhookData.orderId,
      amount: webhookData.amount,
      status: webhookData.status,
      buyer: webhookData.buyer
    })

    // Extraire les informations du webhook LyGOS
    const operationId = webhookData.operationId // ID de l'opération LyGOS
    const orderId = webhookData.orderId // Notre order_id
    const lygosStatus = webhookData.status // DEPOSIT_REQUESTED, DEPOSIT_COMPLETED, DEPOSIT_FAILED
    const buyerInfo = webhookData.buyer // Infos de l'acheteur

    if (!operationId) {
      console.error('❌ ID d\'opération manquant dans le webhook')
      return NextResponse.json(
        { success: false, error: 'ID d\'opération manquant' },
        { status: 200 }
      )
    }

    if (!orderId) {
      console.error('❌ ID de commande manquant dans le webhook')
      return NextResponse.json(
        { success: false, error: 'ID de commande manquant' },
        { status: 200 }
      )
    }

    // Connexion Supabase
    const supabase = await createClient()

    // Trouver la commande par son ID (orderId envoyé par LyGOS)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, payment_status, shipping_status, lygos_payment_id, shipping_address')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ Commande non trouvée:', orderId, orderError)
      // Retourner 200 pour éviter les retries
      return NextResponse.json(
        { success: false, error: 'Commande non trouvée' },
        { status: 200 }
      )
    }

    // Mapper les statuts LyGOS vers nos statuts de base de données
    let newPaymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' = order.payment_status || 'pending'
    let newShippingStatus: 'pending' | 'preparing' | 'shipped' | 'in_transit' | 'delivered' = order.shipping_status || 'pending'

    // Mapping des statuts LyGOS
    if (lygosStatus === 'DEPOSIT_REQUESTED') {
      newPaymentStatus = 'processing'
      // shipping_status reste inchangé
    } else if (lygosStatus === 'DEPOSIT_COMPLETED') {
      newPaymentStatus = 'succeeded'
      newShippingStatus = 'preparing' // Passer en préparation après paiement réussi
    } else if (lygosStatus === 'DEPOSIT_FAILED') {
      newPaymentStatus = 'failed'
      // shipping_status reste inchangé
    } else {
      console.warn('⚠️ Statut LyGOS inconnu:', lygosStatus)
      // Ne rien faire pour les statuts inconnus
      return NextResponse.json({
        success: true,
        message: 'Statut inconnu ignoré',
        order_id: order.id,
        lygos_status: lygosStatus
      })
    }

    // Vérifier si la commande a déjà été mise à jour (idempotence)
    if (order.payment_status === newPaymentStatus && order.shipping_status === newShippingStatus) {
      console.log('ℹ️ Commande déjà à jour, webhook ignoré (idempotence)')
      return NextResponse.json({
        success: true,
        message: 'Commande déjà à jour',
        order_id: order.id,
        payment_status: newPaymentStatus,
        shipping_status: newShippingStatus
      })
    }

    // Mettre à jour la commande
    const updateData: any = {
      payment_status: newPaymentStatus,
      shipping_status: newShippingStatus,
      updated_at: new Date().toISOString()
    }

    // Stocker l'operationId de LyGOS si pas déjà fait
    if (!order.lygos_payment_id) {
      updateData.lygos_payment_id = operationId
    }

    // Si paiement réussi, enregistrer la date
    if (newPaymentStatus === 'succeeded') {
      updateData.paid_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id)

    if (updateError) {
      console.error('❌ Erreur mise à jour commande:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de la commande' },
        { status: 200 } // Retourner 200 pour éviter les retries
      )
    }

    console.log('✅ Commande mise à jour via webhook LyGOS:', {
      order_id: order.id,
      operation_id: operationId,
      lygos_status: lygosStatus,
      old_payment_status: order.payment_status,
      new_payment_status: newPaymentStatus,
      new_shipping_status: newShippingStatus,
      buyer: buyerInfo?.name
    })

    // 🎯 NOTIFICATIONS - Webhook Make.com et Email
    if (newPaymentStatus === 'succeeded') {
      // Extraire les informations client depuis shipping_address
      const shippingAddr = order.shipping_address as any
      const customerName = shippingAddr?.full_name || shippingAddr?.name || buyerInfo?.name || 'Client'
      const customerEmail = shippingAddr?.email || buyerInfo?.email || ''

      // Envoyer webhook à Make.com
      const webhookResult = await WebhookService.sendSimpleWebhook(
        'PAYMENT_COMPLETED',
        {
          order_id: order.id,
          operation_id: operationId,
          lygos_status: lygosStatus,
          amount: webhookData.amount,
          currency: 'XOF',
          payment_status: newPaymentStatus,
          shipping_status: newShippingStatus,
          customer_name: customerName,
          customer_email: customerEmail,
          buyer_phone: buyerInfo?.phoneNumber,
          buyer_country: buyerInfo?.country,
          buyer_operator: buyerInfo?.operator,
          timestamp: new Date().toISOString()
        },
        order.user_id,
        customerEmail
      )

      if (webhookResult.success) {
        console.log('✅ Webhook Make.com PAYMENT_COMPLETED envoyé')
      } else {
        console.warn('⚠️ Erreur webhook Make.com:', webhookResult.error)
      }

      // Envoyer email de confirmation au client
      if (customerEmail) {
        const emailResult = await sendOrderConfirmationEmail(
          order as any,
          customerName,
          customerEmail
        )

        if (emailResult.success) {
          console.log('✅ Email de confirmation envoyé à:', customerEmail)
        } else {
          console.warn('⚠️ Erreur envoi email:', emailResult.error)
        }
      }
    }

    // Retourner 200 OK pour confirmer la réception du webhook
    return NextResponse.json({
      success: true,
      message: 'Webhook traité avec succès',
      order_id: order.id,
      operation_id: operationId,
      lygos_status: lygosStatus,
      payment_status: newPaymentStatus,
      shipping_status: newShippingStatus
    })

  } catch (error) {
    console.error('❌ Erreur dans le webhook LyGOS:', error)
    console.error('📦 Données webhook reçues:', webhookData)
    
    // Toujours retourner 200 pour éviter les retries
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        message: 'Erreur lors du traitement du webhook'
      },
      { status: 200 }
    )
  }
}

/**
 * GET endpoint pour vérifier que le webhook est accessible
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook LyGOS - Endpoint actif',
    timestamp: new Date().toISOString(),
    note: 'Utilisez POST pour recevoir les webhooks'
  })
}
