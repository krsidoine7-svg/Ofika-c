'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Package,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Calendar,
  MapPin,
  Phone,
  User,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  Inbox
} from "lucide-react"
import { useOrders, useOrderStats } from '@/lib/hooks/usePayments'
import { PaymentButtonGeniusPay } from '@/components/features/card-ordering/PaymentButtonGeniusPay'
import { Order } from '@/lib/types/payments'
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { orders, loading, error, refreshOrders } = useOrders()
  const { stats, loading: statsLoading } = useOrderStats()

  // Gestion du retour de paiement en ligne (GeniusPay / Wave)
  useEffect(() => {
    const paymentStatus = searchParams?.get('payment')
    const orderIdParam = searchParams?.get('order_id')
    const referenceParam = searchParams?.get('reference')

    if (paymentStatus === 'success' && orderIdParam && referenceParam) {
      const verifyPayment = async () => {
        setIsVerifying(true)
        const loadingToast = toast.loading('Vérification de votre paiement en cours...')

        try {
          const res = await fetch('/api/payments/geniuspay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderIdParam, reference: referenceParam })
          })

          const data = await res.json()
          toast.dismiss(loadingToast)

          if (data.success && data.payment_status === 'succeeded') {
            toast.success('🎉 Paiement validé avec succès !', {
              description: 'Votre commande a été mise à jour et envoyée en fabrication.',
              duration: 8000,
            })
            refreshOrders()
          } else {
            setShowErrorDialog(true)
            refreshOrders()
          }
          router.replace('/dashboard/orders')
        } catch {
          toast.dismiss(loadingToast)
          setShowErrorDialog(true)
          router.replace('/dashboard/orders')
        } finally {
          setIsVerifying(false)
        }
      }
      verifyPayment()
    } else if (paymentStatus === 'success') {
      toast.success('Paiement initié avec succès !', {
        description: 'Votre commande sera mise à jour dès confirmation par l’opérateur.',
        duration: 8000,
      })
    } else if (paymentStatus === 'error') {
      toast.error('Échec du paiement', {
        description: 'Le paiement a échoué ou a été annulé. Vous pouvez réessayer à tout moment.',
        duration: 8000,
      })
      setShowErrorDialog(true)
      router.replace('/dashboard/orders')
    }
  }, [searchParams])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshOrders()
      toast.success('Liste des commandes actualisée')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCopyOrderNumber = (e: React.MouseEvent, num: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(num)
    setCopiedId(num)
    toast.success(`Numéro ${num} copié`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtrage des commandes
  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return orders.filter(order => {
      const q = searchTerm.toLowerCase().trim()
      const orderIdStr = (order.order_number || order.id || '').toLowerCase()
      const cardTypeStr = (order.card_type || '').toLowerCase()
      const recipientName = (order.shipping_address?.name || '').toLowerCase()
      const recipientCity = (order.shipping_address?.city || '').toLowerCase()

      const matchesSearch = !q ||
        orderIdStr.includes(q) ||
        cardTypeStr.includes(q) ||
        recipientName.includes(q) ||
        recipientCity.includes(q)

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  // Compteurs pour les onglets
  const tabCounts = useMemo(() => {
    if (!orders) return { all: 0, pending: 0, paid: 0, production: 0, shipped: 0, delivered: 0 }
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      paid: orders.filter(o => o.status === 'paid').length,
      production: orders.filter(o => o.status === 'preparing' || (o.status as any) === 'production').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length
    }
  }, [orders])

  // Statut de paiement élégant
  const renderPaymentBadge = (order: Order) => {
    const isPaid = order.payment_status === 'paid' || order.payment_status === 'succeeded' || order.status === 'paid'
    const isProcessing = order.payment_status === 'processing'
    const isFailed = order.payment_status === 'failed' || order.status === 'failed'

    if (isProcessing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Reçu en cours de vérification</span>
        </span>
      )
    }

    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Payée</span>
        </span>
      )
    }

    if (isFailed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>Paiement échoué</span>
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
        <Clock className="w-3 h-3 text-sky-600" />
        <span>Paiement en attente</span>
      </span>
    )
  }

  // Statut logistique / livraison
  const renderShippingBadge = (order: Order) => {
    switch (order.status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Livrée</span>
          </span>
        )
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>En cours de livraison</span>
          </span>
        )
      case 'preparing':
      case 'production' as any:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Package className="w-3 h-3 text-indigo-600" />
            <span>En fabrication NFC</span>
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span>Annulée</span>
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <Clock className="w-3 h-3 text-neutral-500" />
            <span>En attente</span>
          </span>
        )
    }
  }

  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-neutral-400 gap-3">
        <RefreshCw className="w-7 h-7 animate-spin text-neutral-900" />
        <p className="text-xs font-semibold text-neutral-500">Chargement sécurisé de vos commandes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 px-2 sm:px-4 overflow-x-hidden">
      {/* Fil d'Ariane Retour */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors py-1 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Retour au tableau de bord</span>
        </Link>
      </div>

      {/* ==================================================================== */}
      {/* 1. EN-TÊTE ÉPURÉ APPLE / LINEAR                                     */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-neutral-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Package className="w-3 h-3 text-neutral-700" />
            <span>Commandes & Suivi Logistique</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Mes Commandes de Cartes
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-xl leading-relaxed">
            Consultez le statut de fabrication, effectuez vos règlements ou suivez la livraison de vos cartes NFC Ofika.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-orange-500")} />
            <span>Actualiser</span>
          </Button>

          <Button
            type="button"
            onClick={() => router.push('/dashboard/orders/new')}
            className="h-9 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white font-semibold text-xs shadow-md shadow-neutral-950/20 ring-1 ring-neutral-800 transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Nouvelle commande</span>
          </Button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. STATS BENTO (KPIs) - FORMAT COMPACT & PROPORTIONNÉ                */}
      {/* ==================================================================== */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white rounded-xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Commandes</p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">{stats.total_orders || 0}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Inbox className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">En cours</p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">
                {(stats.pending_orders || 0) + (stats.paid_orders || 0)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Livrées</p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">{stats.completed_orders || 0}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Total Investi</p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">
                {(stats.total_spent || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-neutral-500">FCFA</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. BARRE DE FILTRES SEGMENTÉE SANS SCROLLBAR NATIVE                  */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Onglets segmentés avec surbrillance active et no-scrollbar */}
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar scrollbar-none py-0.5">
          <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/80 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                statusFilter === 'all'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <span>Toutes</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                statusFilter === 'all' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tabCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                statusFilter === 'pending'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <Clock className="w-3 h-3 text-sky-500" />
              <span>En attente</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                statusFilter === 'pending' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tabCounts.pending}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('paid')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                statusFilter === 'paid'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Payées</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                statusFilter === 'paid' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tabCounts.paid}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('shipped')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                statusFilter === 'shipped'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <Truck className="w-3 h-3 text-purple-400" />
              <span>Expédiées</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                statusFilter === 'shipped' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tabCounts.shipped}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('delivered')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                statusFilter === 'delivered'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Livrées</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                statusFilter === 'delivered' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tabCounts.delivered}
              </span>
            </button>
          </div>
        </div>

        {/* Champ de recherche compact */}
        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher #..."
            className="pl-8 pr-7 h-8 rounded-lg bg-white border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 shadow-xs focus-visible:ring-neutral-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. LISTE DES COMMANDES                                               */}
      {/* ==================================================================== */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs font-semibold">Une erreur est survenue lors de la récupération de vos commandes.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="rounded-xl text-xs h-8">
            Réessayer
          </Button>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-neutral-200 text-center py-16 px-6 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 bg-neutral-100 text-neutral-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">
              {searchTerm || statusFilter !== 'all'
                ? "Aucune commande trouvée pour ces filtres"
                : "Vous n'avez pas encore passé de commande"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'all'
                ? "Modifiez votre recherche ou sélectionnez « Toutes » pour voir l'ensemble de votre historique."
                : "Commandez votre première carte de visite connectée NFC pour développer votre réseau professionnel."}
            </p>
          </div>

          {searchTerm || statusFilter !== 'all' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="rounded-xl text-xs"
            >
              Réinitialiser les filtres
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => router.push('/dashboard/orders/new')}
              className="bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-semibold rounded-xl h-10 px-5 shadow-sm"
            >
              Commander ma première carte NFC
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const orderNum = order.order_number || `#${(order.id || '').slice(-8).toUpperCase()}`
            const isPaid = order.payment_status === 'paid' || order.payment_status === 'succeeded' || order.status === 'paid'
            const isProcessing = order.payment_status === 'processing'

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200/80 hover:border-neutral-300 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Section Gauche : Identifiants, Badges et Infos Produits */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5 text-neutral-700">
                    <Package className="w-5 h-5 text-neutral-700" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Ligne 1 : Numéro, Badges Paiement & Livraison */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => handleCopyOrderNumber(e, orderNum)}
                        className="inline-flex items-center gap-1 font-mono text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        title="Cliquer pour copier le numéro"
                      >
                        {copiedId === orderNum ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700" />
                        )}
                        <span>{orderNum}</span>
                      </button>

                      {renderPaymentBadge(order)}
                      {renderShippingBadge(order)}
                    </div>

                    {/* Ligne 2 : Type de carte & Quantité */}
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                      {order.card_type === 'nfc_qr' ? 'Carte NFC Connectée + QR Code' : 'Carte QR Code Numérique'}
                      <span className="text-xs font-normal text-neutral-500 ml-1.5">
                        • {order.quantity || 1} exemplaire{(order.quantity || 1) > 1 ? 's' : ''}
                      </span>
                    </h3>

                    {/* Ligne 3 : Métadonnées Date & Destinataire */}
                    <div className="flex flex-wrap items-center text-[11px] text-neutral-500 gap-x-3 gap-y-1 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>

                      {order.shipping_address?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span>{order.shipping_address.city}</span>
                          {order.shipping_address.address && (
                            <span className="truncate max-w-[160px] sm:max-w-[220px]">
                              ({order.shipping_address.address})
                            </span>
                          )}
                        </span>
                      )}

                      {order.shipping_address?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{order.shipping_address.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Droite : Prix & Boutons d'Action */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-base sm:text-lg font-bold text-neutral-900 leading-none">
                      {(order.total_amount || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-neutral-500">FCFA</span>
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Livraison Abidjan Gratuite
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bouton de paiement si non payé (GeniusPay : Wave, Orange, MTN, Moov, CB) */}
                    {!isPaid && !isProcessing && (
                      <PaymentButtonGeniusPay
                        orderId={order.id}
                        text="Payer maintenant"
                        className="h-8 px-3 text-xs bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl shadow-xs"
                      />
                    )}

                    {/* Bouton Détails & Suivi */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="h-8 px-3 rounded-xl border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Détails & Suivi</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. MODAL DE DÉTAILS ET SUIVI DE COMMANDE                             */}
      {/* ==================================================================== */}
      <Dialog open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-white border border-neutral-200 shadow-2xl">
          {selectedOrder && (
            <>
              <DialogHeader className="border-b border-neutral-100 pb-3.5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                    {selectedOrder.order_number || `#${(selectedOrder.id || '').slice(-8).toUpperCase()}`}
                  </span>
                  <div>{renderPaymentBadge(selectedOrder)}</div>
                </div>

                <DialogTitle className="text-lg font-bold text-neutral-900">
                  Détails de la commande
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-400">
                  Passée le {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </DialogDescription>
              </DialogHeader>

              {/* Contenu Récapitulatif */}
              <div className="space-y-4 my-2 text-xs">
                {/* 1. Étapes de suivi logistique */}
                <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Suivi de production & livraison
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900">1. Commande enregistrée</p>
                        <p className="text-[10px] text-neutral-500">Reçue par le système Ofika</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                        selectedOrder.payment_status === 'paid' || selectedOrder.status === 'paid'
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-200 text-neutral-500"
                      )}>
                        {selectedOrder.payment_status === 'paid' || selectedOrder.status === 'paid' ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900">2. Validation du paiement</p>
                        <p className="text-[10px] text-neutral-500">
                          {selectedOrder.payment_status === 'paid' || selectedOrder.status === 'paid'
                            ? "Règlement confirmé"
                            : "En attente de paiement"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                        selectedOrder.status === 'delivered' || selectedOrder.status === 'shipped' || selectedOrder.status === 'preparing'
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-200 text-neutral-500"
                      )}>
                        {selectedOrder.status === 'delivered' || selectedOrder.status === 'shipped' ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Package className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900">3. Fabrication & Programmation NFC</p>
                        <p className="text-[10px] text-neutral-500">Gravure et configuration de la puce sans contact</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                        selectedOrder.status === 'delivered'
                          ? "bg-emerald-100 text-emerald-700"
                          : selectedOrder.status === 'shipped'
                          ? "bg-amber-100 text-amber-700"
                          : "bg-neutral-200 text-neutral-500"
                      )}>
                        {selectedOrder.status === 'delivered' ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Truck className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900">4. Expédition & Remise en main propre</p>
                        <p className="text-[10px] text-neutral-500">
                          {selectedOrder.status === 'delivered'
                            ? "Colis livré avec succès"
                            : selectedOrder.status === 'shipped'
                            ? "Coursier en route"
                            : "Livraison sous 24h-48h dès fabrication"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Coordonnées de livraison */}
                {selectedOrder.shipping_address && (
                  <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-white space-y-1.5">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Adresse de livraison
                    </p>
                    <p className="font-bold text-neutral-900">{selectedOrder.shipping_address.name}</p>
                    <p className="text-neutral-600">
                      {selectedOrder.shipping_address.address}, {selectedOrder.shipping_address.city}
                    </p>
                    {selectedOrder.shipping_address.phone && (
                      <p className="text-neutral-500">Téléphone : {selectedOrder.shipping_address.phone}</p>
                    )}
                  </div>
                )}

                {/* 3. Décomposition Financière */}
                <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-white space-y-2">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Produit ({selectedOrder.quantity || 1}x Carte NFC)</span>
                    <span className="font-medium text-neutral-900">
                      {(selectedOrder.total_amount || 0).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Frais de livraison (Abidjan)</span>
                    <span className="font-medium text-emerald-600">Gratuit (0 FCFA)</span>
                  </div>
                  <div className="border-t border-neutral-100 pt-2 flex items-center justify-between font-bold text-sm text-neutral-900">
                    <span>Total payé</span>
                    <span>{(selectedOrder.total_amount || 0).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl text-xs h-9 px-4"
                >
                  Fermer
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push(`/dashboard/orders/${selectedOrder.id}`)}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-xs h-9 px-4 flex items-center gap-1.5 shadow-xs"
                >
                  <span>Page de suivi complète</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* 6. MODAL D'ÉCHEC DE PAIEMENT                                         */}
      {/* ==================================================================== */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white border border-neutral-200 shadow-2xl">
          <DialogHeader className="space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-rose-600">
              Le paiement a échoué
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Nous n'avons pas pu valider votre paiement ou celui-ci a été refusé par votre opérateur. Vous pouvez renouveler l'opération à tout moment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3">
            <Button
              onClick={() => setShowErrorDialog(false)}
              className="bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-xs h-9 px-4"
            >
              Compris, réessayer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
