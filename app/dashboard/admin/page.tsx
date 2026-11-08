'use client'

import React, { useEffect, useState, useMemo } from 'react'
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
    Clock, 
    CheckCircle2, 
    AlertCircle,
    QrCode,
    Sparkles
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { cn } from "@/lib/utils"

interface AdminStats {
    totalUsers: number
    totalProfiles: number
    totalOrders: number
    totalRevenue: number
    pendingOrdersCount: number
    openTicketsCount: number
    recentUsers: Array<{
        id: string
        name: string | null
        email: string | null
        role?: string | null
        created_at: string
    }>
    recentOrders: Array<{
        id: string
        order_number: string
        total_amount: number | null
        status: string | null
        shipping_status?: string | null
        created_at: string
        user_id?: string
    }>
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)

                // Requêtes parallèles pour récupérer les totaux et dernières entrées
                const [
                    { count: userCount },
                    { count: profileCount },
                    { count: orderCount },
                    { count: pendingCount },
                    { count: ticketsCount },
                    { data: recentUsers },
                    { data: recentOrders },
                    { data: paidOrders }
                ] = await Promise.all([
                    supabase.from('users').select('*', { count: 'exact', head: true }),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('orders').select('*', { count: 'exact', head: true }),
                    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'processing']),
                    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
                    supabase.from('users').select('id, name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
                    supabase.from('orders').select('id, order_number, total_amount, status, shipping_status, created_at, user_id').order('created_at', { ascending: false }).limit(5),
                    supabase.from('orders').select('total_amount').eq('status', 'paid')
                ])

                const totalRevenue = paidOrders?.reduce((acc, order) => acc + Number(order.total_amount || 0), 0) || 0

                setStats({
                    totalUsers: userCount || 0,
                    totalProfiles: profileCount || 0,
                    totalOrders: orderCount || 0,
                    totalRevenue,
                    pendingOrdersCount: pendingCount || 0,
                    openTicketsCount: ticketsCount || 0,
                    recentUsers: recentUsers || [],
                    recentOrders: recentOrders || []
                })
            } catch (error) {
                console.error('Erreur chargement statistiques admin:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="text-xs text-gray-400 font-medium tracking-wide">Chargement du tableau de bord...</p>
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
            label: "Chiffre d'Affaires Encaissé",
            value: `${(stats?.totalRevenue || 0).toLocaleString('fr-FR')} XOF`,
            subtitle: "Commandes payées validées",
            icon: CreditCard,
            href: "/dashboard/admin/orders"
        },
        {
            label: "Commandes NFC",
            value: (stats?.totalOrders || 0).toLocaleString('fr-FR'),
            subtitle: `${stats?.pendingOrdersCount || 0} en cours de traitement`,
            icon: Package,
            href: "/dashboard/admin/orders"
        },
        {
            label: "Profils Link-in-Bio",
            value: (stats?.totalProfiles || 0).toLocaleString('fr-FR'),
            subtitle: "Pages professionnelles actives",
            icon: Globe,
            href: "/dashboard/admin/profiles"
        },
        {
            label: "Utilisateurs Inscrits",
            value: (stats?.totalUsers || 0).toLocaleString('fr-FR'),
            subtitle: "Comptes enregistrés",
            icon: Users,
            href: "/dashboard/admin/users"
        }
    ]

    const quickShortcuts = [
        { title: "Commandes NFC", desc: "Suivi des expéditions & paiements", href: "/dashboard/admin/orders", icon: Package },
        { title: "NFC & QR Codes", desc: "Génération, liens & redirections", href: "/dashboard/admin/nfc", icon: QrCode },
        { title: "Support & Avis", desc: "Tickets clients & avis vérifiés", href: "/dashboard/admin/tickets", icon: LifeBuoy },
        { title: "Analytiques Globales", desc: "Trafic, clics & appareils", href: "/dashboard/admin/analytics", icon: TrendingUp },
    ]

    return (
        <div className="space-y-8 bg-white pb-12">
            {/* Header épuré blanc */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Système opérationnel</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-950">
                        Tableau de bord Administrateur
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                        {todayFormatted}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="h-9 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-950">
                        <Link href="/dashboard/admin/tickets" className="flex items-center gap-2">
                            <LifeBuoy className="w-4 h-4 text-gray-500" />
                            <span>Support</span>
                            {(stats?.openTicketsCount || 0) > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">
                                    {stats?.openTicketsCount}
                                </span>
                            )}
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="h-9 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-950">
                        <Link href="/dashboard/admin/analytics" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <span>Statistiques</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Bandeau d'attention / Actions prioritaires */}
            {((stats?.pendingOrdersCount || 0) > 0 || (stats?.openTicketsCount || 0) > 0) ? (
                <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Actions prioritaires en attente
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {(stats?.pendingOrdersCount || 0) > 0 && `${stats?.pendingOrdersCount} commande(s) NFC à traiter`}
                                {(stats?.pendingOrdersCount || 0) > 0 && (stats?.openTicketsCount || 0) > 0 && ' • '}
                                {(stats?.openTicketsCount || 0) > 0 && `${stats?.openTicketsCount} ticket(s) support ouvert(s)`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {(stats?.pendingOrdersCount || 0) > 0 && (
                            <Button size="sm" asChild className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white">
                                <Link href="/dashboard/admin/orders">Voir les commandes</Link>
                            </Button>
                        )}
                        {(stats?.openTicketsCount || 0) > 0 && (
                            <Button size="sm" variant="outline" asChild className="h-8 text-xs border-orange-200 bg-white hover:bg-orange-50 text-orange-800">
                                <Link href="/dashboard/admin/tickets">Gérer le support</Link>
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Toutes les opérations sont à jour</p>
                            <p className="text-xs text-gray-500">Aucune commande en souffrance ni ticket support urgent.</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-white border-gray-200 text-gray-600 font-normal text-xs">
                        À jour
                    </Badge>
                </div>
            )}

            {/* Grille des 4 Métriques Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <Link key={i} href={stat.href} className="group block focus:outline-none">
                        <Card className="h-full bg-white border border-gray-100 shadow-none hover:border-gray-300 transition-all rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-gray-500">{stat.label}</span>
                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:text-orange-600 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                                    <stat.icon className="w-4 h-4" strokeWidth={1.75} />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-gray-950 tracking-tight">
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                                <span>{stat.subtitle}</span>
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-400" />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Raccourcis Opérationnels Rapides */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Accès Rapides</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickShortcuts.map((item, i) => (
                        <Link 
                            key={i} 
                            href={item.href}
                            className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50 transition-all flex items-start gap-3 group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:text-orange-600 group-hover:border-orange-100 transition-colors shrink-0">
                                <item.icon className="w-4 h-4" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                                    {item.title}
                                </p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                    {item.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Deux Colonnes : Dernières Ventes & Derniers Inscrits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dernières Commandes */}
                <Card className="bg-white border border-gray-100 shadow-none rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-gray-50">
                        <div>
                            <CardTitle className="text-base font-semibold text-gray-950">Dernières Ventes</CardTitle>
                            <CardDescription className="text-xs text-gray-400 mt-0.5">Transactions et commandes NFC récentes</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs text-gray-500 hover:text-gray-950 hover:bg-gray-50 h-8">
                            <Link href="/dashboard/admin/orders" className="flex items-center gap-1">
                                <span>Voir tout</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-3">
                        {stats?.recentOrders.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">
                                Aucune commande enregistrée pour le moment.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {stats?.recentOrders.map((order) => {
                                    const isPaid = order.status === 'paid'
                                    return (
                                        <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-lg transition-colors gap-3">
                                            <div className="flex items-center min-w-0 flex-1 gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                                                    <CreditCard className="w-4 h-4" strokeWidth={1.75} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-gray-900 truncate">
                                                        #{order.order_number || order.id.slice(0, 8)}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                <p className="text-xs font-semibold text-gray-950">
                                                    {Number(order.total_amount || 0).toLocaleString('fr-FR')} XOF
                                                </p>
                                                <span className={cn(
                                                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                                                    isPaid 
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                                        : "bg-gray-50 text-gray-600 border border-gray-100"
                                                )}>
                                                    {order.status || 'En attente'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Derniers Utilisateurs Inscrits */}
                <Card className="bg-white border border-gray-100 shadow-none rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between p-5 pb-4 border-b border-gray-50">
                        <div>
                            <CardTitle className="text-base font-semibold text-gray-950">Derniers Inscrits</CardTitle>
                            <CardDescription className="text-xs text-gray-400 mt-0.5">Nouveaux comptes créés sur Ofika</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs text-gray-500 hover:text-gray-950 hover:bg-gray-50 h-8">
                            <Link href="/dashboard/admin/users" className="flex items-center gap-1">
                                <span>Voir tout</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-3">
                        {stats?.recentUsers.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">
                                Aucun utilisateur inscrit pour le moment.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {stats?.recentUsers.map((user) => {
                                    const initial = (user.name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()
                                    const isAdmin = user.role === 'admin' || user.role === 'superadmin'

                                    return (
                                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-lg transition-colors gap-3">
                                            <div className="flex items-center min-w-0 flex-1 gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-xs shrink-0">
                                                    {initial}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium text-gray-900 truncate">
                                                        {user.name || 'Utilisateur sans nom'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                <span className={cn(
                                                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                                                    isAdmin 
                                                        ? "bg-orange-50 text-orange-700 border border-orange-100 font-semibold" 
                                                        : "bg-gray-50 text-gray-500 border border-gray-100"
                                                )}>
                                                    {user.role || 'user'}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
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
        </div>
    )
}
