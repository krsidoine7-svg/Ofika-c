'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Package,
  ShieldCheck
} from "lucide-react"
import { useOrder } from '@/lib/hooks/usePayments'
import { ORDER_STATUS_LABELS, CARD_TYPE_LABELS } from '@/lib/types/payments'
import { PaymentButtonGeniusPay } from '@/components/features/card-ordering/PaymentButtonGeniusPay'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const { order, loading, error, refreshOrder } = useOrder(orderId)

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatPrice = (price: number) => {
    return (price || 0).toLocaleString('fr-FR') + ' XOF'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />
      case 'paid':
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-slate-400" />
      default:
        return <Clock className="h-4 w-4 text-slate-500" />
    }
  }

  const getStatusLabel = (status: any) => {
    return ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || 'Statut en attente'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Chargement de votre commande...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
        <div className="max-w-2xl mx-auto space-y-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/orders')}
            className="rounded-xl border-slate-200 text-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux commandes
          </Button>

          <Alert className="border-red-200 bg-red-50 text-red-800 rounded-2xl p-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="mt-2 text-sm">
              {error || "Cette commande n'existe pas ou vous n'avez pas les droits pour la consulter."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const isPaid = order.payment_status === 'paid' || order.payment_status === 'succeeded' || order.status === 'paid'
  const isProcessing = order.payment_status === 'processing'
  const orderNumber = order.order_number || `#${order.id.slice(-8).toUpperCase()}`

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6 sm:pt-10 font-sans">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/orders')}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-white text-xs sm:text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Retour aux commandes
          </Button>

          <Badge className="px-3 py-1 text-xs font-bold rounded-full bg-slate-900 text-white flex items-center gap-1.5">
            {getStatusIcon(order.status || 'pending')}
            <span>{getStatusLabel(order.status)}</span>
          </Badge>
        </div>

        {/* Carte d'en-tête Bento */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Commande</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {orderNumber}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Passée le {formatDate(order.created_at || new Date().toISOString())}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Montant total</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-0.5">
                {formatPrice(order.total_amount || order.amount_cents || 0)}
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                Livraison gratuite incluse
              </span>
            </div>
          </div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            
            {/* Produit commandé */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-500" />
                Produit & Gravure
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-900">
                  <span>Carte NFC Physique Personnalisée</span>
                  <span>1×</span>
                </div>
                {order.metadata?.engraved_name && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Nom gravé :</span> {order.metadata.engraved_name}
                  </p>
                )}
                {order.metadata?.engraved_company && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Entreprise :</span> {order.metadata.engraved_company}
                  </p>
                )}
                {order.metadata?.card_finish && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Finition :</span> {order.metadata.card_finish === 'white' ? 'Blanc Épuré' : 'Noir Mat Luxe'}
                  </p>
                )}
              </div>
            </div>

            {/* Adresse de livraison */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                Adresse de Livraison
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <p className="font-bold text-sm text-slate-900">{order.shipping_address?.name || 'Client'}</p>
                <p>{order.shipping_address?.address || 'Adresse standard'}</p>
                <p className="font-medium text-slate-700">{order.shipping_address?.city || 'Abidjan'}, Côte d'Ivoire</p>
                {order.shipping_address?.phone && (
                  <p className="text-slate-500 pt-1 font-mono">Tél : {order.shipping_address.phone}</p>
                )}
              </div>
            </div>

          </div>

          {/* Action de Paiement si impayé */}
          {!isPaid && !isProcessing && (
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Paiement en attente</h4>
                  <p className="text-xs text-slate-500">Réglez votre commande en toute sécurité par Mobile Money (Wave, Orange, MTN, Moov) ou Carte Bancaire.</p>
                </div>
              </div>
              <PaymentButtonGeniusPay
                orderId={order.id}
                text={`Payer maintenant (${formatPrice(order.total_amount || order.amount_cents || 0)})`}
                className="w-full h-12 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md flex items-center justify-center gap-2"
              />
            </div>
          )}

          {isPaid && (
            <div className="mt-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-sm text-emerald-950">Commande confirmée et payée</p>
                <p className="text-emerald-700">Votre carte physique est en cours de gravure dans notre atelier d'Abidjan.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
