'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/core/ui/button"
import { Badge } from "@/components/core/ui/badge"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/core/ui/sheet"

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
    return () => clearInterval(interval)
  }, [loadNotifications])

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
      {/* Bouton cloche */}
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

      {/* Panneau latéral — utilise un portail donc aucun problème de overflow/z-index */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-base font-black tracking-tight text-gray-900">
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white text-[10px] h-5 px-1.5 rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </SheetTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                >
                  Tout marquer lu
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  <Bell className="h-7 w-7 text-gray-200" />
                </div>
                <p className="font-bold text-gray-400 text-sm uppercase tracking-widest">Aucune notification</p>
                <p className="text-xs text-gray-400 mt-1">Vous serez notifié à chaque étape de votre commande</p>
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
            <div className="px-6 py-4 border-t border-gray-100">
              <Button
                variant="ghost"
                className="w-full text-sm font-semibold text-gray-500 hover:text-gray-900"
                onClick={() => { router.push('/dashboard/orders'); setOpen(false) }}
              >
                Voir toutes mes commandes
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
