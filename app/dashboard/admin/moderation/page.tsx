'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
    ShieldCheck, 
    Search, 
    ExternalLink, 
    AlertTriangle, 
    Loader2, 
    Filter, 
    User,
    Globe,
    QrCode,
    Ban,
    CheckCircle2,
    RotateCw,
    Check,
    ArrowUpRight,
    SlidersHorizontal,
    SearchX,
    Lock,
    ShieldAlert,
    History,
    Share2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"

interface ModerationLink {
    id: string
    db_table: string
    title: string
    url: string
    created_at: string
    click_count: number
    is_active: boolean
    type: 'structured' | 'qr_redirect' | 'social'
    owner?: {
        id: string
        name: string
        username: string
        is_active: boolean
    }
}

interface ModerationLog {
    id: string
    action: string
    target_type: string
    target_id: string
    created_at: string
    admin?: {
        name?: string
        email?: string
    }
}

type FilterType = 'all' | 'structured' | 'qr_redirect' | 'social'

export default function AdminModerationPage() {
    const [links, setLinks] = useState<ModerationLink[]>([])
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<FilterType>('all')
    const [stats, setStats] = useState({ totalStructuredLinks: 0, totalQRRedirects: 0 })
    const [recentActivity, setRecentActivity] = useState<ModerationLog[]>([])
    const [lastSyncTime, setLastSyncTime] = useState<string>('')

    // Modal de confirmation
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        description: string
        action: () => Promise<void>
        variant: 'default' | 'destructive'
    }>({
        isOpen: false,
        title: '',
        description: '',
        action: async () => {},
        variant: 'default'
    })

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/moderation/stats')
            const data = await res.json()
            if (data.success) {
                setStats(data.stats || { totalStructuredLinks: 0, totalQRRedirects: 0 })
                setRecentActivity(data.recentLogs || [])
            }
        } catch (err) {
            console.error('Erreur stats moderation:', err)
        }
    }, [])

    const fetchLinks = useCallback(async (isManual = false) => {
        try {
            if (isManual) {
                setIsRefreshing(true)
            } else {
                setLoading(true)
            }

            const res = await fetch(`/api/admin/moderation/links?q=${encodeURIComponent(search)}&type=${filter}`)
            const data = await res.json()
            if (data.success) {
                setLinks(data.links || [])
                const now = new Date()
                setLastSyncTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
                if (isManual) {
                    toast.success("Données de modération actualisées")
                }
            } else {
                throw new Error(data.error || "Erreur serveur")
            }
        } catch (err) {
            toast.error("Impossible de charger les liens à modérer")
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }, [search, filter])

    useEffect(() => {
        fetchStats()
        const timer = setTimeout(() => {
            fetchLinks()
        }, 250)
        return () => clearTimeout(timer)
    }, [fetchStats, fetchLinks])

    const handleSuspendProfile = async (profileId: string, newValue: boolean = false, profileName: string) => {
        setConfirmModal({
            isOpen: true,
            title: newValue ? "Réactiver le profil parent ?" : "Suspendre le profil parent ?",
            description: newValue 
                ? `Le profil de "${profileName}" et toutes ses cartes associées redeviendront accessibles.` 
                : `Toutes les cartes et redirections liées au profil de "${profileName}" seront immédiatement neutralisées.`,
            variant: newValue ? 'default' : 'destructive',
            action: async () => {
                try {
                    const res = await fetch('/api/admin/moderation/action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'SUSPEND_PROFILE',
                            profile_id: profileId,
                            id: profileId,
                            table: 'profiles',
                            value: newValue === true ? true : "Violation des conditions d'utilisation (Signalement)"
                        })
                    })

                    const data = await res.json()
                    if (data.success) {
                        toast.success(newValue ? "Profil réactivé avec succès" : "Profil parent suspendu")
                        fetchLinks()
                        fetchStats()
                    } else {
                        toast.error(data.error || "Erreur lors de l'opération")
                    }
                } catch {
                    toast.error("Erreur lors de l'action sur le profil")
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }))
                }
            }
        })
    }

    const handleToggleLinkActive = (link: ModerationLink) => {
        const nextValue = !link.is_active
        setConfirmModal({
            isOpen: true,
            title: nextValue ? "Activer ce contenu ?" : "Bannir / Neutraliser ce lien ?",
            description: nextValue 
                ? `Le lien "${link.title}" sera de nouveau cliquable et accessible au public.` 
                : `Le lien "${link.title}" sera désactivé immédiatement. Il ne redirigera plus les visiteurs.`,
            variant: nextValue ? 'default' : 'destructive',
            action: async () => {
                try {
                    const res = await fetch('/api/admin/moderation/action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'TOGGLE_ACTIVE',
                            id: link.id,
                            table: link.db_table,
                            value: nextValue
                        })
                    })

                    const data = await res.json()
                    if (data.success) {
                        toast.success(nextValue ? "Contenu activé" : "Contenu banni")
                        fetchLinks()
                        fetchStats()
                    } else {
                        toast.error(data.error || "Erreur de mise à jour")
                    }
                } catch {
                    toast.error("Impossible de modifier le statut du lien")
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }))
                }
            }
        })
    }

    // Détection de réducteur d'URL
    const isUrlShortener = (url: string) => {
        if (!url) return false
        const lower = url.toLowerCase()
        return lower.includes('bit.ly') || lower.includes('tinyurl.com') || lower.includes('t.co') || lower.includes('goo.gl') || lower.includes('is.gd') || lower.includes('cutt.ly')
    }

    return (
        <div className="space-y-7 bg-white pb-14 text-neutral-900">
            {/* Header : Command Bar (Style Linear / Stripe) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Sécurité & Contrôle • En direct
                        </span>
                        {lastSyncTime && (
                            <span className="text-[11px] text-neutral-400">
                                • Synchro {lastSyncTime}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
                        Centre de Modération des Liens & QR
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500">
                        Surveillez les redirections suspectes, les réducteurs d&apos;URL et neutralisez les abus en 1 clic.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            fetchLinks(true)
                            fetchStats()
                        }}
                        disabled={isRefreshing}
                        className="h-9 px-3 bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs gap-1.5 font-medium"
                    >
                        <RotateCw className={cn("w-3.5 h-3.5 text-neutral-500", isRefreshing && "animate-spin")} />
                        <span>Actualiser</span>
                    </Button>
                </div>
            </div>

            {/* 3 Cartes KPI Exécutives */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-neutral-200/80 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Résultats Visibles
                        </span>
                        <Globe className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="text-2xl font-semibold text-neutral-950 font-mono tabular-nums">
                        {links.length}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                        Liens et contenus sous surveillance
                    </p>
                </div>

                <div className="bg-white border border-neutral-200/80 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Redirections QR Actives
                        </span>
                        <QrCode className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="text-2xl font-semibold text-neutral-950 font-mono tabular-nums">
                        {stats.totalQRRedirects}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                        Codes et puces physiques en circulation
                    </p>
                </div>

                <div className="bg-white border border-neutral-200/80 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Liens Catalogués
                        </span>
                        <ShieldCheck className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="text-2xl font-semibold text-neutral-950 font-mono tabular-nums">
                        {stats.totalStructuredLinks}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                        Base globale de redirections Ofika
                    </p>
                </div>
            </div>

            {/* Barre de Recherche & Filtres Rapides (Style Linear Tabs) */}
            <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Onglets de filtrage */}
                <div className="inline-flex items-center p-0.5 rounded-lg border border-neutral-200 bg-white text-xs overflow-x-auto max-w-full">
                    {[
                        { id: 'all', label: 'Tous les flux' },
                        { id: 'structured', label: 'Liens VCard' },
                        { id: 'qr_redirect', label: 'Redirections QR' },
                        { id: 'social', label: 'Réseaux Sociaux' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as FilterType)}
                            className={cn(
                                "px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
                                filter === tab.id 
                                    ? "bg-neutral-950 text-white shadow-xs font-semibold" 
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Champ de recherche direct */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Rechercher par URL, titre ou nom..."
                        className="pl-9 h-9 text-xs bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tableau Haute Densité (Stripe / Linear Table) */}
            <Card className="border border-neutral-200/80 shadow-none rounded-xl overflow-hidden bg-white">
                <CardHeader className="p-4 px-5 border-b border-neutral-100 flex flex-row items-center justify-between bg-neutral-50/40">
                    <div>
                        <CardTitle className="text-sm font-semibold text-neutral-950 uppercase tracking-wider">
                            Flux Global des Liens & Redirections
                        </CardTitle>
                        <CardDescription className="text-xs text-neutral-400 mt-0.5">
                            Inspection en temps réel de tous les points de redirection
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white border-neutral-200 text-neutral-600 font-mono text-[10px]">
                        {links.length} éléments
                    </Badge>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-2">
                            <Loader2 className="w-7 h-7 animate-spin text-neutral-400" />
                            <p className="text-xs text-neutral-400">Chargement des liens...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/60">
                                        <th className="px-5 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider min-w-[280px]">
                                            Contenu, Titre & URL
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider min-w-[180px]">
                                            Auteur / Propriétaire
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">
                                            Trafic (Clics / Scans)
                                        </th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right min-w-[160px]">
                                            Actions de Modération
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 bg-white">
                                    {links.length > 0 ? links.map((link) => {
                                        const isShortener = isUrlShortener(link.url)
                                        const isQr = link.type === 'qr_redirect'
                                        const initial = (link.owner?.name?.charAt(0) || 'U').toUpperCase()

                                        return (
                                            <tr 
                                                key={link.id} 
                                                className={cn(
                                                    "hover:bg-neutral-50/70 transition-colors group",
                                                    !link.is_active && "bg-neutral-50/50 opacity-60"
                                                )}
                                            >
                                                {/* 1. Contenu & URL */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col gap-1 max-w-md">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-xs font-semibold text-neutral-950 flex items-center gap-1.5">
                                                                {isQr ? (
                                                                    <QrCode className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                                                                ) : (
                                                                    <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                                                )}
                                                                <span>{link.title || 'Lien sans titre'}</span>
                                                            </span>

                                                            {isQr && (
                                                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
                                                                    QR Code
                                                                </span>
                                                            )}

                                                            {isShortener && (
                                                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                                                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                                                    Réducteur d&apos;URL
                                                                </span>
                                                            )}

                                                            {!link.is_active && (
                                                                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                                                                    Désactivé
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Lien externe */}
                                                        {link.url ? (
                                                            <a 
                                                                href={link.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="text-xs text-neutral-500 hover:text-neutral-950 hover:underline flex items-center gap-1 font-mono truncate max-w-sm mt-0.5 group/url"
                                                            >
                                                                <span className="truncate">{link.url}</span>
                                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover/url:opacity-100 transition-opacity shrink-0" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-neutral-400 italic">Aucune URL configurée</span>
                                                        )}

                                                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                                            {isQr ? 'Redirection QR' : 'Lien Profil'} • {link.created_at ? formatDistanceToNow(new Date(link.created_at), { addSuffix: true, locale: fr }) : 'date inconnue'}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* 2. Propriétaire */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-700 font-semibold text-xs shrink-0">
                                                            {initial}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-xs font-semibold text-neutral-950 truncate">
                                                                    {link.owner?.name || 'Client Inconnu'}
                                                                </p>
                                                                {link.owner && !link.owner.is_active && (
                                                                    <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 uppercase">
                                                                        Suspendu
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                                                                @{link.owner?.username || 'sans-slug'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* 3. Trafic */}
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="font-mono text-xs font-semibold text-neutral-900 tabular-nums">
                                                        {link.click_count || 0}
                                                    </span>
                                                    <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                                                        {isQr ? 'scans' : 'clics'}
                                                    </p>
                                                </td>

                                                {/* 4. Actions */}
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Toggle Activer / Bannir le lien */}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleToggleLinkActive(link)}
                                                            className={cn(
                                                                "h-7 px-2.5 text-xs font-medium rounded-lg transition-colors",
                                                                link.is_active 
                                                                    ? "text-neutral-600 hover:text-amber-800 hover:bg-amber-50" 
                                                                    : "text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50"
                                                            )}
                                                        >
                                                            {link.is_active ? <Ban className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                            <span>{link.is_active ? 'Bannir' : 'Activer'}</span>
                                                        </Button>

                                                        {/* Suspendre / Réactiver le profil parent */}
                                                        {link.owner?.id && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleSuspendProfile(link.owner!.id, !link.owner?.is_active, link.owner!.name)}
                                                                className={cn(
                                                                    "h-7 px-2.5 text-xs font-medium rounded-lg transition-colors",
                                                                    link.owner?.is_active 
                                                                        ? "text-neutral-500 hover:text-rose-700 hover:bg-rose-50" 
                                                                        : "text-blue-700 hover:bg-blue-50 bg-blue-50/60"
                                                                )}
                                                            >
                                                                {link.owner?.is_active ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                                                                <span>{link.owner?.is_active ? 'Suspendre profil' : 'Rétablir profil'}</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center max-w-xs mx-auto gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                                                        <SearchX className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-xs font-semibold text-neutral-900">
                                                        Aucun contenu trouvé
                                                    </p>
                                                    <p className="text-[11px] text-neutral-400">
                                                        Aucun lien ne correspond à vos filtres actuels.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Note d'Information Sécurité (Style Clean Minimaliste) */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/60 flex items-start gap-3 text-xs text-neutral-600">
                <ShieldCheck className="w-4 h-4 text-neutral-700 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                    <p className="font-semibold text-neutral-900">
                        Surveillance anti-abus et réducteurs d&apos;URL
                    </p>
                    <p className="text-neutral-500 text-[11px] leading-relaxed">
                        Les réducteurs de liens (Bitly, TinyURL, t.co) font l&apos;objet d&apos;un marquage d&apos;attention car ils peuvent masquer des destinations malveillantes. Vous pouvez bannir un lien individuellement ou suspendre l&apos;intégralité du profil auteur en cas de récidive.
                    </p>
                </div>
            </div>

            {/* Journal Récent des Actions de Modération */}
            {recentActivity.length > 0 && (
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-neutral-500" />
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                            Journal Récent des Décisions
                        </h2>
                    </div>

                    <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200/80 bg-white overflow-hidden">
                        {recentActivity.map((log) => {
                            const isBan = log.action === 'MODERATION_BAN'
                            return (
                                <div key={log.id} className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-neutral-50/60 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                                            isBan 
                                                ? "bg-rose-50 text-rose-700 border-rose-200/60" 
                                                : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                        )}>
                                            {isBan ? <Ban className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-neutral-950 truncate">
                                                <strong>{log.admin?.name || log.admin?.email || 'Admin'}</strong> a {isBan ? 'banni' : 'rétabli'} un contenu
                                            </p>
                                            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                                                Cible : {log.target_type} • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                                            </p>
                                        </div>
                                    </div>

                                    <Badge variant="outline" className="bg-neutral-50 border-neutral-200 text-neutral-600 font-mono text-[10px] shrink-0">
                                        Appliqué
                                    </Badge>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Modal de Confirmation Épurée (Au lieu de window.confirm) */}
            <Dialog open={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="sm:max-w-[420px] rounded-xl border border-neutral-200 shadow-xl bg-white p-6">
                    <DialogHeader className="space-y-2">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            confirmModal.variant === 'destructive' 
                                ? "bg-rose-50 text-rose-600 border border-rose-100" 
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        )}>
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-base font-semibold text-neutral-950">
                            {confirmModal.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-500 leading-relaxed">
                            {confirmModal.description}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-4 gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                            className="h-9 text-xs font-medium border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-lg flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={confirmModal.action}
                            className={cn(
                                "h-9 text-xs font-medium rounded-lg flex-1 shadow-xs text-white",
                                confirmModal.variant === 'destructive' 
                                    ? "bg-rose-600 hover:bg-rose-700" 
                                    : "bg-neutral-950 hover:bg-neutral-800"
                            )}
                        >
                            Confirmer l&apos;action
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
