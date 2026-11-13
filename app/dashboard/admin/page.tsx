'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
    Users, 
    CreditCard, 
    TrendingUp, 
    Package, 
    Loader2, 
    Globe, 
    ShieldCheck, 
    LifeBuoy, 
    ArrowRight, 
    ArrowUpRight,
    Clock, 
    CheckCircle2, 
    AlertCircle,
    QrCode,
    Sparkles,
    RotateCw,
    Search,
    Wallet,
    ExternalLink,
    ChevronRight,
    Check,
    SlidersHorizontal,
    Database,
    Zap
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface RecentOrder {
    id: string
    order_number: string
    total_amount: number | null
    status: string | null
    shipping_status?: string | null
    created_at: string
    user_id?: string
    user?: {
        name: string | null
        email: string | null
    } | null
}

interface RecentUser {
    id: string
    name: string | null
    email: string | null
    role?: string | null
    created_at: string
}

interface AdminStats {
    totalUsers: number
    totalProfiles: number
    totalOrders: number
    totalRevenue: number
    paidOrdersCount: number
    pendingOrdersCount: number
    openTicketsCount: number
    pendingRevenue: number
    recentUsers: RecentUser[]
    recentOrders: RecentOrder[]
}

type PeriodType = 'all' | '30d' | '7d'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [lastSyncTime, setLastSyncTime] = useState<string>('')

    const supabase = useMemo(() => createClient(), [])

    const fetchStats = useCallback(async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setIsRefreshing(true)
            } else {
                setLoading(true)
            }

            // Requêtes parallèles pour l'ensemble des métriques
            const [
                { count: userCount },
                { count: profileCount },
                { count: orderCount },
                { count: pendingCount },
                { count: ticketsCount },
                { data: recentUsersData },
                { data: recentOrdersData },
                { data: paidOrdersData },
                { data: pendingOrdersData }
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'processing']),
                supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
                supabase.from('users').select('id, name, email, role, created_at').order('created_at', { ascending: false }).limit(6),
                supabase.from('orders').select('id, order_number, total_amount, status, shipping_status, created_at, user_id').order('created_at', { ascending: false }).limit(6),
                supabase.from('orders').select('total_amount').eq('status', 'paid'),
                supabase.from('orders').select('total_amount').in('status', ['pending', 'processing'])
            ])

            // Associer les utilisateurs correspondants aux commandes récentes
            const userIds = Array.from(new Set((recentOrdersData || []).map(o => o.user_id).filter(Boolean)))
            let usersMap = new Map<string, { name: string | null, email: string | null }>()
            if (userIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .in('id', userIds)

                if (usersData) {
                    usersMap = new Map(usersData.map(u => [u.id, { name: u.name, email: u.email }]))
                }
            }

            const enrichedOrders: RecentOrder[] = (recentOrdersData || []).map(order => ({
                ...order,
                user: order.user_id ? usersMap.get(order.user_id) || null : null
            }))

            const totalRevenue = paidOrdersData?.reduce((acc, order) => acc + Number(order.total_amount || 0), 0) || 0
            const pendingRevenue = pendingOrdersData?.reduce((acc, order) => acc + Number(order.total_amount || 0), 0) || 0

            setStats({
                totalUsers: userCount || 0,
                totalProfiles: profileCount || 0,
                totalOrders: orderCount || 0,
                totalRevenue,
                paidOrdersCount: paidOrdersData?.length || 0,
                pendingOrdersCount: pendingCount || 0,
                openTicketsCount: ticketsCount || 0,
                pendingRevenue,
                recentUsers: recentUsersData || [],
                recentOrders: enrichedOrders
            })

            const now = new Date()
            setLastSyncTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

            if (isManualRefresh) {
                toast.success("Données actualisées en direct")
            }
        } catch (error) {
            console.error('Erreur chargement statistiques admin:', error)
            toast.error("Impossible d'actualiser les données")
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    // Filtrage dynamique des commandes récentes
    const filteredOrders = useMemo(() => {
        if (!stats?.recentOrders) return []
        const now = Date.now()

        return stats.recentOrders.filter(order => {
            const createdAtTime = new Date(order.created_at).getTime()
            const diffDays = (now - createdAtTime) / (1000 * 3600 * 24)

            if (selectedPeriod === '7d' && diffDays > 7) return false
            if (selectedPeriod === '30d' && diffDays > 30) return false

            if (!searchQuery.trim()) return true
            const q = searchQuery.toLowerCase()
            const matchesNumber = order.order_number?.toLowerCase().includes(q)
            const matchesName = order.user?.name?.toLowerCase().includes(q)
            const matchesEmail = order.user?.email?.toLowerCase().includes(q)
            const matchesStatus = order.status?.toLowerCase().includes(q)

            return Boolean(matchesNumber || matchesName || matchesEmail || matchesStatus)
        })
    }, [stats?.recentOrders, selectedPeriod, searchQuery])

    // Filtrage dynamique des utilisateurs récents
    const filteredUsers = useMemo(() => {
        if (!stats?.recentUsers) return []
        const now = Date.now()

        return stats.recentUsers.filter(u => {
            const createdAtTime = new Date(u.created_at).getTime()
            const diffDays = (now - createdAtTime) / (1000 * 3600 * 24)

            if (selectedPeriod === '7d' && diffDays > 7) return false
            if (selectedPeriod === '30d' && diffDays > 30) return false

            if (!searchQuery.trim()) return true
            const q = searchQuery.toLowerCase()
            return Boolean(
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.role?.toLowerCase().includes(q)
            )
        })
    }, [stats?.recentUsers, selectedPeriod, searchQuery])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[550px] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                <p className="text-xs text-neutral-500 font-medium tracking-wide">
                    Connexion au Studio de Contrôle Ofika...
                </p>
            </div>
        )
    }

    const todayFormatted = new Intl.DateTimeFormat('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    }).format(new Date())

    const statCards = [
        {
            id: 'revenue',
            label: "Chiffre d'Affaires Encaissé",
            value: `${(stats?.totalRevenue || 0).toLocaleString('fr-FR')} XOF`,
            subtext: `${stats?.paidOrdersCount || 0} transaction(s) validée(s)`,
            badge: stats?.pendingRevenue && stats.pendingRevenue > 0 
                ? `${stats.pendingRevenue.toLocaleString('fr-FR')} XOF en attente` 
                : "GeniusPay opérationnel",
            icon: Wallet,
            href: "/dashboard/admin/orders"
        },
        {
            id: 'orders',
            label: "Commandes NFC Physiques",
            value: (stats?.totalOrders || 0).toLocaleString('fr-FR'),
            subtext: (stats?.pendingOrdersCount || 0) > 0 
                ? `${stats?.pendingOrdersCount} à préparer & expédier` 
                : "Toutes les commandes sont traitées",
            badge: (stats?.pendingOrdersCount || 0) > 0 ? "Action requise" : "À jour",
            badgeVariant: (stats?.pendingOrdersCount || 0) > 0 ? "warning" : "success",
            icon: Package,
            href: "/dashboard/admin/orders"
        },
        {
            id: 'profiles',
            label: "Profils VCard Link-in-Bio",
            value: (stats?.totalProfiles || 0).toLocaleString('fr-FR'),
            subtext: "Pages et coordonnées virtuelles actives",
            badge: "Public & Actif",
            icon: Globe,
            href: "/dashboard/admin/profiles"
        },
        {
            id: 'users',
            label: "Utilisateurs Inscrits",
            value: (stats?.totalUsers || 0).toLocaleString('fr-FR'),
            subtext: "Comptes membres et clients Ofika",
            badge: "Base active",
            icon: Users,
            href: "/dashboard/admin/users"
        }
    ]

    const quickModules = [
        { title: "Commandes NFC", count: stats?.totalOrders, href: "/dashboard/admin/orders", icon: Package },
        { title: "Profils VCard", count: stats?.totalProfiles, href: "/dashboard/admin/profiles", icon: Globe },
        { title: "Catalogue Produits", href: "/dashboard/admin/products", icon: CreditCard },
        { title: "Puces NFC & QR", href: "/dashboard/admin/nfc", icon: QrCode },
        { 
            title: "Support Client", 
            count: stats?.openTicketsCount, 
            urgent: (stats?.openTicketsCount || 0) > 0, 
            href: "/dashboard/admin/tickets", 
            icon: LifeBuoy 
        },
        { title: "Analytiques", href: "/dashboard/admin/analytics", icon: TrendingUp },
    ]

    return (
        <div className="space-y-7 bg-white pb-14 text-neutral-900">
            {/* Top Bar : Command Center Header (Style Linear / Stripe) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Studio Exécutif • En direct
                        </span>
                        {lastSyncTime && (
                            <span className="text-[11px] text-neutral-400">
                                • Synchro {lastSyncTime}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
                        Studio de Contrôle
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 capitalize">
                        {todayFormatted} — Console de gestion Ofika
                    </p>
                </div>

                {/* Filtres de Période & Actions Rapides */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Sélecteur de période épuré */}
                    <div className="inline-flex items-center p-0.5 rounded-lg border border-neutral-200 bg-neutral-50 text-xs">
                        <button
                            onClick={() => setSelectedPeriod('all')}
                            className={cn(
                                "px-3 py-1.5 rounded-md font-medium transition-all",
                                selectedPeriod === 'all' 
                                    ? "bg-white text-neutral-950 shadow-sm" 
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            Tout
                        </button>
                        <button
                            onClick={() => setSelectedPeriod('30d')}
                            className={cn(
                                "px-3 py-1.5 rounded-md font-medium transition-all",
                                selectedPeriod === '30d' 
                                    ? "bg-white text-neutral-950 shadow-sm" 
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            30 jours
                        </button>
                        <button
                            onClick={() => setSelectedPeriod('7d')}
                            className={cn(
                                "px-3 py-1.5 rounded-md font-medium transition-all",
                                selectedPeriod === '7d' 
                                    ? "bg-white text-neutral-950 shadow-sm" 
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            7 jours
                        </button>
                    </div>

                    {/* Bouton Rafraîchir avec animation de rotation */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchStats(true)}
                        disabled={isRefreshing}
                        className="h-9 px-3 bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs gap-1.5 font-medium"
                    >
                        <RotateCw className={cn("w-3.5 h-3.5 text-neutral-500", isRefreshing && "animate-spin")} />
                        <span className="hidden sm:inline">Actualiser</span>
                    </Button>

                    {/* Action principale sombre matte */}
                    <Button asChild size="sm" className="h-9 px-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium shadow-sm">
                        <Link href="/dashboard/admin/orders" className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" />
                            <span>Gérer les commandes</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Bannière d'Alerte Prioritaire (Conditionnelle & Stripped) */}
            {((stats?.pendingOrdersCount || 0) > 0 || (stats?.openTicketsCount || 0) > 0) ? (
                <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                                    Action Requise
                                </p>
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-200/70 text-amber-900">
                                    {(stats?.pendingOrdersCount || 0) + (stats?.openTicketsCount || 0)} en attente
                                </span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-0.5">
                                {(stats?.pendingOrdersCount || 0) > 0 && (
                                    <span><strong>{stats?.pendingOrdersCount}</strong> commande(s) physique(s) en attente de préparation</span>
                                )}
                                {(stats?.pendingOrdersCount || 0) > 0 && (stats?.openTicketsCount || 0) > 0 && ' • '}
                                {(stats?.openTicketsCount || 0) > 0 && (
                                    <span><strong>{stats?.openTicketsCount}</strong> ticket(s) de support ouvert(s)</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {(stats?.pendingOrdersCount || 0) > 0 && (
                            <Button size="sm" asChild className="h-8 text-xs bg-neutral-950 hover:bg-neutral-800 text-white font-medium">
                                <Link href="/dashboard/admin/orders">Traiter les commandes</Link>
                            </Button>
                        )}
                        {(stats?.openTicketsCount || 0) > 0 && (
                            <Button size="sm" variant="outline" asChild className="h-8 text-xs border-amber-300 bg-white hover:bg-amber-100/60 text-amber-900 font-medium">
                                <Link href="/dashboard/admin/tickets">Support client</Link>
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-3.5 px-4 rounded-xl border border-neutral-200/70 bg-neutral-50/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                            <Check className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs text-neutral-600">
                            <strong className="text-neutral-900 font-medium">Toutes les opérations sont à jour.</strong> Aucune commande NFC en retard ni ticket urgent.
                        </p>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                        100% TRAITÉ
                    </span>
                </div>
            )}

            {/* Grille des 4 Métriques Exécutives (Linear / Stripe Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Link key={stat.id} href={stat.href} className="group block focus:outline-none">
                            <div className="h-full bg-white border border-neutral-200/80 hover:border-neutral-300 transition-all rounded-xl p-5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                                            {stat.label}
                                        </span>
                                        <div className="w-7 h-7 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-neutral-600 group-hover:text-neutral-950 group-hover:bg-neutral-100 transition-colors">
                                            <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                                        </div>
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight font-mono tabular-nums">
                                        {stat.value}
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                                    <span className="text-neutral-500 truncate text-[11px]">
                                        {stat.subtext}
                                    </span>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Barre de Recherche et Modules Express */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <Input
                            type="text"
                            placeholder="Rechercher une commande, un email, un nom..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-xs bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Filtre rapide sur les flux récents</span>
                    </div>
                </div>

                {/* Modules Rapides en Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {quickModules.map((item, i) => {
                        const ItemIcon = item.icon
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors bg-white",
                                    item.urgent 
                                        ? "border-amber-300 text-amber-900 bg-amber-50/60 hover:bg-amber-100/70"
                                        : "border-neutral-200/80 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/80"
                                )}
                            >
                                <ItemIcon className="w-3.5 h-3.5 text-neutral-500" strokeWidth={1.75} />
                                <span>{item.title}</span>
                                {typeof item.count === 'number' && (
                                    <span className={cn(
                                        "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                                        item.urgent 
                                            ? "bg-amber-200 text-amber-950 font-bold" 
                                            : "bg-neutral-100 text-neutral-600"
                                    )}>
                                        {item.count}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Deux Colonnes Principales : Flux des Ventes & Annuaire Récent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Dernières Ventes & Commandes */}
                <Card className="bg-white border border-neutral-200/80 shadow-none rounded-xl flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between p-5 pb-3 border-b border-neutral-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-semibold text-neutral-950 uppercase tracking-wider">
                                    Commandes Récentes
                                </CardTitle>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-100 text-neutral-600">
                                    {filteredOrders.length}
                                </span>
                            </div>
                            <CardDescription className="text-xs text-neutral-400 mt-0.5">
                                Transactions NFC et livraisons enregistrées
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 h-8 font-medium">
                            <Link href="/dashboard/admin/orders" className="flex items-center gap-1">
                                <span>Consulter tout</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>

                    <CardContent className="p-3 flex-1">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12 text-neutral-400 text-xs">
                                Aucune commande trouvée {searchQuery && 'pour cette recherche'}.
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {filteredOrders.map((order) => {
                                    const isPaid = order.status === 'paid'
                                    const isPending = order.status === 'pending' || order.status === 'processing'
                                    const customerName = order.user?.name || 'Client Direct'
                                    const customerEmail = order.user?.email || 'N/A'

                                    return (
                                        <div key={order.id} className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-neutral-50/80 rounded-lg transition-colors group">
                                            <div className="flex items-center min-w-0 flex-1 gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 font-mono text-xs shrink-0 border border-neutral-200/60">
                                                    <Package className="w-4 h-4 text-neutral-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-semibold text-neutral-950">
                                                            #{order.order_number || order.id.slice(0, 8)}
                                                        </span>
                                                        <span className="text-[11px] text-neutral-400 font-mono">
                                                            • {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                                                        {customerName} <span className="text-neutral-400 text-[11px]">({customerEmail})</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                <p className="text-xs font-semibold text-neutral-950 font-mono tabular-nums">
                                                    {Number(order.total_amount || 0).toLocaleString('fr-FR')} XOF
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                                                        isPaid 
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                                                            : isPending
                                                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                                            : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                                                    )}>
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            isPaid ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-neutral-400"
                                                        )} />
                                                        {order.status || 'En attente'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Derniers Utilisateurs Inscrits */}
                <Card className="bg-white border border-neutral-200/80 shadow-none rounded-xl flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between p-5 pb-3 border-b border-neutral-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-semibold text-neutral-950 uppercase tracking-wider">
                                    Derniers Inscrits
                                </CardTitle>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-100 text-neutral-600">
                                    {filteredUsers.length}
                                </span>
                            </div>
                            <CardDescription className="text-xs text-neutral-400 mt-0.5">
                                Nouveaux comptes et créateurs de profils
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 h-8 font-medium">
                            <Link href="/dashboard/admin/users" className="flex items-center gap-1">
                                <span>Voir l&apos;annuaire</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>

                    <CardContent className="p-3 flex-1">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12 text-neutral-400 text-xs">
                                Aucun utilisateur trouvé {searchQuery && 'pour cette recherche'}.
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {filteredUsers.map((user) => {
                                    const initial = (user.name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()
                                    const isAdmin = user.role === 'admin' || user.role === 'superadmin'

                                    return (
                                        <div key={user.id} className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-neutral-50/80 rounded-lg transition-colors group">
                                            <div className="flex items-center min-w-0 flex-1 gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-800 font-semibold text-xs shrink-0">
                                                    {initial}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-neutral-950 truncate">
                                                        {user.name || 'Utilisateur sans nom'}
                                                    </p>
                                                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                <span className={cn(
                                                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                                                    isAdmin 
                                                        ? "bg-neutral-950 text-white font-semibold" 
                                                        : "bg-neutral-100 text-neutral-600 border border-neutral-200/70"
                                                )}>
                                                    {user.role || 'client'}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 font-mono">
                                                    {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Pied de Page Système & Infrastructure (Linear style status) */}
            <div className="p-3.5 px-4 rounded-xl border border-neutral-200/70 bg-neutral-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-neutral-700">Supabase DB :</span>
                        <span className="text-neutral-500">Connecté</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-neutral-700">GeniusPay :</span>
                        <span className="text-neutral-500">Opérationnel</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-neutral-700">Moteur VCard / NFC :</span>
                        <span className="text-neutral-500">Actif</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                    <span>Admin vérifié :</span>
                    <span className="text-neutral-700 font-medium">krsidoine7@gmail.com</span>
                </div>
            </div>
        </div>
    )
}
