'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import {
    Activity,
    ShieldAlert,
    Terminal,
    Server,
    Cpu,
    Database,
    Wifi,
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    RefreshCcw,
    ChevronRight,
    Filter,
    ArrowUpRight,
    Skull,
    Lock
} from "lucide-react"
import { Badge } from "@/components/core/ui/badge"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function AdminMonitoringPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState('all')

    const fetchMonitoring = async () => {
        try {
            const res = await fetch('/api/admin/monitoring')
            const json = await res.json()
            if (json.success) {
                setData(json)
            }
        } catch (err) {
            console.error("Fetch Monitoring error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMonitoring()
        const interval = setInterval(fetchMonitoring, 15000) // Refresh every 15s
        return () => clearInterval(interval)
    }, [])

    if (loading) return <div className="flex justify-center p-20"><Activity className="animate-spin text-orange-500 w-10 h-10" /></div>
    if (!data) return null

    const statusBadge = (s: string) => {
        if (s === 'healthy') return <Badge className="bg-green-100 text-green-700 border-none font-bold">Opérationnel</Badge>
        return <Badge variant="destructive" className="font-bold">Erreur</Badge>
    }

    const filteredLogs = data.logs.filter((log: any) => {
        const detailsStr = typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '')
        const matchesSearch = log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            detailsStr.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === 'all' ||
            (filter === 'error' && log.severity === 'error') ||
            (filter === 'warning' && log.severity === 'warning')
        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Terminal className="w-8 h-8 text-orange-500" />
                        Surveillance Système
                    </h1>
                    <p className="text-gray-500 font-medium font-bold uppercase text-[10px] tracking-widest">Logs, Santé & Sécurité en Temps Réel</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchMonitoring} className="rounded-xl font-bold bg-white shadow-sm">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Service Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden group">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Base de Données</p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-gray-900">PostgreSQL</p>
                                {statusBadge(data.status.database.status)}
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 mt-1">Latence: {data.status.database.latency}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden group">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authentification</p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-gray-900">Supabase Auth</p>
                                {statusBadge(data.status.auth.status)}
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 mt-1">Uptime: 99.9%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden group">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                            <Wifi className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">API Routes</p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-gray-900">Healthy</p>
                                {statusBadge(data.status.api.status)}
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 mt-1">Load: {data.status.cpu_load}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-orange-600 text-white overflow-hidden relative">
                    <CardContent className="p-6 z-10 relative">
                        <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-1">Utilisation Serveur</p>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                    <span>RAM</span>
                                    <span>{data.status.memory_usage}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-1000" style={{ width: data.status.memory_usage }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                    <span>CPU</span>
                                    <span>{data.status.cpu_load}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-300 transition-all duration-1000" style={{ width: data.status.cpu_load }} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <Server className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Security Alerts Vertical Feed */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-lg rounded-[2.5rem] bg-gray-900 text-white overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-6 h-6 text-red-500" />
                                    <CardTitle className="text-xl font-black italic tracking-tighter">Security Alert Radar</CardTitle>
                                </div>
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] p-0 px-2 font-black animate-pulse">LIVE</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-white/5">
                                {data.security_alerts.length > 0 ? data.security_alerts.map((alert: any) => (
                                    <div key={alert.id} className="p-6 hover:bg-white/5 transition-colors group cursor-default">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                                <Skull className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">{alert.action?.replace('_', ' ')}</p>
                                                    <span className="text-[10px] font-bold text-white/40">{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: fr })}</span>
                                                </div>
                                                <p className="text-sm font-bold text-white leading-tight mb-2">
                                                    {typeof alert.details === 'object' && alert.details !== null
                                                        ? (alert.details.message || JSON.stringify(alert.details))
                                                        : (alert.details || 'Tentative suspecte détectée')}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-white/50">
                                                    <Badge variant="outline" className="text-[9px] border-white/10 text-white/60">IP: {alert.ip_address || '192.168.1.1'}</Badge>
                                                    <Badge variant="outline" className="text-[9px] border-white/10 text-white/60">UID: {alert.admin_id?.substring(0, 8)}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-10 text-center text-white/30 italic text-sm font-bold">
                                        Aucune menace détectée.
                                    </div>
                                )}
                            </div>
                            <Button variant="ghost" className="w-full h-14 rounded-none border-t border-white/5 text-xs font-black text-white/50 hover:text-white uppercase tracking-[0.2em] group">
                                Voir tout le radar <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-purple-500" />
                                Métriques Core
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Temps de réponse (TTFB)</p>
                                    <p className="text-2xl font-black text-gray-900">42ms</p>
                                </div>
                                <ArrowUpRight className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Nombre de Requêtes (24h)</p>
                                    <p className="text-2xl font-black text-gray-900">12.4k</p>
                                </div>
                                <Badge className="bg-orange-100 text-orange-600 border-none font-black">+14%</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Audit Logs / Activity Feed (Main section) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden flex flex-col h-full">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">Journal d'Audit Global</CardTitle>
                                    <CardDescription className="font-bold text-xs uppercase tracking-widest text-gray-400 mt-1">Actions administratives et système</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Rechercher une action..."
                                            className="h-10 pl-10 w-[200px] border-gray-100 rounded-xl text-sm font-medium"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="h-10 px-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    >
                                        <option value="all">Tout</option>
                                        <option value="error">Erreurs</option>
                                        <option value="warning">Warnings</option>
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/80 border-y border-gray-100">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Temps</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acteur</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredLogs.map((log: any) => (
                                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-gray-300" />
                                                        <span className="text-xs font-bold text-gray-900">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                            {log.user_email?.charAt(0).toUpperCase() || 'S'}
                                                        </div>
                                                        <span className="text-xs font-black text-gray-900">{log.user_email || 'Système'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-black text-gray-900 group-hover:text-orange-600 transition-colors capitalize">{log.action?.replace('_', ' ')}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 truncate max-w-[200px]">
                                                            {typeof log.details === 'object' && log.details !== null
                                                                ? JSON.stringify(log.details)
                                                                : (log.details || 'Aucun détail')}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    {log.severity === 'error' ? (
                                                        <Badge className="bg-red-50 text-red-600 border-none font-black text-[10px] uppercase tracking-tighter">Erreur</Badge>
                                                    ) : log.severity === 'warning' ? (
                                                        <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[10px] uppercase tracking-tighter">Warning</Badge>
                                                    ) : (
                                                        <Badge className="bg-green-50 text-green-600 border-none font-black text-[10px] uppercase tracking-tighter">Succès</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredLogs.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                    <AlertCircle className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucun log trouvé pour cette recherche</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <div className="p-6 border-t border-gray-50 flex items-center justify-center">
                            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-orange-500 transition-colors">
                                Charger plus d'archives
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
