'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  requestPushPermission,
  triggerWebPushNotification
} from '@/lib/utils/push-notification-helper'
import { MessageSquare, Star, Bell } from 'lucide-react'

interface SupportRealtimeNotificationsProps {
  userId?: string
  isAdmin?: boolean
}

export function SupportRealtimeNotifications({ userId, isAdmin = false }: SupportRealtimeNotificationsProps) {
  useEffect(() => {
    // Demander la permission push au démarrage
    requestPushPermission()

    const supabase = createClient()

    // 1. Abonnement aux nouveaux messages de tickets
    const messagesChannel = supabase
      .channel('realtime-ticket-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages'
        },
        (payload: any) => {
          const newMsg = payload.new as any
          if (!newMsg) return

          // Si l'événement vient de l'admin et que l'utilisateur est le destinataire client
          if (newMsg.is_admin_reply && !isAdmin) {
            triggerWebPushNotification('💬 Nouveau message de l\'équipe Ofika', {
              body: newMsg.message?.substring(0, 100) || 'Vous avez reçu une réponse à votre demande.',
              url: '/dashboard/tickets',
              tag: `msg-${newMsg.id}`
            })

            toast.info('Nouveau message de l\'équipe Ofika', {
              description: newMsg.message?.substring(0, 80) + '...',
              icon: <MessageSquare className="w-4 h-4 text-emerald-600" />,
              action: {
                label: 'Voir',
                onClick: () => { window.location.href = '/dashboard/tickets' }
              }
            })
          }

          // Si le message vient d'un client et que l'utilisateur connecté est un Admin
          if (!newMsg.is_admin_reply && isAdmin) {
            triggerWebPushNotification('🔔 Nouveau message client reçu', {
              body: newMsg.message?.substring(0, 100) || 'Un client a envoyé un nouveau message.',
              url: '/dashboard/admin/tickets',
              tag: `msg-admin-${newMsg.id}`
            })

            toast.success('Nouveau message client reçu', {
              description: newMsg.message?.substring(0, 80) + '...',
              icon: <Bell className="w-4 h-4 text-blue-600" />,
              action: {
                label: 'Répondre',
                onClick: () => { window.location.href = '/dashboard/admin/tickets' }
              }
            })
          }
        }
      )
      .subscribe()

    // 2. Abonnement aux nouveaux tickets/avis créés (pour l'Admin)
    let ticketsChannel: any = null
    if (isAdmin) {
      ticketsChannel = supabase
        .channel('realtime-new-tickets')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_tickets'
          },
          (payload: any) => {
            const ticket = payload.new as any
            if (!ticket) return

            const categoryLabel = ticket.category === 'review' ? 'Avis Client ⭐' : ticket.category === 'suggestion' ? 'Suggestion 💡' : 'Ticket Support ❓'

            triggerWebPushNotification(`🔔 Nouveau ${categoryLabel} (${ticket.ticket_number})`, {
              body: `${ticket.author_name || 'Un utilisateur'}: "${ticket.subject || ticket.description}"`,
              url: '/dashboard/admin/tickets',
              tag: `ticket-${ticket.id}`
            })

            toast.success(`Nouveau ${categoryLabel} reçu`, {
              description: `${ticket.author_name || 'Utilisateur'} : ${ticket.subject}`,
              icon: <Star className="w-4 h-4 text-amber-500" />,
              action: {
                label: 'Consulter',
                onClick: () => { window.location.href = '/dashboard/admin/tickets' }
              }
            })
          }
        )
        .subscribe()
    }

    return () => {
      supabase.removeChannel(messagesChannel)
      if (ticketsChannel) supabase.removeChannel(ticketsChannel)
    }
  }, [userId, isAdmin])

  return null
}
