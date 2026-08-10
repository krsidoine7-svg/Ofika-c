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
import { OrderNotifications } from '@/components/features/card-ordering/OrderNotifications'
import { PaymentButtonGeniusPay } from '@/components/features/card-ordering/PaymentButtonGeniusPay'
import { Order } from '@/lib/types/payments'
import { toast } from "sonner"

export default function OrdersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { orders, loading, error, refreshOrders } = useOrders()
  const { stats, loading: statsLoading } = useOrderStats()
  const searchParams = useSearchParams()

  useEffect(() => {
    const paymentStatus = searchParams?.get('payment')
    const orderIdParam = searchParams?.get('order_id')
    
    if (paymentStatus === 'success') {
      toast.success('Paiement initié avec succès !', {
        description: 'La commande sera mise à jour dès confirmation par le fournisseur (cela peut prendre quelques instants).',
        duration: 8000,
      })
    } else if (paymentStatus === 'error') {
      toast.error('Échec du paiement', {
        description: 'Le paiement a échoué ou a été annulé. Vous pouvez réessayer.',
        duration: 8000,
      })
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
              <p className="text-gray-600 mt-1">
                Gérez et suivez vos commandes de cartes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrderNotifications />
              <Button
                onClick={handleNewOrder}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle commande
              </Button>
            </div>
          </div>

          {/* Stats */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total commandes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                    </div>
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">En cours</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.pending_orders + stats.paid_orders}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Livrées</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completed_orders}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Montant total</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {(stats.total_spent || 0).toLocaleString()} XOF
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher par ID de commande ou type de carte..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
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
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {orders?.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {orders?.length === 0 
                    ? 'Vous n\'avez pas encore passé de commande de carte.'
                    : 'Aucune commande ne correspond à vos critères de recherche.'
                  }
                </p>
                {orders?.length === 0 && (
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
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          {getStatusIcon(order.status)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              Commande {order.order_number || `#${(order.id || '').slice(-8)}`}
                            </h3>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <span>
                              {order.card_type === 'nfc_qr' ? 'NFC + QR Code' : 'QR Code uniquement'}
                            </span>
                            <span>•</span>
                            <span>{order.quantity} carte(s)</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {(order.total_amount || 0).toLocaleString()} XOF
                          </p>
                          {(() => {
                            const isPaid = order.payment_status === 'paid' || order.payment_status === 'succeeded' || order.status === 'paid'
                            const isProcessing = order.payment_status === 'processing'

                            if (isProcessing) {
                              return (
                                <div className="mt-2">
                                  <Badge className="bg-purple-100 text-purple-700 border-none font-bold text-[10px]">
                                    Reçu en cours de vérification
                                  </Badge>
                                </div>
                              )
                            }

                            if (!isPaid && (order.payment_status === 'pending' || order.payment_status === 'failed' || order.status === 'pending' || order.status === 'failed')) {
                              return (
                                <div className="mt-2">
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
                        >
                          <Eye className="h-4 w-4 mr-1" />
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
    </ProtectedRoute>
  )
}