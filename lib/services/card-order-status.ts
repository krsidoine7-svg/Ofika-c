// =====================================================
// SERVICE POUR VÉRIFIER LE STATUT DE COMMANDE D'UNE CARTE NFC
// =====================================================

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface CardOrderStatus {
  hasPhysicalOrder: boolean
  orderStatus?: 'pending' | 'paid' | 'production' | 'shipped' | 'delivered' | 'failed' | 'cancelled'
  canModifyCard: boolean
  canModifyPublicPage: boolean
  orderId?: string
  orderDate?: string
}

// Vérifier si une carte NFC a une commande physique associée
export async function getCardOrderStatus(cardId: string): Promise<CardOrderStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        hasPhysicalOrder: false,
        canModifyCard: false,
        canModifyPublicPage: false
      }
    }

    // Vérifier s'il y a une commande physique pour cette carte NFC
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        nfc_profile_id,
        payment_status
      `)
      .eq('user_id', user.id)
      .eq('nfc_profile_id', cardId)
      .in('status', ['pending', 'paid', 'production', 'shipped', 'delivered'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking card order status:', error)
      return {
        hasPhysicalOrder: false,
        canModifyCard: true,
        canModifyPublicPage: true
      }
    }

    const hasPhysicalOrder = !!order
    const orderStatus = order?.status as CardOrderStatus['orderStatus']
    
    // Logique des permissions :
    // - Si pas de commande physique : peut tout modifier
    // - Si commande physique : ne peut plus modifier la carte physique, mais peut modifier la page publique
    const canModifyCard = !hasPhysicalOrder
    const canModifyPublicPage = true // Toujours possible

    return {
      hasPhysicalOrder,
      orderStatus,
      canModifyCard,
      canModifyPublicPage,
      orderId: order?.id,
      orderDate: order?.created_at
    }

  } catch (error) {
    console.error('Error in getCardOrderStatus:', error)
    return {
      hasPhysicalOrder: false,
      canModifyCard: true,
      canModifyPublicPage: true
    }
  }
}

// Vérifier le statut de commande pour plusieurs cartes
export async function getMultipleCardsOrderStatus(cardIds: string[]): Promise<Record<string, CardOrderStatus>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {}
    }

    // Récupérer toutes les commandes pour ces cartes
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        nfc_profile_id,
        payment_status
      `)
      .eq('user_id', user.id)
      .in('nfc_profile_id', cardIds)
      .in('status', ['pending', 'paid', 'production', 'shipped', 'delivered'])

    if (error) {
      console.error('Error checking multiple cards order status:', error)
      return {}
    }

    // Créer un map des statuts par carte
    const statusMap: Record<string, CardOrderStatus> = {}
    
    cardIds.forEach(cardId => {
      const order = orders?.find(o => o.nfc_profile_id === cardId)
      const hasPhysicalOrder = !!order
      
      statusMap[cardId] = {
        hasPhysicalOrder,
        orderStatus: order?.status as CardOrderStatus['orderStatus'],
        canModifyCard: !hasPhysicalOrder,
        canModifyPublicPage: true,
        orderId: order?.id,
        orderDate: order?.created_at
      }
    })

    return statusMap

  } catch (error) {
    console.error('Error in getMultipleCardsOrderStatus:', error)
    return {}
  }
}
