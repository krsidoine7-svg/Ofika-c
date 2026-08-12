'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus,
  Package,
  Search,
  Filter,
  Eye,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { ProtectedRoute } from "@/components/core/auth/ProtectedRoute"
import { useOrders, useOrderStats } from '@/lib/hooks/usePayments'

import { PaymentButtonGeniusPay } from '@/components/features/card-ordering/PaymentButtonGeniusPay'
import { WaveReceiptUploadButton } from '@/components/features/card-ordering/WaveReceiptUploadButton'
import { Order } from '@/lib/types/payments'
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function OrdersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  
  const { orders, loading, error, refreshOrders } = useOrders()
  const { stats, loading: statsLoading } = useOrderStats()
  const searchParams = useSearchParams()

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
            toast.success('Paiement validé avec succès !', {
              description: 'Votre commande a été mise à jour.',
              duration: 8000,
            })
            refreshOrders()
          } else {
            setShowErrorDialog(true)
            refreshOrders()
          }
          
          router.replace('/dashboard/orders')
          
        } catch (error) {
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
        description: 'La commande sera mise à jour dès confirmation par le fournisseur (cela peut prendre quelques instants).',
        duration: 8000,
      })
    } else if (paymentStatus === 'error') {
      toast.error('Échec du paiement', {
        description: 'Le paiement a échoué ou a été annulé. Vous pouvez réessayer.',
        duration: 8000,
      })
      setShowErrorDialog(true)
      router.replace('/dashboard/orders')
    }
  }, [searchParams])

  const handleNewOrder = () => {
    router.push('/dashboard/orders/new')
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`)
  }

  const handleRefresh = () => {
    refreshOrders()
    toast.success('Commandes actualisées')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
      case 'production':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
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
        return 'En attente'
      case 'paid':
        return 'Payée'
      case 'production':
        return 'En production'
      case 'shipped':
        return 'Expédiée'
      case 'delivered':
        return 'Livrée'
      case 'failed':
        return 'Échec'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'paid':
      case 'production':
        return <Package className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <AlertCircle className="h-4 w-4" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.card_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement de vos commandes...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Commandes</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
                Gérez et suivez vos commandes de cartes
              </p>
            </div>
            <div className="flex items-center self-start sm:self-auto shrink-0 mt-2 sm:mt-0">
              <Button
                onClick={handleNewOrder}
                className="bg-orange-500 hover:bg-orange-600 text-white h-9 sm:h-10 px-4 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle commande
              </Button>
            </div>
          </div>

          {/* Stats */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Total commandes</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                    </div>
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">En cours</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.pending_orders + stats.paid_orders}</p>
                    </div>
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Livrées</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed_orders}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Montant total</p>
                      <p className="text-xl sm:text-2xl font-bold text-orange-600">
                        {(stats.total_spent || 0).toLocaleString()} XOF
                      </p>
                    </div>
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher par ID de commande ou type de carte..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="paid">Payée</option>
                    <option value="production">En production</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="failed">Échec</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {error && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Erreur lors du chargement des commandes</p>
                  <Button variant="outline" onClick={handleRefresh} className="mt-2">
                    Réessayer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune commande trouvée
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Aucune commande ne correspond à vos critères de recherche.'
                    : 'Vous n\'avez pas encore passé de commande.'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button
                    onClick={handleNewOrder}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Commander ma première carte
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                          {getStatusIcon(order.status)}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                              Commande {order.order_number || `#${(order.id || '').slice(-8)}`}
                            </h3>
                            <Badge className={`${getStatusColor(order.status)} text-[10px] sm:text-xs shrink-0`}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-x-2 gap-y-1">
                            <span>
                              {order.card_type === 'nfc_qr' ? 'NFC + QR Code' : 'QR Code uniquement'}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>{order.quantity} carte(s)</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 shrink-0" />
                              {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                        <div className="text-left sm:text-right flex items-center sm:flex-col justify-between sm:justify-center">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {(order.total_amount || 0).toLocaleString()} XOF
                          </p>
                          {(() => {
                            const isPaid = order.payment_status === 'paid' || order.payment_status === 'succeeded' || order.status === 'paid'
                            const isProcessing = order.payment_status === 'processing'

                            if (isProcessing) {
                              return (
                                <div className="sm:mt-1">
                                  <Badge className="bg-purple-100 text-purple-700 border-none font-bold text-[10px]">
                                    Reçu en cours de vérification
                                  </Badge>
                                </div>
                              )
                            }

                            if (!isPaid && (order.payment_status === 'pending' || order.payment_status === 'failed' || order.status === 'pending' || order.status === 'failed')) {
                              if (order.payment_provider === 'wave' || order.payment_method === 'wave') {
                                return (
                                  <div className="sm:mt-1 w-full sm:w-auto">
                                    <WaveReceiptUploadButton 
                                      orderId={order.id}
                                      paymentStatus={order.payment_status}
                                      onUploadComplete={() => refreshOrders()}
                                    />
                                  </div>
                                )
                              }
                              
                              return (
                                <div className="sm:mt-1 w-full sm:w-auto">
                                  <PaymentButtonGeniusPay 
                                    orderId={order.id} 
                                    text="Payer ma commande"
                                    className="w-full text-xs py-1"
                                  />
                                </div>
                              )
                            }

                            return null
                          })()}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                          className="w-full sm:w-auto shrink-0 text-xs sm:text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1 shrink-0" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Le paiement a échoué</DialogTitle>
            <DialogDescription>
              Nous n'avons pas pu valider votre paiement ou celui-ci a été refusé par votre opérateur. Veuillez réessayer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>Réessayer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}