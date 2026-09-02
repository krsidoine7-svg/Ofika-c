'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CreditCard, TrendingUp, Package, Loader2, ArrowUpRight, ArrowDownRight, Globe, Shield, LifeBuoy } from "lucide-react"
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
    recentUsers: any[]
    recentOrders: any[]
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)

                // Fetch stats from different tables
                const [
                    { count: userCount },
                    { count: profileCount },
                    { count: orderCount },
                    { data: recentUsers },
                    { data: recentOrders }
                ] = await Promise.all([
                    supabase.from('users').select('*', { count: 'exact', head: true }),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('orders').select('*', { count: 'exact', head: true }),
                    supabase.from('users').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(5),
                    supabase.from('orders').select('id, order_number, total_amount, status, created_at, user_id').order('created_at', { ascending: false }).limit(5)
                ])

                const processedUsers = (recentUsers || []).map(u => ({
                    ...u
                }))

                // Calculate revenue (paid orders)
                const { data: paidOrders } = await supabase.from('orders').select('total_amount').eq('status', 'paid')
                const totalRevenue = paidOrders?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0

                setStats({
                    totalUsers: userCount || 0,
                    totalProfiles: profileCount || 0,
                    totalOrders: orderCount || 0,
                    totalRevenue,
                    recentUsers: processedUsers,
                    recentOrders: recentOrders || []
                })
            } catch (error) {
                console.error('Erreur fetch stats admin:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    const statCards = [
        { label: 'Utilisateurs', value: stats?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', trendUp: true },
        { label: 'Profils Créés', value: stats?.totalProfiles, icon: Globe, color: 'text-green-600', bg: 'bg-green-50', trend: '+8.5%', trendUp: true },
        { label: 'Commandes', value: stats?.totalOrders, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', trend: '-2.4%', trendUp: false },
        { label: 'Chiffre d\'Affaires', value: `${(stats?.totalRevenue || 0).toLocaleString()} XOF`, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+24%', trendUp: true },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-medium text-gray-900 leading-tight">Bonjour, Administrateur 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Voici la vue d'ensemble de la plateforme Ofika au <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-gray-50 border-gray-100">
                        <Shield className="w-3 h-3 mr-1.5 text-orange-500" />
                        Accès Complet
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                        <Link href="/dashboard/admin/tickets">
                            <LifeBuoy className="w-4 h-4 mr-2 text-emerald-600" />
                            Support & Avis
                        </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                        <Link href="/dashboard/admin/analytics">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Détails Trafic
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="border border-gray-100/50 shadow-sm hover:shadow-md transition-shadow group overflow-hidden bg-white/80 backdrop-blur-sm">
                        <div className={cn("absolute top-0 right-0 w-24 h-24 transform translate-x-12 -translate-y-12 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500", stat.bg)}></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 capitalize">{stat.label}</CardTitle>
                            <div className={cn("p-2 rounded-xl transition-colors", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} strokeWidth={1.5} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-gray-900 mt-1 tracking-tight">{stat.value}</div>
                            <div className="flex items-center text-xs mt-3 font-normal">
                                {stat.trendUp ? (
                                    <span className="flex items-center text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="w-3 h-3 mr-1" />
                                        {stat.trend}
                                    </span>
                                ) : (
                                    <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                        <ArrowDownRight className="w-3 h-3 mr-1" />
                                        {stat.trend}
                                    </span>
                                )}
                                <span className="text-gray-400 ml-2">ce mois-ci</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Recent Users */}
                <Card className="border-none shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Derniers Utilisateurs</CardTitle>
                            <CardDescription>Les 5 nouveaux comptes créés</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/admin/users" className="text-orange-500 hover:text-orange-600 font-medium">Voir tout</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {stats?.recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-gray-50/80 rounded-xl transition-all group gap-2">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-medium mr-3 shrink-0 border border-orange-100 text-xs sm:text-sm">
                                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors truncate capitalize text-xs sm:text-sm">{user.name || 'Sans Nom'}</p>
                                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end shrink-0">
                                        <Badge variant="secondary" className="text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0 border-none bg-gray-100">
                                            {user.role || 'user'}
                                        </Badge>
                                        <span className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="border-none shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base sm:text-lg">Ventes Récentes</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Dernières transactions enregistrées</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/admin/orders" className="text-orange-500 hover:text-orange-600 font-medium text-xs sm:text-sm">Tout voir</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats?.recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-gray-100/50 hover:bg-gray-50/80 transition-all gap-2">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mr-3 shrink-0 border border-teal-100">
                                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">#{order.order_number}</p>
                                            <p className="text-[10px] sm:text-xs text-gray-500 capitalize font-medium">{order.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold text-gray-900 text-xs sm:text-sm">{(order.total_amount || 0).toLocaleString()} XOF</p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
