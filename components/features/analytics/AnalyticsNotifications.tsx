'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, TrendingUp, Eye, MousePointer, QrCode, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Styles CSS personnalisés pour les animations
const styles = `
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .scrollbar-thin {
    scrollbar-width: thin;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`

// Injecter les styles dans le head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

interface Notification {
  id: string
  type: 'view' | 'click' | 'scan' | 'contact'
  message: string
  timestamp: Date
  profileId: string
  profileName: string
}

interface AnalyticsNotificationsProps {
  profileIds: string[]
  onNotificationClick?: (notification: Notification) => void
}

// Helper pour mapper les types d'événements
function mapEventTypeToNotificationType(eventType: string): Notification['type'] {
  if (eventType === 'profile_viewed') return 'view'
  if (eventType === 'link_clicked') return 'click'
  if (eventType === 'qr_scanned') return 'scan'
  return 'contact'
}

function getMessageForType(type: Notification['type']): string {
  const messages = {
    view: '📊',
    click: '👆',
    scan: '📱',
    contact: '👤'
  }
  return messages[type]
}

export function AnalyticsNotifications({ profileIds, onNotificationClick }: AnalyticsNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // ✅ VRAI : Charger les vraies notifications depuis analytics_events
  useEffect(() => {
    const fetchRecentNotifications = async () => {
      if (!profileIds || profileIds.length === 0) return

      try {
        const supabase = createClient()

        // Récupérer les 10 derniers événements des 24 dernières heures
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)

        const { data: events, error } = await supabase
          .from('analytics_events')
          .select('id, event_type, created_at, profile_id')
          .in('profile_id', profileIds)
          .gte('created_at', oneDayAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          console.error('Error fetching notifications:', error)
          return
        }

        if (events && events.length > 0) {
          const mappedNotifications: Notification[] = events.map(event => {
            const type = mapEventTypeToNotificationType(event.event_type)
            return {
              id: event.id,
              type,
              message: getMessageForType(type),
              timestamp: new Date(event.created_at),
              profileId: event.profile_id,
              profileName: ''
            }
          })

          setNotifications(mappedNotifications)
          console.log(`✅ ${mappedNotifications.length} notifications chargées`)
        } else {
          console.log('📭 Aucune notification récente')
        }
      } catch (err) {
        console.error('❌ Error loading notifications:', err)
      }
    }

    fetchRecentNotifications()

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchRecentNotifications, 30000)
    return () => clearInterval(interval)
  }, [profileIds.join(',')])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="w-4 h-4" />
      case 'click': return <MousePointer className="w-4 h-4" />
      case 'scan': return <QrCode className="w-4 h-4" />
      case 'contact': return <TrendingUp className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  // Cette fonction n'est plus utilisée car nous utilisons des backgrounds colorés maintenant
  const getNotificationColor = (type: string) => {
    return 'text-gray-600' // Couleur par défaut, les couleurs sont maintenant dans les backgrounds
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="relative">
      {notifications.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative group transition-all duration-200 hover:bg-orange-50/50 rounded-full
            ${isOpen ? 'bg-orange-50 text-orange-500' : 'text-gray-600'}
          `}
        >
          <Bell className="w-5 h-5" />
          <Badge
            variant="destructive"
            className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-bold border-2 border-white"
          >
            {notifications.length}
          </Badge>
        </Button>
      )}

      {isOpen && (
        <Card className="absolute -right-12 sm:right-0 top-12 w-[calc(100vw-3rem)] sm:w-96 z-50 shadow-2xl rounded-2xl border border-gray-100 bg-white animate-in slide-in-from-top-2 duration-200 overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Activité récente</p>
                  <p className="text-xs text-gray-500">{notifications.length} événement{notifications.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors duration-150"
              >
                <X className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent p-2">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className="p-3 bg-white hover:bg-orange-50/50 rounded-xl mb-1 flex items-center justify-between transition-all duration-200 border border-transparent hover:border-orange-100 cursor-pointer group"
                  onClick={() => {
                    onNotificationClick?.(notification)
                    removeNotification(notification.id)
                  }}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInLeft 0.3s ease-out forwards'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${notification.type === 'view' ? 'bg-blue-50 text-blue-500' :
                      notification.type === 'click' ? 'bg-emerald-50 text-emerald-500' :
                        notification.type === 'scan' ? 'bg-violet-50 text-violet-500' :
                          'bg-orange-50 text-orange-500'
                      }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {notification.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeNotification(notification.id)
                    }}
                    className="flex-shrink-0 h-6 w-6 p-0 opacity-70 hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all duration-150 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            {notifications.length === 0 && (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune activité récente</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
