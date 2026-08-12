'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
  X,
  Loader2,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Notification {
  id: string
  type: 'order_confirmed' | 'payment_success' | 'production_started' | 'shipped' | 'delivered' | 'payment_failed'
  title: string
  message: string
  created_at: string
  read: boolean
  order_id?: string
  action_url?: string
}

interface OrderNotificationsProps {
  className?: string
}

export function OrderNotifications({ className }: OrderNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      // Notification chime sound (two quick high notes)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
      oscillator.frequency.setValueAtTime(1108.73, audioCtx.currentTime + 0.1) // C#6
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4)

      oscillator.start(audioCtx.currentTime)
      oscillator.stop(audioCtx.currentTime + 0.4)
    } catch (e) {
      console.error('Audio play failed', e)
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    
    // Supabase Realtime for notifications
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channelName = `user-notifications-${user.id}-${Math.random().toString(36).slice(2, 9)}`
      const channel = supabase.channel(channelName)
      
      channel.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const notif = payload.new
            playNotificationSound()
            
            // Show appropriate toast based on notification type
            if (notif.type === 'payment_failed') {
              toast.error(notif.title, { description: notif.message, duration: 10000 })
            } else {
              toast.success(notif.title, { description: notif.message, duration: 8000 })
            }
            
            // Reload notifications to increment bell
            loadNotifications()
          }
        )
      
      channel.subscribe()
        
      return channel
    }
    
    let channel: any
    setupRealtime().then(c => channel = c)

    return () => {
      clearInterval(interval)
      if (channel) supabase.removeChannel(channel)
    }
  }, [loadNotifications, supabase, playNotificationSound])

  const handleOpen = () => {
    setOpen(true)
    loadNotifications()
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/notifications?id=${notificationId}`, { method: 'DELETE' })
      const notif = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) await markAsRead(notif.id)
    if (notif.action_url) {
      router.push(notif.action_url)
      setOpen(false)
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_success': return <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
      case 'production_started': return <Package className="h-5 w-5 text-blue-500 shrink-0" />
      case 'shipped': return <Truck className="h-5 w-5 text-purple-500 shrink-0" />
      case 'delivered': return <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
      case 'payment_failed': return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
      default: return <Bell className="h-5 w-5 text-gray-400 shrink-0" />
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return "À l'instant"
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpen}
            className={cn("relative h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors", className)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-[380px] p-0 flex flex-col shadow-xl rounded-xl border-gray-100 z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-gray-900">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-[10px] h-5 px-1.5 rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-gray-500 hover:text-gray-900 h-auto p-0 font-medium"
              >
                Tout marquer lu
              </Button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <Bell className="h-5 w-5 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Aucune notification</p>
                <p className="text-[11px] text-gray-400 mt-1">Vos alertes s'afficheront ici</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors group",
                      !notif.read && "bg-blue-50/50 hover:bg-blue-50"
                    )}
                  >
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-semibold leading-tight", !notif.read ? "text-gray-900" : "text-gray-700")}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[11px] text-gray-400 font-medium">{formatTime(notif.created_at)}</p>
                        {notif.action_url && (
                          <span className="text-[11px] text-blue-500 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Voir <ExternalLink className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => deleteNotification(notif.id, e)}
                      className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg mt-0.5"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
              <Button
                variant="ghost"
                className="w-full text-xs font-semibold text-gray-500 hover:text-gray-900 h-8"
                onClick={() => { router.push('/dashboard/orders'); setOpen(false) }}
              >
                Voir toutes mes commandes
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}
