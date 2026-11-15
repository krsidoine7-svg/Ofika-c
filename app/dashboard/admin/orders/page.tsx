'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import {
    Package,
    Search,
    Loader2,
    Eye,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    MoreVertical,
    Mail,
    User,
    RotateCw,
    Phone,
    MapPin,
    ExternalLink,
    Copy,
    Check,
    Download,
    AlertTriangle,
    ArrowUpRight,
    Sparkles,
    ShieldCheck,
    Inbox,
    QrCode
} from "lucide-react"
import QRCode from "react-qr-code"
import { downloadSVGAsFile } from "@/lib/utils/download-qr"
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
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"

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
    metadata?: {
        receipt_url?: string
        payment_reference?: string
        [key: string]: any
    }
    user?: {
        name: string
        email: string
    }
    profile?: {
        id: string
        name: string
        custom_url?: string
        username?: string
        company?: string
        job_title?: string
    } | null
    card?: {
        id: string
        nfc_link?: string
        qr_code_url?: string
        preview_data?: any
        qr_redirect_id?: string
    } | null
}

type FilterTab = 'all' | 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'failed'

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastSyncTime, setLastSyncTime] = useState<string>('')
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null)

    // Dialogue de confirmation minimaliste
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string
        message: string
        action: () => Promise<void> | void
        variant: 'default' | 'destructive'
        confirmLabel?: string
    }>({
        title: '',
        message: '',
        action: () => {},
        variant: 'default',
        confirmLabel: 'Confirmer'
    })

    const supabase = useMemo(() => createClient(), [])

    const getOrderQrUrl = useCallback((order: Order) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci'
        
        if (order.card?.preview_data?.short_code) {
            return `${baseUrl}/qr/${order.card.preview_data.short_code}`
        }
        if (order.metadata?.short_code) {
            return `${baseUrl}/qr/${order.metadata.short_code}`
        }
        if (order.profile?.custom_url) {
            return `${baseUrl}/${order.profile.custom_url}`
        }
        if (order.profile?.username) {
            return `${baseUrl}/${order.profile.username}`
        }
        if (order.card?.nfc_link) {
            return order.card.nfc_link.startsWith('http') 
                ? order.card.nfc_link 
                : `${baseUrl}${order.card.nfc_link.startsWith('/') ? '' : '/'}${order.card.nfc_link}`
        }
        return `${baseUrl}/qr/${order.order_number}`
    }, [])

    // Chargement des commandes via l'API sécurisée
    const fetchOrders = useCallback(async (isManual = false) => {
        try {
            if (isManual) setIsRefreshing(true)
            else setLoading(true)

            const res = await fetch('/api/admin/orders')
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Erreur lors de la récupération des commandes')
            }

            setOrders(json.orders || [])
            const now = new Date()
            setLastSyncTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

            if (isManual) {
                toast.success('Liste des commandes actualisée')
            }
        } catch (error: any) {
            console.error('Erreur fetch orders:', error)
            toast.error(error?.message || 'Impossible de charger les commandes')
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()

        // Abonnement temps réel Supabase
        const channel = supabase
            .channel('admin-orders-realtime-sub')
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
    }, [fetchOrders, supabase])

    // KPIs calculés
    const stats = useMemo(() => {
        const totalCount = orders.length
        const paidOrders = orders.filter(o => 
            o.payment_status === 'succeeded' || 
            o.payment_status === 'paid' || 
            o.status === 'paid' || 
            ['delivered', 'preparing', 'shipped'].includes(o.status || '')
        )
        const paidCount = paidOrders.length
        const totalRevenue = paidOrders.reduce((sum, o) => 
            sum + Number(o.total_cents ?? (o as any).total_amount ?? o.amount_cents ?? 0), 0
        )

        const pendingOrders = orders.filter(o => 
            (o.payment_status === 'pending' || 
            o.payment_status === 'processing' || 
            o.status === 'pending' || 
            Boolean(o.metadata?.receipt_url && o.payment_status !== 'succeeded')) &&
            o.payment_status !== 'succeeded' &&
            !['paid', 'delivered', 'preparing', 'shipped'].includes(o.status || '')
        )
        const pendingCount = pendingOrders.length

        const inLogistics = orders.filter(o => 
            o.shipping_status === 'preparing' || 
            o.shipping_status === 'shipped' ||
            o.status === 'preparing' ||
            o.status === 'shipped'
        )
        const logisticsCount = inLogistics.length

        const deliveredCount = orders.filter(o => o.shipping_status === 'delivered' || o.status === 'delivered').length
        const failedCount = orders.filter(o => o.payment_status === 'failed' || o.status === 'failed').length

        return {
            totalCount,
            paidCount,
            totalRevenue,
            pendingCount,
            logisticsCount,
            deliveredCount,
            failedCount
        }
    }, [orders])

    // Filtrage dynamique
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Recherche textuelle
            const query = search.trim().toLowerCase()
            const matchesQuery = !query || (
                (order.order_number || '').toLowerCase().includes(query) ||
                (order.user?.email || '').toLowerCase().includes(query) ||
                (order.user?.name || '').toLowerCase().includes(query) ||
                (order.shipping_address?.phone || '').toLowerCase().includes(query) ||
                (order.shipping_address?.city || '').toLowerCase().includes(query)
            )

            if (!matchesQuery) return false

            // Filtre par onglet
            switch (activeTab) {
                case 'pending':
                    return (order.payment_status === 'pending' || order.payment_status === 'processing' || order.status === 'pending') &&
                           order.payment_status !== 'succeeded' &&
                           !['paid', 'delivered', 'preparing', 'shipped'].includes(order.status || '')
                case 'paid':
                    return order.payment_status === 'succeeded' || order.payment_status === 'paid' || order.status === 'paid' || ['delivered', 'preparing', 'shipped'].includes(order.status || '')
                case 'preparing':
                    return order.shipping_status === 'preparing' || order.status === 'preparing'
                case 'shipped':
                    return order.shipping_status === 'shipped' || order.status === 'shipped'
                case 'delivered':
                    return order.shipping_status === 'delivered' || order.status === 'delivered'
                case 'failed':
                    return order.payment_status === 'failed' || order.status === 'failed'
                case 'all':
                default:
                    return true
            }
        })
    }, [orders, search, activeTab])

    // Actions de mise à jour statut
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
            if (!res.ok || !json.success) throw new Error(json.error || 'Erreur lors de la mise à jour')

            toast.success(newStatus === 'succeeded' ? 'Paiement confirmé avec succès' : 'Paiement marqué comme échoué')
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus, status: newStatus === 'succeeded' ? 'paid' : 'failed' } : o))
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, payment_status: newStatus, status: newStatus === 'succeeded' ? 'paid' : 'failed' } : null)
            }
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
            if (!res.ok || !json.success) throw new Error(json.error || 'Erreur lors de la mise à jour')

            const labelMap: Record<string, string> = {
                preparing: 'En cours de préparation',
                shipped: 'Marquée comme expédiée',
                delivered: 'Marquée comme livrée'
            }
            toast.success(labelMap[newStatus] || 'Statut mis à jour')
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, shipping_status: newStatus, status: newStatus } : o))
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, shipping_status: newStatus, status: newStatus } : null)
            }
        } catch (error: any) {
            console.error('Erreur updateShippingStatus:', error)
            toast.error(error?.message || 'Erreur lors de la mise à jour')
        }
    }

    const openConfirm = (
        title: string, 
        message: string, 
        action: () => Promise<void> | void, 
        variant: 'default' | 'destructive' = 'default',
        confirmLabel = 'Confirmer'
    ) => {
        setTimeout(() => {
            setConfirmConfig({ title, message, action, variant, confirmLabel })
            setIsConfirmOpen(true)
        }, 50)
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedOrderId(id)
        toast.success(`N° de commande copié : ${text}`)
        setTimeout(() => setCopiedOrderId(null), 2000)
    }

    const exportToCsv = () => {
        if (orders.length === 0) {
            toast.error('Aucune commande à exporter')
            return
        }

        const headers = ['N Commande', 'Date', 'Client', 'Email', 'Telephone', 'Ville', 'Articles', 'Quantite', 'Montant XOF', 'Statut Paiement', 'Statut Livraison']
        const rows = filteredOrders.map(o => [
            `"${o.order_number}"`,
            `"${new Date(o.created_at).toLocaleDateString('fr-FR')}"`,
            `"${o.user?.name || o.shipping_address?.name || 'Client'}"`,
            `"${o.user?.email || 'N/A'}"`,
            `"${o.shipping_address?.phone || ''}"`,
            `"${o.shipping_address?.city || ''}"`,
            `"${o.card_type === 'nfc_qr' ? 'NFC + QR' : 'QR Code'}"`,
            `"${o.quantity || 1}"`,
            `"${Number(o.total_cents ?? (o as any).total_amount ?? o.amount_cents ?? 0)}"`,
            `"${o.payment_status}"`,
            `"${o.shipping_status}"`
        ])

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `ofika-commandes-${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Export CSV généré')
    }

    // Micro-badges de statut
    const renderPaymentBadge = (status: string, hasReceipt = false) => {
        switch (status) {
            case 'succeeded':
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Payé
                    </span>
                )
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        En attente
                    </span>
                )
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Reçu à valider
                    </span>
                )
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Échoué
                    </span>
                )
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        Annulé
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                        {status}
                    </span>
                )
        }
    }

    const renderShippingBadge = (status: string) => {
        switch (status) {
            case 'delivered':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Livré
                    </span>
                )
            case 'shipped':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Expédié
                    </span>
                )
            case 'preparing':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Préparation
                    </span>
                )
            case 'pending':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-50 text-neutral-500 border border-neutral-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                        Non expédié
                    </span>
                )
        }
    }

    return (
        <div className="space-y-6 bg-white pb-16">
            {/* 1. Header Exécutif */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
                            Commandes & Logistique NFC
                        </h1>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            En direct
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Suivi des ventes, validation des paiements Wave/Mobile Money et acheminement des cartes physiques.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {lastSyncTime && (
                        <span className="text-[11px] text-gray-400 font-mono hidden sm:inline-block">
                            Synchro {lastSyncTime}
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchOrders(true)}
                        disabled={isRefreshing}
                        className="h-8 text-xs font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg gap-1.5"
                    >
                        <RotateCw className={cn("w-3.5 h-3.5 text-gray-400", isRefreshing && "animate-spin text-gray-900")} />
                        <span>Actualiser</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCsv}
                        className="h-8 text-xs font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5 text-gray-400" />
                        <span>Export CSV</span>
                    </Button>
                </div>
            </div>

            {/* 2. Bandeau 4 KPIs Exécutives */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Total Commandes</span>
                        <Package className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-gray-950 font-mono tabular-nums">
                            {stats.totalCount}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">enregistrées</span>
                    </div>
                </Card>

                <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">CA Confirmé</span>
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-gray-950 font-mono tabular-nums">
                            {stats.totalRevenue.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">XOF ({stats.paidCount})</span>
                    </div>
                </Card>

                <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">À Traiter / En Attente</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-gray-950 font-mono tabular-nums">
                            {stats.pendingCount}
                        </span>
                        <span className="text-[11px] text-amber-600 font-medium">action requise</span>
                    </div>
                </Card>

                <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Logistique / En Transit</span>
                        <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-gray-950 font-mono tabular-nums">
                            {stats.logisticsCount}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">cartes actives</span>
                    </div>
                </Card>
            </div>

            {/* 3. Barre de Navigation par Onglets & Recherche */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
                {/* Onglets segmented */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                    {[
                        { id: 'all' as FilterTab, label: 'Toutes', count: stats.totalCount },
                        { id: 'pending' as FilterTab, label: 'À valider / Attente', count: stats.pendingCount },
                        { id: 'paid' as FilterTab, label: 'Payées', count: stats.paidCount },
                        { id: 'preparing' as FilterTab, label: 'En préparation', count: orders.filter(o => o.shipping_status === 'preparing').length },
                        { id: 'shipped' as FilterTab, label: 'Expédiées', count: orders.filter(o => o.shipping_status === 'shipped').length },
                        { id: 'delivered' as FilterTab, label: 'Livrées', count: stats.deliveredCount },
                        { id: 'failed' as FilterTab, label: 'Échouées', count: stats.failedCount }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-gray-900 text-white shadow-xs"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                            )}
                        >
                            <span>{tab.label}</span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                                activeTab === tab.id
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-100 text-gray-600"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Champ de recherche */}
                <div className="relative w-full md:w-72 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="N° commande, client, email..."
                        className="pl-9 h-9 border-gray-200 bg-white rounded-lg text-xs text-gray-900 focus-visible:ring-1 focus-visible:ring-gray-900"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* 4. Tableau Haute Densité Linear / Stripe */}
            <Card className="border border-gray-100 shadow-none overflow-hidden rounded-xl bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        N° Commande & Date
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        Client & Contact
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        Article
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">
                                        Paiement
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">
                                        Expédition
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">
                                        Total (XOF)
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                                <p className="text-xs text-gray-400 font-medium">Chargement des commandes...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => {
                                        const initials = (order.user?.name || order.shipping_address?.name || 'Cl')
                                            .split(' ')
                                            .map((s: string) => s[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()

                                        const hasReceipt = Boolean(order.metadata?.receipt_url)
                                        const totalXof = Number(order.total_cents ?? (order as any).total_amount ?? order.amount_cents ?? 0)

                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                                {/* N° Commande & Date */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-semibold text-gray-900">
                                                            #{order.order_number}
                                                        </span>
                                                        <button
                                                            onClick={() => copyToClipboard(order.order_number, order.id)}
                                                            className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Copier le numéro"
                                                        >
                                                            {copiedOrderId === order.id ? (
                                                                <Check className="w-3 h-3 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </td>

                                                {/* Client */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center shrink-0 border border-gray-200/60">
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0 max-w-[200px]">
                                                            <p className="text-xs font-semibold text-gray-900 truncate">
                                                                {order.user?.name || order.shipping_address?.name || 'Client Inconnu'}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400 truncate">
                                                                {order.user?.email || order.shipping_address?.phone || 'Sans coordonnées'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Article & Type */}
                                                <td className="px-4 py-3">
                                                    <div className="text-xs font-medium text-gray-800">
                                                        {order.card_type === 'nfc_qr' ? 'Carte NFC + QR' : 'Carte QR Code'}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400">
                                                        Qté : {order.quantity || 1}
                                                    </div>
                                                </td>

                                                {/* Paiement */}
                                                <td className="px-4 py-3 text-center">
                                                    <div className="inline-flex flex-col items-center gap-1">
                                                        {renderPaymentBadge(order.payment_status, hasReceipt)}
                                                        {hasReceipt && order.payment_status !== 'succeeded' && (
                                                            <span className="text-[10px] text-blue-600 font-medium underline cursor-pointer" onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }}>
                                                                Voir le reçu
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Expédition */}
                                                <td className="px-4 py-3 text-center">
                                                    {renderShippingBadge(order.shipping_status)}
                                                </td>

                                                {/* Montant Total */}
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-mono text-xs font-bold text-gray-950 tabular-nums">
                                                        {totalXof.toLocaleString('fr-FR')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 ml-1">XOF</span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }}
                                                            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                                            title="Voir les détails"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                                                >
                                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-100 shadow-xl bg-white text-xs">
                                                                <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-gray-400 px-2 py-1.5">
                                                                    Commande #{order.order_number}
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }}
                                                                    className="cursor-pointer gap-2"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                                                                    <span>Fiche détaillée</span>
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator className="bg-gray-100" />

                                                                <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-gray-400 px-2 py-1">
                                                                    Paiement
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    onClick={() => openConfirm(
                                                                        "Confirmer le paiement ?",
                                                                        `Valider manuellement la réception du paiement pour la commande #${order.order_number} (${totalXof.toLocaleString('fr-FR')} XOF) ?`,
                                                                        () => updatePaymentStatus(order.id, 'succeeded'),
                                                                        'default',
                                                                        'Valider le paiement'
                                                                    )}
                                                                    className="cursor-pointer gap-2 text-emerald-700"
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span>Marquer comme payé</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => openConfirm(
                                                                        "Paiement échoué ?",
                                                                        `Indiquer la commande #${order.order_number} en paiement échoué / annulé ?`,
                                                                        () => updatePaymentStatus(order.id, 'failed'),
                                                                        'destructive',
                                                                        'Refuser / Échouer'
                                                                    )}
                                                                    className="cursor-pointer gap-2 text-rose-700"
                                                                >
                                                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                                                    <span>Marquer comme échoué</span>
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator className="bg-gray-100" />

                                                                <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-gray-400 px-2 py-1">
                                                                    Logistique
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    onClick={() => openConfirm(
                                                                        "Lancer la préparation ?",
                                                                        `Passer la commande #${order.order_number} en statut "En préparation" (fabrication de la carte) ?`,
                                                                        () => updateShippingStatus(order.id, 'preparing'),
                                                                        'default',
                                                                        'Lancer la préparation'
                                                                    )}
                                                                    className="cursor-pointer gap-2"
                                                                >
                                                                    <Package className="w-3.5 h-3.5 text-purple-600" />
                                                                    <span>En préparation</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => openConfirm(
                                                                        "Confirmer l'expédition ?",
                                                                        `Confirmer que le colis de la commande #${order.order_number} est confié au livreur / transporteur ?`,
                                                                        () => updateShippingStatus(order.id, 'shipped'),
                                                                        'default',
                                                                        'Confirmer expédition'
                                                                    )}
                                                                    className="cursor-pointer gap-2"
                                                                >
                                                                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                                                                    <span>Marquer comme expédié</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => openConfirm(
                                                                        "Confirmer la livraison ?",
                                                                        `Valider la remise en main propre au client de la commande #${order.order_number} ?`,
                                                                        () => updateShippingStatus(order.id, 'delivered'),
                                                                        'default',
                                                                        'Confirmer réception'
                                                                    )}
                                                                    className="cursor-pointer gap-2"
                                                                >
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span>Marquer comme livré</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-2 border border-gray-100">
                                                    <Inbox className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs font-semibold text-gray-900">Aucune commande trouvée</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {search ? "Aucune commande ne correspond à vos termes de recherche." : "Aucune commande enregistrée dans cette section."}
                                                </p>
                                                {search && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSearch('')}
                                                        className="mt-3 text-xs text-gray-700 hover:text-gray-950 font-medium"
                                                    >
                                                        Effacer la recherche
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* 5. Tiroir / Dialogue Fiche Détaillée Commande (Style Linear) */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[620px] rounded-2xl border border-gray-200 bg-white shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-5 sm:p-6 border-b border-gray-100 bg-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DialogTitle className="font-mono text-base font-bold text-gray-950">
                                    #{selectedOrder?.order_number}
                                </DialogTitle>
                                {selectedOrder && renderPaymentBadge(selectedOrder.payment_status)}
                                {selectedOrder && renderShippingBadge(selectedOrder.shipping_status)}
                            </div>
                        </div>
                        <DialogDescription className="text-xs text-gray-400 mt-1">
                            Commande passée le {selectedOrder ? new Date(selectedOrder.created_at).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : ''}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
                            {/* Bloc Reçu Wave si présent */}
                            {Boolean(selectedOrder.metadata?.receipt_url) && (
                                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-semibold text-blue-900">
                                                Capture / Reçu de Paiement Wave
                                            </span>
                                        </div>
                                        {selectedOrder.payment_status !== 'succeeded' && (
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openConfirm(
                                                        "Refuser le reçu ?",
                                                        `Marquer le reçu de la commande #${selectedOrder.order_number} comme invalide/échoué ?`,
                                                        () => updatePaymentStatus(selectedOrder.id, 'failed'),
                                                        'destructive',
                                                        'Refuser le reçu'
                                                    )}
                                                    className="h-7 text-[11px] font-medium border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg px-2.5"
                                                >
                                                    Refuser
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => openConfirm(
                                                        "Valider le reçu ?",
                                                        `Confirmer la conformité du reçu Wave pour la commande #${selectedOrder.order_number} ?`,
                                                        () => updatePaymentStatus(selectedOrder.id, 'succeeded'),
                                                        'default',
                                                        'Valider le paiement'
                                                    )}
                                                    className="h-7 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5"
                                                >
                                                    Valider le paiement
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <a
                                        href={selectedOrder.metadata?.receipt_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded-lg overflow-hidden border border-gray-200 group relative max-h-56 bg-black"
                                    >
                                        <img
                                            src={selectedOrder.metadata?.receipt_url}
                                            alt="Reçu de paiement"
                                            className="w-full h-auto object-contain max-h-56 transition-transform group-hover:scale-102"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                                            <span>Agrandir l'image</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </div>
                                    </a>
                                </div>
                            )}

                            {/* Informations Client */}
                            <div className="space-y-2">
                                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-gray-500" />
                                    Coordonnées Client
                                </h4>
                                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900">
                                                {selectedOrder.user?.name || selectedOrder.shipping_address?.name || 'Client Inconnu'}
                                            </p>
                                            <p className="text-[11px] text-gray-500">{selectedOrder.user?.email || 'Sans email'}</p>
                                        </div>
                                        {selectedOrder.shipping_address?.phone && (
                                            <div className="flex items-center gap-1">
                                                <a
                                                    href={`tel:${selectedOrder.shipping_address.phone}`}
                                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 hover:text-gray-950 px-2 py-1 rounded-md bg-white border border-gray-200"
                                                >
                                                    <Phone className="w-3 h-3 text-gray-500" />
                                                    <span>{selectedOrder.shipping_address.phone}</span>
                                                </a>
                                                <a
                                                    href={`https://wa.me/${selectedOrder.shipping_address.phone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200"
                                                    title="Discuter sur WhatsApp"
                                                >
                                                    <span>WhatsApp</span>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-mono text-gray-400">
                                        ID Utilisateur : {selectedOrder.user_id}
                                    </p>
                                </div>
                            </div>

                            {/* Spécifications Articles & Paiement */}
                            <div className="space-y-2">
                                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Package className="w-3.5 h-3.5 text-gray-500" />
                                    Articles & Spécifications
                                </h4>
                                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div>
                                            <span className="font-semibold text-gray-900">
                                                {selectedOrder.card_type === 'nfc_qr' ? 'Carte NFC Physique + QR Code' : 'Carte Digitale QR Code'}
                                            </span>
                                            <span className="text-gray-400 ml-2">× {selectedOrder.quantity || 1}</span>
                                        </div>
                                        <span className="font-mono font-bold text-gray-950 tabular-nums">
                                            {Number(selectedOrder.total_cents ?? (selectedOrder as any).total_amount ?? selectedOrder.amount_cents ?? 0).toLocaleString('fr-FR')} XOF
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200/70 flex items-center justify-between text-[11px] text-gray-500">
                                        <span>Canal de paiement</span>
                                        <span className="font-semibold text-gray-900 uppercase">
                                            {selectedOrder.payment_method || selectedOrder.payment_provider || 'Non précisé'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Atelier de Gravure & QR Code Physique (Production) */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <QrCode className="w-3.5 h-3.5 text-orange-500" />
                                        Atelier de Gravure & QR Code Permanent
                                    </h4>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-950 text-white shadow-2xs">
                                            {selectedOrder.metadata?.design_choice === 'design2' ? 'Design 2 : Executive (QR Verso)' : 'Design 1 : Balance Pro (QR Recto)'}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                                            {selectedOrder.metadata?.card_finish === 'white' ? 'Blanc Épuré' : 'Noir Mat Luxe'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-4">
                                    {/* Données de gravure sur la carte physique */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                                        <div>
                                            <span className="text-gray-400 block text-[10px] font-semibold uppercase tracking-wider">Nom gravé</span>
                                            <span className="font-bold text-gray-900 text-sm">
                                                {selectedOrder.metadata?.engraved_name || selectedOrder.shipping_address?.name || selectedOrder.user?.name || 'Nom non précisé'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px] font-semibold uppercase tracking-wider">Entreprise / Titre</span>
                                            <span className="font-bold text-gray-900 text-sm">
                                                {selectedOrder.metadata?.engraved_company || selectedOrder.profile?.company || selectedOrder.metadata?.engraved_job_title || '—'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px] font-semibold uppercase tracking-wider">Face Gravure QR</span>
                                            <span className="font-bold text-orange-600 text-sm">
                                                {selectedOrder.metadata?.design_choice === 'design2' ? 'Face Arrière (Verso)' : 'Face Avant (Recto)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bloc QR Code Haute Définition + Téléchargements */}
                                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                                        {/* Visualisation SVG vectorielle exacte */}
                                        <div className="w-28 h-28 p-2 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-center shrink-0">
                                            <QRCode
                                                id={`order-qr-svg-${selectedOrder.id}`}
                                                value={getOrderQrUrl(selectedOrder)}
                                                size={96}
                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                viewBox="0 0 256 256"
                                            />
                                        </div>

                                        {/* Actions de téléchargement & encodage NFC */}
                                        <div className="flex-1 space-y-2.5 w-full">
                                            <div>
                                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                                    Lien permanent encodé (QR Code & Puce NFC)
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-200/80">
                                                    <span className="font-mono text-xs font-bold text-gray-900 truncate flex-1 select-all">
                                                        {getOrderQrUrl(selectedOrder)}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(getOrderQrUrl(selectedOrder))
                                                            toast.success("Lien de production copié pour l'application NFC Tools !")
                                                        }}
                                                        className="h-7 px-2 text-[11px] font-bold text-gray-700 hover:text-black hover:bg-gray-200/80 shrink-0"
                                                        title="Copier le lien pour NFC Tools"
                                                    >
                                                        <Copy className="w-3 h-3 mr-1" /> Copier
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                                <Button
                                                    size="sm"
                                                    onClick={async () => {
                                                        try {
                                                            await downloadSVGAsFile(`order-qr-svg-${selectedOrder.id}`, `QR-${selectedOrder.order_number}`, 'svg')
                                                            toast.success("Fichier SVG vectoriel téléchargé (Parfait pour graveur laser)")
                                                        } catch (e) {
                                                            toast.error("Erreur lors du téléchargement SVG")
                                                        }
                                                    }}
                                                    className="h-8 px-3 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-lg flex items-center gap-1.5"
                                                >
                                                    <Download className="w-3.5 h-3.5 text-orange-400" /> Télécharger SVG (Laser)
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        try {
                                                            await downloadSVGAsFile(`order-qr-svg-${selectedOrder.id}`, `QR-${selectedOrder.order_number}`, 'png')
                                                            toast.success("Image PNG 300 DPI téléchargée")
                                                        } catch (e) {
                                                            toast.error("Erreur lors du téléchargement PNG")
                                                        }
                                                    }}
                                                    className="h-8 px-3 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-1.5"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Télécharger PNG (300 DPI)
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Adresse de Livraison */}
                            <div className="space-y-2">
                                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                    Destination & Expédition
                                </h4>
                                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1.5 text-xs">
                                    <p className="font-semibold text-gray-900">
                                        {selectedOrder.shipping_address?.name || selectedOrder.shipping_address?.full_name || 'Destinataire non précisé'}
                                    </p>
                                    <p className="text-gray-600 leading-relaxed text-[11px]">
                                        {selectedOrder.shipping_address?.address || selectedOrder.shipping_address?.line1 || 'Adresse locale'}
                                        {selectedOrder.shipping_address?.city ? `, ${selectedOrder.shipping_address.city}` : ''}
                                        {selectedOrder.shipping_address?.postal_code ? ` (${selectedOrder.shipping_address.postal_code})` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 flex sm:justify-between items-center gap-2">
                        <span className="text-[11px] text-gray-400 font-mono hidden sm:inline-block">
                            Ofika Commerce Engine
                        </span>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => setIsDetailsOpen(false)}
                            className="bg-gray-950 hover:bg-black text-white text-xs font-medium rounded-lg h-8 px-4"
                        >
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 6. Dialogue de Confirmation Minimaliste */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-2xl border border-gray-200 bg-white shadow-xl p-5">
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                            confirmConfig.variant === 'destructive' ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-900"
                        )}>
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-sm font-bold text-gray-950">
                                {confirmConfig.title || 'Confirmation requise'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500 leading-relaxed">
                                {confirmConfig.message || 'Veuillez confirmer cette opération.'}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsConfirmOpen(false)}
                            className="h-8 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg"
                        >
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            onClick={confirmConfig.action}
                            className={cn(
                                "h-8 text-xs font-medium rounded-lg px-3 text-white shadow-xs",
                                confirmConfig.variant === 'destructive'
                                    ? "bg-rose-600 hover:bg-rose-700"
                                    : "bg-gray-950 hover:bg-black"
                            )}
                        >
                            {confirmConfig.confirmLabel || 'Confirmer'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
