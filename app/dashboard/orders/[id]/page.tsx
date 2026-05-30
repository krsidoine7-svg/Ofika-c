'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Button } from "@/components/core/ui/button"
import { Badge } from "@/components/core/ui/badge"
import { Alert, AlertDescription } from "@/components/core/ui/alert"
import { 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  MapPin,
  Truck,
  Package
} from "lucide-react"
import { toast } from "sonner"
import { useOrder } from '@/lib/hooks/usePayments'
import { ORDER_STATUS_LABELS, CARD_TYPE_LABELS } from '@/lib/types/payments'
import { OrderTracker } from '@/components/features/card-ordering/OrderTracker'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const { order, loading, error, refreshOrder } = useOrder(orderId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' XOF'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-gray-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'paid':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'cancelled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: any) => {
    return ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || 'Statut inconnu'
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Votre commande est en attente de paiement. Veuillez procéder au paiement pour confirmer votre commande.'
      case 'paid':
        return 'Votre commande a été payée avec succès. Elle est maintenant en cours de traitement.'
      case 'failed':
        return 'Le paiement de votre commande a échoué. Vous pouvez réessayer ou contacter le support.'
      case 'cancelled':
        return 'Votre commande a été annulée. Vous pouvez passer une nouvelle commande si vous le souhaitez.'
      default:
        return 'Statut de commande inconnu.'
    }
  }

  const getNextSteps = (status: string) => {
    switch (status) {
      case 'pending':
        return [
          'Effectuer le paiement via le lien fourni',
          'Attendre la confirmation de paiement',
          'Recevoir un email de confirmation'
        ]
      case 'paid':
        return [
          'Votre carte est en cours de production',
          'Vous recevrez un email avec le numéro de suivi',
          'Livraison sous 7-14 jours ouvrés'
        ]
      case 'failed':
        return [
          'Vérifier vos informations de paiement',
          'Réessayer le paiement',
          'Contacter le support si le problème persiste'
        ]
      case 'cancelled':
        return [
          'Passer une nouvelle commande si souhaité',
          'Contacter le support pour toute question'
        ]
      default:
        return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Chargement de la commande...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>

            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error || 'Commande non trouvée'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  // Gérer le cas où l'ordre n'est pas trouvé
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Commande non trouvée</h2>
          <p className="text-gray-600 mb-4">
            {error || "Cette commande n'existe pas ou vous n'avez pas les droits pour la consulter."}
          </p>
          <Button onClick={() => router.back()}>
            Retour
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="h-8 w-8 text-orange-600" />
                  Commande #{(order as any)?.id?.slice(-8) || 'N/A'}
                </h1>
                <p className="text-gray-600 mt-2">
                  Détails de votre commande
                </p>
              </div>
              
              <Badge variant={getStatusBadgeVariant((order as any)?.status || 'pending')} className="text-lg px-4 py-2">
                {getStatusIcon((order as any)?.status || 'pending')}
                <span className="ml-2">
                  {getStatusLabel((order as any)?.status)}
                </span>
              </Badge>
            </div>
          </div>

          {/* Utilisation du composant OrderTracker */}
          <OrderTracker
            order={order as any}
            onRefresh={refreshOrder}
            className="max-w-4xl mx-auto"
          />
        </div>
      </div>
    </div>
  )
}
