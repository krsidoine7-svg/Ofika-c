'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { Order } from '@/lib/types/payments'

interface OrderTrackerProps {
  order: Order
  onRefresh?: () => void
  className?: string
}

type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

interface TrackingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'completed' | 'current' | 'pending'
  date?: string
}

export function OrderTracker({ order, onRefresh, className }: OrderTrackerProps) {
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([])
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('')

  useEffect(() => {
    updateTrackingSteps()
    calculateEstimatedDelivery()
  }, [order])

  const updateTrackingSteps = () => {
    const isPaid = order.status === 'paid' || order.payment_status === 'paid' || order.payment_status === 'succeeded'
    const isShipped = order.status === 'shipped' || order.shipping_status === 'shipped'
    const isDelivered = order.status === 'delivered' || order.shipping_status === 'delivered'
    const isPreparing = order.status === 'paid' && !isShipped // Par défaut, payé = production

    const steps: TrackingStep[] = [
      {
        id: 'order',
        title: 'Commande passée',
        description: 'Votre commande a été enregistrée',
        icon: Package,
        status: 'completed',
        date: new Date(order.created_at).toLocaleDateString('fr-FR')
      },
      {
        id: 'payment',
        title: 'Paiement confirmé',
        description: isPaid ? 'Votre paiement a été validé' : 'En attente de validation du paiement',
        icon: CheckCircle,
        status: isPaid ? 'completed' : 'current',
        date: order.paid_at ? new Date(order.paid_at).toLocaleDateString('fr-FR') : undefined
      },
      {
        id: 'production',
        title: 'En production',
        description: 'Votre carte est en cours de fabrication',
        icon: RefreshCw,
        status: isShipped || isDelivered ? 'completed' : (isPaid ? 'current' : 'pending'),
        date: isShipped || isDelivered ? (order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('fr-FR') : undefined) : undefined
      },
      {
        id: 'shipped',
        title: 'Expédiée',
        description: 'Votre carte a été expédiée',
        icon: Truck,
        status: isDelivered ? 'completed' : (isShipped ? 'current' : 'pending'),
        date: order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('fr-FR') : undefined
      },
      {
        id: 'delivered',
        title: 'Livrée',
        description: 'Votre carte a été livrée',
        icon: CheckCircle,
        status: isDelivered ? 'completed' : 'pending',
        date: order.delivered_at || order.actual_delivery ? new Date(order.delivered_at || order.actual_delivery!).toLocaleDateString('fr-FR') : undefined
      }
    ]

    setTrackingSteps(steps)
  }

  const calculateEstimatedDelivery = () => {
    if (order.status === 'paid') {
      const orderDate = new Date(order.created_at)
      const estimatedDate = new Date(orderDate.getTime() + (10 * 24 * 60 * 60 * 1000)) // +10 jours
      setEstimatedDelivery(estimatedDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente de paiement'
      case 'paid':
        return 'Payée - En cours de traitement'
      case 'failed':
        return 'Échec du paiement'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête de commande */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Commande #{order.id.slice(-8)}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Commandée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Type de carte</p>
              <p className="font-medium">
                {order.card_type === 'nfc_qr' ? 'NFC + QR Code' : 'QR Code uniquement'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Montant</p>
              <p className="font-medium">{order.total_amount.toLocaleString()} XOF</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantité</p>
              <p className="font-medium">{order.quantity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suivi de commande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Suivi de votre commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {trackingSteps.map((step, index) => {
              const StepIcon = step.icon
              const isLast = index === trackingSteps.length - 1
              
              return (
                <div key={step.id} className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : step.status === 'current'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <StepIcon className="h-5 w-5" />
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-12 mt-2 ${
                        step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${
                        step.status === 'completed' || step.status === 'current'
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      }`}>
                        {step.title}
                      </h3>
                      {step.date && (
                        <span className="text-sm text-gray-500">{step.date}</span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      step.status === 'completed' || step.status === 'current'
                        ? 'text-gray-600' 
                        : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informations de livraison */}
      {order.status === 'paid' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informations de livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Délai de livraison</h4>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>7-14 jours ouvrés</span>
                </div>
                {estimatedDelivery && (
                  <p className="text-sm text-gray-500 mt-1">
                    Livraison estimée : {estimatedDelivery}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Besoin d'aide ?</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href="mailto:support@ofika.app" className="hover:text-orange-600">
                      support@ofika.app
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>+221 XX XXX XX XX</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {order.status === 'pending' && (order as any).lygos_payment_url && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">Paiement en attente</h3>
              <p className="text-gray-600 mb-4">
                Votre commande est en attente de paiement. Cliquez ci-dessous pour finaliser votre achat via LyGOS.
              </p>
              <Button
                onClick={() => window.open((order as any).lygos_payment_url, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Payer avec LyGOS
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
