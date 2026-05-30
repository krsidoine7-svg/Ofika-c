'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Package, BellRing } from 'lucide-react'

export function AdminRealtimeNotifications() {
  const supabase = createClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    console.log('🔔 Activation du système de notifications temps réel (Admin)')

    // 1. Souscription aux nouvelles commandes dans Supabase
    const channel = supabase
      .channel('admin-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newOrder = payload.new
          console.log('📦 Nouvelle commande reçue en temps réel:', newOrder)
          
          handleNewOrderNotification(newOrder)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connecté aux notifications de commandes Supabase')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleNewOrderNotification = (order: any) => {
    const orderNumber = order.order_number || order.id.slice(-8)
    const amount = (order.total_amount || 0).toLocaleString() + ' XOF'
    
    // 1. Notification Visuelle (Toast)
    toast.success(`Nouvelle commande ${orderNumber}`, {
      description: `Montant: ${amount}. Une nouvelle carte NFC vient d'être commandée.`,
      icon: <Package className="h-5 w-5 text-orange-500" />,
      duration: 10000,
      action: {
        label: 'Voir la commande',
        onClick: () => window.location.href = `/dashboard/admin/orders`
      }
    })

    // 2. Notification Vocale (Text-to-Speech)
    playVocalNotification(orderNumber)
  }

  const playVocalNotification = (orderNumber: string) => {
    try {
      if ('speechSynthesis' in window) {
        // Annuler toute lecture en cours
        window.speechSynthesis.cancel()

        const message = new SpeechSynthesisUtterance()
        message.text = `Attention ! Vous avez reçu une nouvelle commande numéro ${orderNumber.split('').join(' ')}`
        message.lang = 'fr-FR'
        message.rate = 1.0
        message.pitch = 1.0
        message.volume = 1.0

        // Choisir une voix française si disponible
        const voices = window.speechSynthesis.getVoices()
        const frenchVoice = voices.find(v => v.lang.startsWith('fr'))
        if (frenchVoice) message.voice = frenchVoice

        window.speechSynthesis.speak(message)
      }
    } catch (error) {
      console.error('Erreur lors de la notification vocale:', error)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none opacity-0">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-full">
         <BellRing className="h-4 w-4 animate-pulse text-orange-500" />
      </div>
    </div>
  )
}
