'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Package, Truck, CheckCircle2, Factory, CreditCard } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/lib/types/payments'

interface UserRealtimeNotificationsProps {
  userId: string
}

export function UserRealtimeNotifications({ userId }: UserRealtimeNotificationsProps) {
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    console.log('🔔 Activation des notifications temps réel pour l\'utilisateur:', userId)

    // Souscription aux changements sur la table orders pour cet utilisateur spécifique
    const channel = supabase
      .channel(`user-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedOrder = payload.new
          const oldOrder = payload.old
          
          // Ne notifier que si le statut a changé
          if (updatedOrder.status !== oldOrder.status) {
            handleStatusChangeNotification(updatedOrder)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const handleStatusChangeNotification = (order: any) => {
    const status = order.status
    const orderNumber = order.order_number || order.id.slice(-8)
    
    let icon = <Package className="h-5 w-5 text-orange-500" />
    let description = "Le statut de votre commande a été mis à jour."
    let title = `Commande ${orderNumber}`

    switch (status) {
      case 'paid':
        icon = <CreditCard className="h-5 w-5 text-green-500" />
        title = "Paiement confirmé !"
        description = "Votre paiement a été validé. Nous préparons votre carte."
        break
      case 'preparing':
        icon = <Factory className="h-5 w-5 text-blue-500" />
        title = "En production"
        description = "Votre carte NFC personnalisée est en cours de fabrication."
        break
      case 'shipped':
        icon = <Truck className="h-5 w-5 text-purple-500" />
        title = "Commande expédiée !"
        description = "Bonne nouvelle ! Votre carte est en route vers l'adresse indiquée."
        break
      case 'delivered':
        icon = <CheckCircle2 className="h-5 w-5 text-green-600" />
        title = "Commande livrée"
        description = "Votre carte Ofika a été livrée. Profitez bien de votre nouveau réseau !"
        break
    }

    toast.success(title, {
      description,
      icon,
      duration: 8000,
      action: {
        label: 'Suivre',
        onClick: () => window.location.href = `/dashboard/orders`
      }
    })
  }

  return null // Ce composant ne rend rien visuellement
}
