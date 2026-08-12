'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Package,
    Search,
    Filter,
    Loader2,
    Eye,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    ChevronDown,
    MoreVertical,
    Mail,
    User
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface Order {
    id: string
    order_number: string
    user_id: string
    amount_cents: number
    shipping_cents: number
    total_cents: number
    currency: string
    payment_status: string
    shipping_status: string
    created_at: string
    shipping_address: any
    card_type?: string
    quantity?: number
    unit_price?: number
    payment_method?: string
    payment_provider?: string
    status?: string
    user?: {
        name: string
        email: string
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const supabase = useMemo(() => createClient(), [])

    // États pour le dialogue de confirmation groupé
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string,
        message: string,
        action: () => void,
        variant: 'default' | 'destructive'
    }>({
        title: '',
        message: '',
        action: () => { },
        variant: 'default'
    })

    const openConfirm = (title: string, message: string, action: () => void, variant: 'default' | 'destructive' = 'default') => {
        // Laisser le DropdownMenu se fermer d'abord pour éviter tout blocage de focus
        setTimeout(() => {
            setConfirmConfig({ title, message, action, variant })
            setIsConfirmOpen(true)
        }, 50)
    }

    const openDetailsModal = (order: Order) => {
        // Même chose : on attend que le menu déroulant se ferme pour éviter de bloquer la page
        setTimeout(() => {
            setSelectedOrder(order)
            setIsDetailsOpen(true)
        }, 50)
    }

    useEffect(() => {
        fetchOrders()

        // Abonnement temps réel Supabase pour rafraîchir le tableau automatiquement dès qu'un webhook GeniusPay valide un paiement
        const channel = supabase
            .channel('admin-orders-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    fetchOrders()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    async function fetchOrders() {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/orders')
            const json = await res.json()

            if (!res.ok || !json.success) throw new Error(json.error || 'Erreur lors de la récupération')
            setOrders(json.orders || [])
        } catch (error: any) {
            console.error('Erreur fetch orders:', error)
            toast.error(error?.message || 'Impossible de charger les commandes')
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (
            order.order_number.toLowerCase().includes(search.toLowerCase()) ||
            order.user?.email.toLowerCase().includes(search.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(search.toLowerCase())
        )

        let matchesFilter = true
        if (statusFilter !== 'all') {
            matchesFilter = order.payment_status === statusFilter || order.shipping_status === statusFilter
        }

        return matchesSearch && matchesFilter
    })

    const updatePaymentStatus = async (orderId: string, newStatus: string) => {
        try {
            setIsConfirmOpen(false)
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: orderId,
                    payment_status: newStatus,
                    status: newStatus === 'succeeded' ? 'paid' : 'failed',
                    paid_at: newStatus === 'succeeded' ? new Date().toISOString() : null
                })
            })
            const json = await res.json()

            if (!res.ok || !json.success) throw new Error(json.error || 'Erreur mise à jour')

            toast.success(`Statut de paiement mis à jour : ${newStatus}`)
            setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: newStatus, status: newStatus === 'succeeded' ? 'paid' : 'failed' } : o))
        } catch (error: any) {
            console.error('Erreur updatePaymentStatus:', error)
            toast.error(error?.message || 'Erreur lors de la mise à jour')
        }
    }

    const updateShippingStatus = async (orderId: string, newStatus: string) => {
        try {
            setIsConfirmOpen(false)
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: orderId,
                    shipping_status: newStatus,
                    status: newStatus,
                    shipped_at: newStatus === 'shipped' ? new Date().toISOString() : null,
                    delivered_at: newStatus === 'delivered' ? new Date().toISOString() : null
                })
            })
            const json = await res.json()

            if (!res.ok || !json.success) throw new Error(json.error || 'Erreur mise à jour')

            toast.success(`Statut de livraison mis à jour : ${newStatus}`)
            setOrders(orders.map(o => o.id === orderId ? { ...o, shipping_status: newStatus, status: newStatus } : o))
        } catch (error: any) {
            console.error('Erreur updateShippingStatus:', error)
            toast.error(error?.message || 'Erreur lors de la mise à jour')
        }
    }

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'succeeded': return <Badge className="bg-green-100 text-green-700 border-none font-bold text-[10px] uppercase">Payé</Badge>
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 border-none font-bold text-[10px] uppercase">En attente</Badge>
            case 'processing': return <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px] uppercase animate-pulse">Reçu à valider</Badge>
            case 'failed': return <Badge className="bg-red-100 text-red-700 border-none font-bold text-[10px] uppercase">Échoué</Badge>
            case 'cancelled': return <Badge className="bg-gray-100 text-gray-700 border-none font-bold text-[10px] uppercase">Annulé</Badge>
            default: return <Badge variant="secondary" className="text-[10px] uppercase">{status}</Badge>
        }
    }

    const getShippingBadge = (status: string) => {
        switch (status) {
            case 'delivered': return <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px] uppercase">Livré</Badge>
            case 'shipped': return <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold text-[10px] uppercase">Expédié</Badge>
            case 'preparing': return <Badge className="bg-purple-100 text-purple-700 border-none font-bold text-[10px] uppercase">Préparation</Badge>
            case 'pending': return <Badge className="bg-gray-100 text-gray-600 border-none font-bold text-[10px] uppercase">En attente</Badge>
            default: return <Badge variant="secondary" className="text-[10px] uppercase">{status}</Badge>
        }
    }

    const formatCurrency = (cents: number, currency: string) => {
        const amount = cents / (currency === 'XOF' ? 1 : 100)
        return amount.toLocaleString() + ' ' + currency
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Commandes</h1>
                    <p className="text-gray-500 font-medium">Suivi des ventes et de la logistique ({orders.length})</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="N° commande, email..."
                            className="pl-10 h-11 border-gray-200 focus:ring-orange-500 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-11 px-4 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:ring-orange-500 outline-none w-full sm:w-auto shadow-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="succeeded">Payées</option>
                        <option value="preparing">En préparation</option>
                        <option value="shipped">Expédiées</option>
                        <option value="delivered">Livrées</option>
                    </select>
                </div>
            </div>

            {/* Orders List Card */}
            <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">N° & Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Client</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Paiement</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Livraison</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors">#{order.order_number}</span>
                                                <span className="text-[10px] text-gray-400 flex items-center mt-1 font-medium">
                                                    <Clock className="w-3 h-3 mr-1 opacity-60" />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold mr-3 border border-orange-100">
                                                    {order.user?.name?.charAt(0) || order.user?.email.charAt(0) || '?'}
                                                </div>
                                                <div className="min-w-0 max-w-[200px]">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{order.user?.name || 'Inconnu'}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{order.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getPaymentBadge(order.payment_status)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getShippingBadge(order.shipping_status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-gray-900">
                                                {formatCurrency(order.total_cents, order.currency)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-gray-100">
                                                    <DropdownMenuLabel>Actions Commande</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openDetailsModal(order)}>
                                                        <Eye className="w-4 h-4 mr-2" /> Voir Détails
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-[10px] uppercase text-gray-400">Paiement</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openConfirm(
                                                        "Confirmer le paiement ?",
                                                        `Marquer la commande #${order.order_number} comme payée manuellement ?`,
                                                        () => updatePaymentStatus(order.id, 'succeeded')
                                                    )}>
                                                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Marquer comme Payé
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openConfirm(
                                                        "Paiement échoué ?",
                                                        `Marquer la commande #${order.order_number} comme ayant échoué ?`,
                                                        () => updatePaymentStatus(order.id, 'failed'),
                                                        'destructive'
                                                    )}>
                                                        <XCircle className="w-4 h-4 mr-2 text-red-500" /> Marquer comme Échoué
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-[10px] uppercase text-gray-400">Logistique</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openConfirm(
                                                        "Lancer la préparation ?",
                                                        `Passer la commande #${order.order_number} en état de préparation ?`,
                                                        () => updateShippingStatus(order.id, 'preparing')
                                                    )}>
                                                        <Package className="w-4 h-4 mr-2 text-purple-500" /> En préparation
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openConfirm(
                                                        "Commande expédiée ?",
                                                        `Confirmer que la commande #${order.order_number} a été remise au transporteur ?`,
                                                        () => updateShippingStatus(order.id, 'shipped')
                                                    )}>
                                                        <Truck className="w-4 h-4 mr-2 text-indigo-500" /> Marquer comme Expédié
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openConfirm(
                                                        "Livraison terminée ?",
                                                        `Confirmer la réception de la commande #${order.order_number} par le client ?`,
                                                        () => updateShippingStatus(order.id, 'delivered')
                                                    )}>
                                                        <CheckCircle2 className="w-4 h-4 mr-2 text-blue-500" /> Marquer comme Livré
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Package className="w-12 h-12 text-gray-200 mb-4" />
                                                <p className="text-gray-400 font-medium">Aucune commande enregistrée</p>
                                                {search || statusFilter !== 'all' ? (
                                                    <Button variant="link" className="text-orange-500 mt-2" onClick={() => { setSearch(''); setStatusFilter('all') }}>Réinitialiser les filtres</Button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-gray-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Truck className="w-24 h-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg font-black uppercase flex items-center">
                            <Truck className="w-5 h-5 mr-3 text-orange-400" />
                            Logistique
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <span className="text-sm font-medium">À expédier</span>
                            <Badge className="bg-orange-500 text-white border-none">{orders.filter(o => o.shipping_status === 'preparing').length}</Badge>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <span className="text-sm font-medium">En transit</span>
                            <Badge className="bg-blue-500 text-white border-none">{orders.filter(o => o.shipping_status === 'shipped').length}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-green-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CreditCard className="w-24 h-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg font-black uppercase flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-3 text-white" />
                            Paiements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                            <span className="text-sm font-medium">CA Total (Confirmé)</span>
                            <span className="text-lg font-black">
                                {orders.filter(o => o.payment_status === 'succeeded').reduce((acc, current) => acc + current.total_cents, 0).toLocaleString()} XOF
                            </span>
                        </div>
                        <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 font-bold" size="sm">
                            Rapport Analytics
                        </Button>
                    </CardContent>
                </Card>
            </div>
            {/* Modal de Confirmation Générique */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg",
                            confirmConfig.variant === 'destructive' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                        )}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-black text-gray-900 mb-2">{confirmConfig.title}</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium leading-relaxed">
                            {confirmConfig.message}
                        </DialogDescription>
                    </div>
                    <div className="bg-gray-50 p-4 flex gap-3 justify-center border-t border-gray-100">
                        <Button
                            variant="ghost"
                            onClick={() => setIsConfirmOpen(false)}
                            className="rounded-xl font-bold flex-1 h-12"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={confirmConfig.action}
                            className={cn(
                                "rounded-xl font-black uppercase tracking-widest flex-1 h-12 shadow-md",
                                confirmConfig.variant === 'destructive' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"
                            )}
                        >
                            Confirmer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Détails de Commande */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-gray-900 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center justify-between">
                            <span>Détails de la Commande</span>
                            <Badge className="bg-orange-500 text-white font-bold border-none">#{selectedOrder?.order_number}</Badge>
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium">
                            Passée le {selectedOrder ? new Date(selectedOrder.created_at).toLocaleString('fr-FR', {
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : ''}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Section Client */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                                <User className="w-3 h-3 mr-2 text-orange-500" />
                                Compte Client
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="font-bold text-gray-900">{selectedOrder?.user?.name || 'Inconnu'}</p>
                                <p className="text-sm text-gray-500">{selectedOrder?.user?.email}</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">ID: {selectedOrder?.user_id}</p>
                            </div>
                        </div>

                        {/* Section Articles */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                                <Package className="w-3 h-3 mr-2 text-orange-500" />
                                Articles & Paiement
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-900">
                                            {selectedOrder?.card_type === 'nfc_qr' ? 'Carte NFC + QR Code' : 'Carte QR Code'}
                                        </p>
                                        <p className="text-xs text-gray-500">Quantité: {selectedOrder?.quantity || 1}</p>
                                    </div>
                                    <p className="font-black text-gray-900">{formatCurrency(selectedOrder?.total_cents || 0, selectedOrder?.currency || 'XOF')}</p>
                                </div>
                                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Mode:</span>
                                    <span className="text-sm font-black text-orange-600 uppercase italic">
                                        {selectedOrder?.payment_method || selectedOrder?.payment_provider || 'Non spécifié'}
                                    </span>
                                </div>
                                {((selectedOrder as any)?.metadata?.receipt_url) && (
                                    <div className="pt-3 border-t border-gray-200 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-400 uppercase block">Reçu de Paiement Wave :</span>
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-[10px] h-7 px-3 rounded-lg"
                                                    onClick={() => {
                                                        setIsDetailsOpen(false);
                                                        openConfirm(
                                                            "Paiement échoué ?",
                                                            `Refuser le reçu et marquer la commande #${selectedOrder?.order_number} comme échouée ?`,
                                                            () => updatePaymentStatus(selectedOrder!.id, 'failed'),
                                                            'destructive'
                                                        );
                                                    }}
                                                >
                                                    Refuser
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] h-7 px-3 rounded-lg"
                                                    onClick={() => {
                                                        setIsDetailsOpen(false);
                                                        openConfirm(
                                                            "Valider ce paiement ?",
                                                            `Valider manuellement le reçu de paiement de la commande #${selectedOrder?.order_number} ?`,
                                                            () => updatePaymentStatus(selectedOrder!.id, 'succeeded')
                                                        );
                                                    }}
                                                >
                                                    Valider le Reçu
                                                </Button>
                                            </div>
                                        </div>
                                        <a 
                                            href={((selectedOrder as any)?.metadata?.receipt_url)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="block relative rounded-xl overflow-hidden border border-gray-200 max-h-48 group cursor-zoom-in"
                                        >
                                            <img 
                                                src={((selectedOrder as any)?.metadata?.receipt_url)} 
                                                alt="Reçu Wave" 
                                                className="object-cover w-full h-full transition-transform group-hover:scale-105" 
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section Livraison */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                                <Truck className="w-3 h-3 mr-2 text-orange-500" />
                                Informations de Livraison
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Destinataire</span>
                                        <p className="font-bold">{selectedOrder?.shipping_address?.name || selectedOrder?.shipping_address?.full_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Téléphone</span>
                                        <p className="font-bold">{selectedOrder?.shipping_address?.phone || 'Non fourni'}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Adresse complète</span>
                                    <p className="font-medium text-gray-700 leading-relaxed">
                                        {selectedOrder?.shipping_address?.address || selectedOrder?.shipping_address?.line1}
                                        <br />
                                        {selectedOrder?.shipping_address?.city}, {selectedOrder?.shipping_address?.postal_code || selectedOrder?.shipping_address?.postalCode || ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-4 flex gap-3 justify-end border-t border-gray-200">
                        <Button
                            variant="default"
                            onClick={() => setIsDetailsOpen(false)}
                            className="bg-gray-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest px-8"
                        >
                            Fermer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
