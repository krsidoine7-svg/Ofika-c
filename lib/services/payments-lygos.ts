// =====================================================
// SERVICE PAYMENTS LYGOS - VERSION MIGRÉE
// =====================================================

import { createClient } from '@/lib/supabase/client'
import { 
  Order, 
  PaymentMethod, 
  CreateOrderData, 
  UpdateOrderData, 
  OrderStats,
  CARD_PRICING,
  ORDER_LIMITS
} from '@/lib/types/payments'
import { createLygosPayment } from '@/lib/services/lygos-api'
import { WebhookService } from './business-rules'

// =====================================================
// SERVICES ORDERS (Inchangés)
// =====================================================

export async function getOrders(): Promise<{ success: boolean; data?: Order[]; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Utilisateur non authentifié' }
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getOrderById(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Utilisateur non authentifié' }
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function createOrder(orderData: CreateOrderData): Promise<{ success: boolean; data?: Order; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Utilisateur non authentifié' }
  }

  // Validation obligatoire du profile_id
  if (!orderData.profile_id) {
    return { success: false, error: 'profile_id est obligatoire pour créer une commande' }
  }

  // Calculer le prix
  const unitPrice = CARD_PRICING[orderData.card_type]
  const quantity = orderData.quantity || 1
  const totalPrice = unitPrice * quantity

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      profile_id: orderData.profile_id,
      card_type: orderData.card_type,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      currency: 'XOF',
      status: 'pending',
      shipping_address: orderData.shipping_address
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating order:', error)
    return { success: false, error: error.message }
  }

  // 🎯 WEBHOOK SIMPLE - COMMANDE CRÉÉE (LyGOS)
  if (data) {
    const shippingAddr = orderData.shipping_address as any
    
    // Générer le lien de paiement LyGOS immédiatement
    let lienPaiement = 'En cours de génération...'
    try {
      const paymentResult = await generateLygosPaymentUrl(data.id)
      if (paymentResult.success && paymentResult.data?.link) {
        lienPaiement = paymentResult.data.link
        console.log('✅ Lien de paiement LyGOS généré pour webhook:', lienPaiement)
      } else {
        console.warn('⚠️ Impossible de générer le lien de paiement LyGOS:', paymentResult.error)
      }
    } catch (error) {
      console.error('❌ Erreur génération lien paiement LyGOS pour webhook:', error)
    }
    
    const webhookResult = await WebhookService.sendSimpleWebhook(
      'PHYSICAL_CARD_ORDERED',
      {
        // Informations de base de la commande
        id_commande: data.id,
        type_carte: orderData.card_type,
        quantite: quantity,
        prix_unitaire: unitPrice,
        prix_total: totalPrice,
        devise: 'XOF',

        // Informations client
        nom_client: shippingAddr?.name || user.email?.split('@')[0] || 'Client',
        email_client: shippingAddr?.email || user.email || 'Non spécifié',
        telephone_client: shippingAddr?.phone || 'Non spécifié',
        adresse_livraison: shippingAddr?.address || 'Adresse à confirmer',
        ville: shippingAddr?.city || 'Ville à confirmer',
        code_postal: shippingAddr?.postalCode || '00000',

        // Informations temporelles
        date_creation: data.created_at,

        // Informations de paiement LyGOS
        lien_paiement_lygos: lienPaiement,
        url_redirection: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${data.id}`,
        url_echec: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,

        // Description et message
        description_commande: `Commande carte ${orderData.card_type} - ${quantity} unité(s)`,
        message_paiement: `Paiement via LyGOS - ${quantity} carte(s) Ofika`,

        // Statut
        statut_commande: data.status,

        // Informations techniques
        profile_id: orderData.profile_id,
        user_id: user.id,
        methode_paiement: 'LyGOS'
      },
      user.id,
      user.email
    )

    if (webhookResult.success) {
      console.log('✅ Webhook commande créée envoyé avec lien de paiement LyGOS')
    } else {
      console.warn('⚠️ Erreur webhook commande:', webhookResult.error)
    }
  }

  return { success: true, data }
}

export async function updateOrder(orderId: string, updateData: UpdateOrderData): Promise<{ success: boolean; data?: Order; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Utilisateur non authentifié' }
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// =====================================================
// SERVICES STATISTIQUES (Inchangés)
// =====================================================

export async function getUserOrderStats(): Promise<{ success: boolean; data?: OrderStats; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Utilisateur non authentifié' }
  }

  try {
    const { data, error } = await supabase.rpc('get_user_order_stats', {
      user_uuid: user.id
    })

    if (error) {
      console.error('Error fetching order stats:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getUserOrderStats:', error)
    return { success: false, error: 'Erreur lors de la récupération des statistiques' }
  }
}

export async function canUserOrderMore(): Promise<{ success: boolean; data?: boolean; error?: string }> {
  const statsResult = await getUserOrderStats()
  
  if (!statsResult.success || !statsResult.data) {
    return { success: false, error: statsResult.error || 'Impossible de vérifier les limites' }
  }

  const canOrder = statsResult.data.can_order_more
  return { success: true, data: canOrder }
}

// =====================================================
// SERVICES PAIEMENTS LYGOS - NOUVEAU
// =====================================================

export async function getPaymentMethods(): Promise<{ success: boolean; data?: PaymentMethod[]; error?: string }> {
  // LyGOS est le seul moyen de paiement disponible
  const lygosMethod: PaymentMethod = {
    id: 'lygos',
    name: 'LyGOS',
    type: 'mobile_money',
    provider: 'lygos',
    is_active: true
  }

  return { 
    success: true, 
    data: [lygosMethod] 
  }
}

/**
 * Génère un lien de paiement LyGOS pour une commande
 * NOUVEAU: Utilise LyGOS au lieu de Wave CI
 */
export async function generateLygosPaymentUrl(orderId: string): Promise<{ success: boolean; data?: { id: string; link: string }; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Utilisateur non authentifié' }
  }

  try {
    // Récupérer la commande
    const orderResult = await getOrderById(orderId)
    if (!orderResult.success || !orderResult.data) {
      return { success: false, error: 'Commande non trouvée' }
    }

    const order = orderResult.data

    // Créer le paiement via LyGOS
    const paymentResult = await createLygosPayment({
      amount: Number(order.total_amount),
      order_id: order.id,
      message: `Commande carte Ofika ${order.card_type} - ${order.quantity} unité(s)`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${order.id}`,
      failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`
    })

    if (!paymentResult.success || !paymentResult.data) {
      return { 
        success: false, 
        error: paymentResult.error || 'Erreur lors de la création du paiement LyGOS' 
      }
    }

    console.log('✅ Lien LyGOS généré:', paymentResult.data.link)

    // Sauvegarder le lien de paiement dans la commande
    const updateResult = await updateOrder(orderId, {
      lygos_payment_id: paymentResult.data.id,
      lygos_payment_url: paymentResult.data.link
    })

    if (!updateResult.success) {
      console.warn('⚠️ Impossible de sauvegarder le lien de paiement LyGOS:', updateResult.error)
    }
    
    return { 
      success: true, 
      data: {
        id: paymentResult.data.id,
        link: paymentResult.data.link
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la génération du lien de paiement LyGOS:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de la génération du lien de paiement LyGOS' 
    }
  }
}

// =====================================================
// SERVICES UTILITAIRES (Inchangés)
// =====================================================

export async function validateOrderData(orderData: CreateOrderData): Promise<{ success: boolean; error?: string }> {
  // Validation du profile_id
  if (!orderData.profile_id) {
    return { success: false, error: 'profile_id est obligatoire' }
  }

  // Validation de l'adresse de livraison
  if (!orderData.shipping_address) {
    return { success: false, error: 'Adresse de livraison requise' }
  }

  const { name, email, phone, address, city } = orderData.shipping_address
  if (!name || !email || !phone || !address || !city) {
    return { success: false, error: 'Tous les champs de l\'adresse sont requis' }
  }

  // Validation du type de carte
  if (!['nfc_qr', 'qr_only'].includes(orderData.card_type)) {
    return { success: false, error: 'Type de carte invalide' }
  }

  // Validation de la quantité
  const quantity = orderData.quantity || 1
  if (quantity < 1 || quantity > ORDER_LIMITS.MAX_ORDERS_PER_USER) {
    return { success: false, error: `Quantité invalide (max ${ORDER_LIMITS.MAX_ORDERS_PER_USER})` }
  }

  return { success: true }
}

export async function getOrderSummary(orderId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const orderResult = await getOrderById(orderId)
  if (!orderResult.success || !orderResult.data) {
    return { success: false, error: 'Commande non trouvée' }
  }

  const order = orderResult.data
  const summary = {
    id: order.id,
    order_number: order.id.substring(0, 8),
    status: order.status,
    card_type: order.card_type,
    quantity: order.quantity,
    total_amount: order.total_amount,
    currency: order.currency,
    created_at: order.created_at,
    shipping_address: order.shipping_address,
    lygos_payment_url: (order as any).lygos_payment_url // Nouveau champ LyGOS
  }

  return { success: true, data: summary }
}

