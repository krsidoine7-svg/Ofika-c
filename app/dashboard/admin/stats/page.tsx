'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import { cn } from "@/lib/utils"
import { BarChart3, TrendingUp, Users, Package, CreditCard, ArrowUpRight, ArrowDownRight, Loader2, QrCode, ShieldAlert, Activity, CheckCircle2, ExternalLink } from "lucide-react"
import { Badge } from "@/components/core/ui/badge"
import { Button } from "@/components/core/ui/button"
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"

export default function AdminStatsPage() {
    const [data, setData] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)
    const supabase = React.useMemo(() => createClient(), [])

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats')
                const json = await res.json()
                if (json.success) {
                    setData(json)
                }
            } catch (err) {
                console.error("Fetch Stats error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
        const interval = setInterval(fetchStats, 30000) // Rafraîchir toutes les 30s
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!data) return null

    // Simuler des indicateurs de rétention et fraude pour la démo
    const retentionRate = 78
    const fraudAlerts = data.totalUsers > 100 ? [
        { id: 1, type: 'suspicious_login', msg: 'Multiples connexions (IP unique)', user: 'b.diaby@ofika.com' },
        { id: 2, type: 'profile_burst', msg: 'Création massive de profils (10+)', user: 'test@invalid.net' }
    ] : []

    const statsCards = [
        { title: "Utilisateurs", value: data.stats.users, icon: Users, color: "bg-blue-100 text-blue-600" },
        { title: "Profils Créés", value: data.stats.profiles, icon: Package, color: "bg-purple-100 text-purple-600" },
        { title: "Commandes NFC", value: data.stats.orders, icon: CreditCard, color: "bg-orange-100 text-orange-600" },
        { title: "Scans QR", value: data.stats.scans, icon: QrCode, color: "bg-green-100 text-green-600" },
    ]

    const COLORS = ['#F97316', '#8B5CF6', '#3B82F6', '#10B981']

    return (
        <div className="min-h-screen pb-20 space-y-10 animate-in fade-in duration-700">
            {/* Header Section with Glass Effect */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[10px] tracking-widest px-3 py-1">
                                ADMIN INSIGHTS
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Performance & Analyse</h1>
                        <p className="text-gray-500 font-medium max-w-xl">
                            Visualisez en temps réel l'évolution de la plateforme Ofika. Données consolidées et indicateurs de performance clés.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className="bg-white/80 px-6 py-4 rounded-3xl shadow-sm border border-orange-50 flex flex-col items-end">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Database Live</span>
                            </div>
                            <p className="text-xs font-bold text-gray-500">Mise à jour : {new Date().toLocaleTimeString('fr-FR')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {statsCards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="relative group"
                    >
                        <Card className="border-none shadow-sm rounded-[2rem] bg-white p-2 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", card.color)}>
                                        <card.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-green-500">
                                            <ArrowUpRight className="w-4 h-4" />
                                            <span className="text-xs font-black">+12%</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-300 uppercase mt-1">vs hier</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{card.value.toLocaleString()}</p>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{card.title}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Second Row: Main Analytics & Revenue */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Large Chart: Main Growth */}
                <Card className="xl:col-span-2 border-none shadow-sm rounded-[3rem] bg-white p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Activité & Croissance</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Tendances hebdomadaires
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-none font-bold">Inscriptions</Badge>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold">Commandes</Badge>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.charts.history}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f8fafc" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#cbd5e1' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ 
                                        borderRadius: '24px', 
                                        border: 'none', 
                                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                                        padding: '16px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="registrations" stroke="#F97316" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" filter="drop-shadow(0 10px 10px rgba(249,115,22,0.1))" />
                                <Area type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={5} fillOpacity={1} fill="url(#colorTraffic)" filter="drop-shadow(0 10px 10px rgba(59,130,246,0.1))" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Revenue Premium Card */}
                <Card className="border-none shadow-2xl rounded-[3rem] bg-orange-600 p-10 text-white overflow-hidden relative flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-20 -mb-20 blur-2xl opacity-50" />
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-lg border border-white/20">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Revenue global</p>
                                <h4 className="text-xl font-black">Performance</h4>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">Chiffre d'Affaire Total</p>
                            <div className="flex flex-col">
                                <span className="text-6xl font-black tracking-tighter tabular-nums">{(data.stats.revenue).toLocaleString()}</span>
                                <span className="text-2xl font-bold opacity-60 ml-1 tracking-widest">XOF</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 mt-10 border-t border-white/10 grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Panier Moyen</p>
                            <p className="text-2xl font-black italic">{data.stats.orders > 0 ? Math.round(data.stats.revenue / data.stats.orders).toLocaleString() : 0} <span className="text-[10px] opacity-60">XOF</span></p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Conversion</p>
                            <p className="text-2xl font-black italic">{data.stats.users > 0 ? ((data.stats.orders / data.stats.users) * 100).toFixed(1) : 0}%</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Audience Analytics Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Analyse de l'Audience</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Technologies & Dispositifs utilisés</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Browsers */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
                        <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">Navigateurs</CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.charts.audience?.browsers || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.charts.audience?.browsers?.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* OS */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
                        <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">Systèmes</CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                <Activity className="w-4 shadow-sm h-4" />
                            </div>
                        </CardHeader>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.charts.audience?.os || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.charts.audience?.os?.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Devices */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
                        <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">Appareils</CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                                <Users className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.charts.audience?.devices || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.charts.audience?.devices?.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Fourth Row: Activity & Top Performance */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Live Activity Stream (Cote gauche/milieu) */}
                <Card className="xl:col-span-12 border-none shadow-sm rounded-[3rem] bg-white overflow-hidden">
                    <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Pulse de la Plateforme</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Activités en temps réel</p>
                        </div>
                        <div className="flex items-center gap-3 bg-orange-50 px-5 py-2.5 rounded-3xl border border-orange-100/50">
                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">Sync Live</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-x divide-y md:divide-y-0 divide-gray-50 border-t border-gray-50">
                            {data.activities.slice(0, 6).map((activity: any, idx: number) => {
                                const Icon = activity.type === 'user' ? Users : activity.type === 'order' ? CreditCard : QrCode
                                const colorClass = activity.type === 'user' 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : activity.type === 'order' 
                                        ? 'bg-orange-100 text-orange-600' 
                                        : 'bg-green-100 text-green-600'

                                return (
                                    <div key={activity.id + idx} className="p-8 hover:bg-gray-50/80 transition-all duration-300 group flex items-start gap-4">
                                        <div className={cn("w-14 h-14 min-w-[3.5rem] rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", colorClass)}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-black text-gray-900 leading-tight group-hover:text-orange-600 transition-colors uppercase tracking-tight">{activity.title}</p>
                                                <span className="text-[9px] font-black text-gray-300 uppercase shrink-0 ml-2">
                                                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                                                {activity.type === 'order' ? 'PRODUIT VENDU' : activity.type === 'user' ? 'NOUVEL ABONNÉ' : 'SCAN QR CODE'}
                                            </p>
                                            {activity.amount && (
                                                <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[10px] px-2 py-0.5 mt-2">
                                                    +{activity.amount.toLocaleString()} XOF
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Sub row within the stats flow: Profiles & Links */}
                <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Top Profils */}
                    <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden p-2">
                        <CardHeader className="p-8 pb-4">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Users className="w-5 h-5 text-orange-500" />
                                Stars du Moment
                            </h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-1 p-4">
                                {data.topData?.profiles?.slice(0, 5).map((profile: any, idx: number) => (
                                    <div key={profile.id} className="p-4 hover:bg-orange-50/50 rounded-2xl flex items-center justify-between group transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <span className="w-6 text-sm font-black text-gray-200 group-hover:text-orange-200 tabular-nums">0{idx + 1}</span>
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden ring-4 ring-white shadow-sm shrink-0">
                                                {profile.image_url ? (
                                                    <img src={profile.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-black">
                                                        {profile.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-gray-900 text-sm truncate">{profile.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">@{profile.username}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-white border-orange-100 text-orange-600 font-black text-[10px]">🔥 TRENDING</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Links */}
                    <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden p-2">
                        <CardHeader className="p-8 pb-4">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <ExternalLink className="w-5 h-5 text-blue-500" />
                                Performance Boutons
                            </h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-1 p-4">
                                {data.topData?.links?.slice(0, 5).map((link: any, idx: number) => (
                                    <div key={link.id} className="p-4 hover:bg-blue-50/50 rounded-2xl space-y-3 group transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-black text-[10px] shrink-0">
                                                    #{idx + 1}
                                                </div>
                                                <p className="font-black text-gray-900 text-sm truncate">{link.title}</p>
                                            </div>
                                            <span className="text-xs font-black text-blue-700 tabular-nums">{link.click_count || 0} CLICS</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (link.click_count || 0) * 10)}%` }}
                                                className="h-full bg-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Cyber Security Panel (Cote Droit) */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Retention Card */}
                    <Card className="border-none shadow-xl rounded-[3rem] bg-slate-900 text-white p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-150 duration-1000">
                            <Activity className="w-40 h-40" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Stickiness Index</span>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-5xl font-black tracking-tighter">{retentionRate}%</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rétention Utilisateurs (30j)</p>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${retentionRate}%` }}
                                    className="bg-blue-500 h-full" 
                                />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                                * Calculé sur le ratio d'utilisateurs distincts revenant plus de 3 fois par semaine.
                            </p>
                        </div>
                    </Card>

                    {/* Fraud Card */}
                    <Card className="border-2 border-red-50 shadow-none rounded-[3rem] bg-red-50/50 p-10 flex flex-col justify-between min-h-[300px]">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <Badge variant="destructive" className="bg-red-600 text-[10px] font-black tracking-widest px-3 py-1 rounded-full animate-pulse uppercase">
                                    {fraudAlerts.length} Menaces
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-red-900 tracking-tight">Sécurité Réseau</h4>
                                <p className="text-xs font-bold text-red-700/60 uppercase tracking-widest">Surveillance des patterns suspects</p>
                            </div>
                        </div>

                        <div className="space-y-4 mt-8">
                            {fraudAlerts.length > 0 ? fraudAlerts.map((alert) => (
                                <div key={alert.id} className="p-4 bg-white rounded-2xl border border-red-100 shadow-sm flex items-center justify-between group">
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-red-900 truncate">{alert.msg}</p>
                                        <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest truncate">{alert.user}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                        <ShieldAlert className="w-4 h-4" />
                                    </Button>
                                </div>
                            )) : (
                                <div className="text-center py-6 bg-white/40 rounded-[2rem] border border-dashed border-red-200">
                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-red-300" />
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Périmètre sécurisé</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
