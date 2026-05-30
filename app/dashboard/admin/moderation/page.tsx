'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import { 
    ShieldCheck, 
    Search, 
    ExternalLink, 
    AlertTriangle, 
    Loader2, 
    Filter, 
    MoreHorizontal,
    User,
    Link as LinkIcon,
    Ban,
    CheckCircle2,
    RefreshCw,
    Check
} from "lucide-react"
import { Input } from "@/components/core/ui/input"
import { Button } from "@/components/core/ui/button"
import { Badge } from "@/components/core/ui/badge"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/core/ui/dropdown-menu"
import { toast } from "sonner"
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function AdminModerationPage() {
    const [links, setLinks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const [stats, setStats] = useState<any>({ totalStructuredLinks: 0, totalQRRedirects: 0 })
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [filter, setFilter] = useState('all')

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/moderation/stats')
            const data = await res.json()
            if (data.success) {
                setStats(data.stats)
                setRecentActivity(data.recentLogs)
            }
        } catch (err) {}
    }

    const fetchLinks = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/moderation/links?q=${search}&type=${filter}`)
            const data = await res.json()
            if (data.success) {
                setLinks(data.links)
            }
        } catch (err) {
            toast.error("Erreur lors du chargement des liens")
        } finally {
            setLoading(false)
        }
    }

    const handleSuspendProfile = async (profileId: string, newValue: boolean = false, reason?: string) => {
        try {
            const res = await fetch('/api/admin/moderation/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'SUSPEND_PROFILE',
                    profile_id: profileId,
                    id: profileId,
                    table: 'profiles',
                    value: newValue === true ? true : (reason || "Violation des conditions d'utilisation")
                })
            })

            const data = await res.json()
            if (data.success) {
                toast.success(newValue === true ? "Profil réactivé" : "Profil suspendu")
                fetchLinks()
                fetchStats()
            } else {
                toast.error(data.error)
            }
        } catch (err) {
            toast.error("Erreur lors de l'action sur le profil")
        }
    }

    const handleToggleAction = async (link: any) => {
        try {
            const newValue = !link.is_active
            const actionLabel = newValue ? "ACTIVER" : "BANNIR"
            if (!window.confirm(`Voulez-vous vraiment ${actionLabel} ce contenu (${link.title}) ?`)) {
                return
            }

            const res = await fetch('/api/admin/moderation/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'TOGGLE_ACTIVE',
                    id: link.id,
                    table: link.db_table,
                    value: newValue
                })
            })

            const data = await res.json()
            if (data.success) {
                toast.success(newValue ? "Lien activé" : "Lien désactivé")
                fetchLinks() 
                fetchStats()
            } else {
                toast.error(data.error)
            }
        } catch (err) {
            toast.error("Erreur lors de l'action")
        }
    }

    useEffect(() => {
        fetchStats()
        const timer = setTimeout(() => {
            fetchLinks()
        }, 300)
        return () => clearTimeout(timer)
    }, [search, filter])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-orange-500" />
                        Centre de Modération
                    </h1>
                    <p className="text-gray-500 font-medium">Surveillance globale des contenus et des redirections QR.</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher une URL ou un titre..."
                        className="pl-10 h-12 border-gray-200 focus:ring-orange-500 rounded-2xl shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-orange-50 border-orange-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                            <LinkIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{links.length}+</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Résultats Actuels</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-50 border-blue-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{stats.totalQRRedirects}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">QR Codes Actifs</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-purple-50 border-purple-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{stats.totalStructuredLinks}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Liens Catalogués</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Links Table/List */}
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Flux Global des Liens</CardTitle>
                            <CardDescription>Tous les liens externes et redirections QR</CardDescription>
                        </div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs uppercase tracking-widest">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filtrer : {filter === 'all' ? 'Tous' : filter === 'structured' ? 'Liens' : filter === 'qr_redirect' ? 'QR Codes' : 'Sociaux'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-gray-400">Type de contenu</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setFilter('all')} className="rounded-xl p-3 flex items-center justify-between cursor-pointer">
                                    <span className="font-bold text-sm">Tous les contenus</span>
                                    {filter === 'all' && <Check className="w-4 h-4 text-orange-500" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('structured')} className="rounded-xl p-3 flex items-center justify-between cursor-pointer">
                                    <span className="font-bold text-sm">Liens standard</span>
                                    {filter === 'structured' && <Check className="w-4 h-4 text-orange-500" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('qr_redirect')} className="rounded-xl p-3 flex items-center justify-between cursor-pointer">
                                    <span className="font-bold text-sm">Redirections QR</span>
                                    {filter === 'qr_redirect' && <Check className="w-4 h-4 text-orange-500" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('social')} className="rounded-xl p-3 flex items-center justify-between cursor-pointer">
                                    <span className="font-bold text-sm">Liens Sociaux (JSON)</span>
                                    {filter === 'social' && <Check className="w-4 h-4 text-orange-500" />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contenu & URL</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Propriétaire</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {links.length > 0 ? links.map((link) => (
                                        <tr key={link.id} className={`hover:bg-gray-50/80 transition-colors group ${!link.is_active ? 'opacity-50 grayscale' : ''}`}>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1 max-w-md">
                                                    <span className="font-black text-gray-900 flex items-center gap-2">
                                                        {link.type === 'qr_redirect' ? '📱 ' : '🔗 '}
                                                        {link.title}
                                                        {link.type === 'qr_redirect' && <Badge variant="outline" className="h-4 px-1.5 text-[8px] bg-blue-50 text-blue-600 border-blue-100">QR CODE</Badge>}
                                                        {link.url?.includes('bit.ly') || link.url?.includes('t.co') || link.url?.includes('goo.gl') ? (
                                                            <Badge variant="destructive" className="h-4 px-1.5 text-[8px] animate-pulse">REDUCER</Badge>
                                                        ) : null}
                                                        {!link.is_active && <Badge variant="secondary" className="h-4 px-1.5 text-[8px]">DÉSACTIVÉ</Badge>}
                                                    </span>
                                                    <a href={link.url} target="_blank" className="text-xs text-orange-500 hover:underline flex items-center gap-1 group/link">
                                                        <span className="truncate max-w-[250px]">{link.url || 'Aucune URL'}</span>
                                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                    </a>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                                        {link.type === 'qr_redirect' ? 'Redirection QR' : 'Lien Profil'} • Ajouté {link.created_at ? formatDistanceToNow(new Date(link.created_at), { addSuffix: true, locale: fr }) : 'inconnu'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                        {link.owner?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-gray-900 leading-none">{link.owner?.name}</p>
                                                            {!link.owner?.is_active && (
                                                                <Badge variant="destructive" className="h-4 px-1 rounded-sm text-[8px] font-black uppercase tracking-tighter">SUSPENDU</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">@{link.owner?.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900">{link.click_count || 0}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{link.type === 'qr_redirect' ? 'scans' : 'clics'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className={`h-8 px-3 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest ${link.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                        onClick={() => handleToggleAction(link)}
                                                    >
                                                        {link.is_active ? <Ban className="w-3.5 h-3.5 mr-2" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-2" />}
                                                        {link.is_active ? 'Bannir' : 'Activer'}
                                                    </Button>

                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className={`h-8 px-3 rounded-xl font-black text-[10px] uppercase tracking-widest ${link.owner?.is_active ? 'text-red-600 hover:bg-red-50' : 'text-blue-600 hover:bg-blue-50'}`}
                                                        onClick={() => {
                                                            const actionLabel = link.owner?.is_active ? "Suspendre définitivement" : "Réactiver"
                                                            if(window.confirm(`${actionLabel} le profil de ${link.owner.name} ?`)) {
                                                                handleSuspendProfile(link.owner.id, !link.owner?.is_active)
                                                            }
                                                        }}
                                                    >
                                                        {link.owner?.is_active ? <AlertTriangle className="w-3.5 h-3.5 mr-2" /> : <Check className="w-3.5 h-3.5 mr-2" />}
                                                        {link.owner?.is_active ? 'Suspendre' : 'Réactiver'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-gray-400 italic">Aucun lien trouvé</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-black text-blue-900 uppercase tracking-widest text-xs mb-1">Sécurité de la plateforme</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                        L'utilisation de réducteurs de liens (Bitly, TinyURL) est surveillée car ils sont souvent utilisés pour masquer des sites malveillants. Vous pouvez bannir un lien ou suspendre le profil parent en cas d'abus.
                    </p>
                </div>
            </div>

            {/* Recent Moderation Activity */}
            {recentActivity.length > 0 && (
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden mt-8">
                    <CardHeader className="p-8 border-b border-gray-50">
                        <CardTitle className="text-xl">Journal de Modération Récent</CardTitle>
                        <CardDescription>Dernières actions de sécurité effectuées par l'équipe</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {recentActivity.map((log) => (
                                <div key={log.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl">
                                    <div className={`p-2 rounded-xl bg-white shadow-sm ${log.action === 'MODERATION_BAN' ? 'text-red-600' : 'text-green-600'}`}>
                                        {log.action === 'MODERATION_BAN' ? <Ban className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">
                                            {log.admin?.name || log.admin?.email} a {log.action === 'MODERATION_BAN' ? 'banni' : 'rétabli'} un contenu
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Cible: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-100">{log.target_type}</span> • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="rounded-lg text-[8px] font-black tracking-widest uppercase">
                                        Terminé
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
