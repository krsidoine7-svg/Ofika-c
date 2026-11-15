'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { 
    Search, 
    Loader2, 
    Globe, 
    ExternalLink, 
    Power, 
    Eye, 
    AlertTriangle, 
    ShieldAlert, 
    BarChart3, 
    Copy, 
    SearchX,
    RotateCw,
    Check,
    Lock,
    Unlock,
    Users,
    TrendingUp,
    ShieldCheck,
    Sparkles,
    ArrowUpRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"

interface Profile {
    id: string
    user_id: string
    profile_type: string
    name: string
    bio?: string
    image_url?: string
    custom_url?: string
    username?: string
    is_public: boolean
    is_active: boolean
    suspension_reason?: string
    design_choice?: string
    total_clicks?: number
    created_at: string
    user?: {
        name: string | null
        email: string | null
    }
}

type TabFilter = 'all' | 'active' | 'suspended' | 'public' | 'private'

export default function AdminProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState<TabFilter>('all')
    const [suspensionReason, setSuspensionReason] = useState('')
    const [lastSyncTime, setLastSyncTime] = useState<string>('')

    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string
        message: string
        variant: 'default' | 'destructive'
    }>({
        title: '',
        message: '',
        variant: 'default'
    })

    const fetchProfiles = useCallback(async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setIsRefreshing(true)
            } else {
                setLoading(true)
            }

            const response = await fetch('/api/admin/profiles')
            const data = await response.json()

            if (data.success) {
                setProfiles(data.profiles || [])
                const now = new Date()
                setLastSyncTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
                if (isManualRefresh) {
                    toast.success("Profils synchronisés en direct")
                }
            } else {
                throw new Error(data.error || "Erreur serveur")
            }
        } catch (error) {
            console.error('Erreur fetch profiles:', error)
            toast.error('Impossible de charger la liste des profils')
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchProfiles()
    }, [fetchProfiles])

    const openConfirm = (profile: Profile, title: string, message: string, variant: 'default' | 'destructive' = 'default') => {
        setSelectedProfile(profile)
        setSuspensionReason('')
        setConfirmConfig({ title, message, variant })
        setIsConfirmOpen(true)
    }

    const handleConfirmAction = () => {
        if (selectedProfile) {
            toggleProfileStatus(selectedProfile)
        }
    }

    const toggleProfileStatus = async (profile: Profile) => {
        try {
            const nextStatus = !profile.is_active

            const response = await fetch(`/api/admin/profiles/${profile.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ 
                    is_active: nextStatus,
                    suspension_reason: nextStatus ? null : suspensionReason 
                }),
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Erreur lors de la mise à jour")
            }

            toast.success(nextStatus ? "Profil / VCard réactivé avec succès" : "Profil mis hors-ligne / suspendu")
            setProfiles(profiles.map(p => p.id === profile.id ? { 
                ...p, 
                is_active: nextStatus,
                suspension_reason: nextStatus ? undefined : suspensionReason
            } : p))
            setSuspensionReason('')
        } catch (error: any) {
            toast.error(error.message || "Impossible de modifier le statut")
        } finally {
            setIsConfirmOpen(false)
        }
    }

    const getAppUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.origin
        }
        return (process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci').replace(/\/$/, '')
    }

    // Statistiques calculées
    const metrics = useMemo(() => {
        const total = profiles.length
        const active = profiles.filter(p => p.is_active).length
        const suspended = profiles.filter(p => !p.is_active).length
        const isPublic = profiles.filter(p => p.is_public && p.is_active).length
        const totalClicks = profiles.reduce((acc, p) => acc + (p.total_clicks || 0), 0)

        return { total, active, suspended, isPublic, totalClicks }
    }, [profiles])

    // Filtrage des profils
    const filteredProfiles = useMemo(() => {
        return profiles.filter(p => {
            const q = search.toLowerCase().trim()
            const matchesSearch =
                !q ||
                p.name?.toLowerCase().includes(q) ||
                p.username?.toLowerCase().includes(q) ||
                p.custom_url?.toLowerCase().includes(q) ||
                p.user?.email?.toLowerCase().includes(q) ||
                p.user?.name?.toLowerCase().includes(q)

            const matchesTab =
                activeTab === 'all' ||
                (activeTab === 'active' && p.is_active) ||
                (activeTab === 'suspended' && !p.is_active) ||
                (activeTab === 'public' && p.is_public && p.is_active) ||
                (activeTab === 'private' && (!p.is_public || !p.is_active))

            return Boolean(matchesSearch && matchesTab)
        })
    }, [profiles, search, activeTab])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                <p className="text-xs text-neutral-500 font-medium tracking-wide">
                    Chargement de l&apos;annuaire des profils...
                </p>
            </div>
        )
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
                            Modération • Annuaire VCard
                        </span>
                        {lastSyncTime && (
                            <span className="text-[11px] text-neutral-400">
                                • Synchro {lastSyncTime}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
                        Gestion des Profils & VCards
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500">
                        Supervisez les mini-sites, liens publics et identités professionnelles créés sur Ofika.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchProfiles(true)}
                        disabled={isRefreshing}
                        className="h-9 px-3 bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs gap-1.5 font-medium"
                    >
                        <RotateCw className={cn("w-3.5 h-3.5 text-neutral-500", isRefreshing && "animate-spin")} />
                        <span>Actualiser</span>
                    </Button>
                </div>
            </div>

            {/* 4 Mini Cartes KPI Exécutives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-neutral-200/80 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Total Profils
                        </span>
                        <Globe className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="text-2xl font-semibold text-neutral-950 font-mono tabular-nums">
                        {metrics.total}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                        Pages et fiches enregistrées
                    </p>
                </div>

                <div className="bg-white border border-neutral-200/80 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Actifs & Publics
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-2xl font-semibold text-emerald-700 font-mono tabular-nums">
                        {metrics.isPublic}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                        {metrics.total > 0 ? `${Math.round((metrics.isPublic / metrics.total) * 100)}% de taux de mise en ligne` : 'En ligne'}
                    </p>
                </div>

                <div className="bg-white border border-neutral-200/80 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Suspendus
                        </span>
                        <ShieldAlert className={cn("w-4 h-4", metrics.suspended > 0 ? "text-amber-500" : "text-neutral-300")} />
                    </div>
                    <div className={cn(
                        "text-2xl font-semibold font-mono tabular-nums",
                        metrics.suspended > 0 ? "text-amber-700" : "text-neutral-950"
                    )}>
                        {metrics.suspended}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                        {metrics.suspended > 0 ? "Nécessite votre modération" : "Zéro litige en cours"}
                    </p>
                </div>

                <div className="bg-white border border-neutral-200/80 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Clics Cumulés
                        </span>
                        <TrendingUp className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="text-2xl font-semibold text-neutral-950 font-mono tabular-nums">
                        {metrics.totalClicks.toLocaleString('fr-FR')}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                        Interactions totales enregistrées
                    </p>
                </div>
            </div>

            {/* Barre de Recherche et Filtres par Onglets (Style Linear) */}
            <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Filtres par onglets */}
                <div className="inline-flex items-center p-0.5 rounded-lg border border-neutral-200 bg-white text-xs overflow-x-auto max-w-full">
                    {[
                        { id: 'all', label: 'Tous', count: metrics.total },
                        { id: 'active', label: 'Actifs', count: metrics.active },
                        { id: 'suspended', label: 'Suspendus', count: metrics.suspended },
                        { id: 'public', label: 'Publics', count: metrics.isPublic },
                        { id: 'private', label: 'Privés', count: metrics.total - metrics.isPublic }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabFilter)}
                            className={cn(
                                "px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
                                activeTab === tab.id 
                                    ? "bg-neutral-950 text-white shadow-xs" 
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            <span>{tab.label}</span>
                            <span className={cn(
                                "text-[10px] font-mono px-1 rounded",
                                activeTab === tab.id 
                                    ? "bg-neutral-800 text-neutral-200" 
                                    : "bg-neutral-100 text-neutral-500"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Champ de recherche direct */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Rechercher nom, slug (/url), email..."
                        className="pl-9 h-9 text-xs bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tableau Haute Densité (Stripe / Linear Table) */}
            <Card className="border border-neutral-200/80 shadow-none rounded-xl overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/60">
                                    <th className="px-5 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider min-w-[240px]">
                                        Profil & Slug VCard
                                    </th>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider min-w-[180px]">
                                        Auteur & Compte
                                    </th>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">
                                        Statut & Visibilité
                                    </th>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">
                                        Clics
                                    </th>
                                    <th className="px-5 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right min-w-[140px]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 bg-white">
                                {filteredProfiles.length > 0 ? filteredProfiles.map((p) => {
                                    const slug = p.custom_url || p.username || ''
                                    const fullUrl = slug ? `${getAppUrl()}/${slug}` : null
                                    const initial = (p.name?.charAt(0) || 'P').toUpperCase()

                                    return (
                                        <tr 
                                            key={p.id} 
                                            className={cn(
                                                "hover:bg-neutral-50/70 transition-colors group",
                                                !p.is_active && "bg-rose-50/20 hover:bg-rose-50/40"
                                            )}
                                        >
                                            {/* 1. Profil & URL */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg border border-neutral-200/80 overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center font-semibold text-neutral-700 text-xs">
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            initial
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 max-w-[220px]">
                                                        <p className="text-xs font-semibold text-neutral-950 truncate" title={p.name}>
                                                            {p.name || 'Profil sans nom'}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200/60 uppercase">
                                                                {p.profile_type || 'standard'}
                                                            </span>
                                                            {slug ? (
                                                                <span className="text-[11px] font-mono text-neutral-500 truncate">
                                                                    /{slug}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[11px] text-neutral-400 italic">
                                                                    sans slug
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. Auteur & Email */}
                                            <td className="px-5 py-3.5">
                                                <p className="text-xs font-medium text-neutral-950 truncate">
                                                    {p.user?.name || 'Client Direct'}
                                                </p>
                                                <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                                                    {p.user?.email || 'N/A'}
                                                </p>
                                            </td>

                                            {/* 3. Statut & Visibilité */}
                                            <td className="px-5 py-3.5 text-center">
                                                <div className="inline-flex flex-col items-center gap-1">
                                                    {!p.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                            Suspendu
                                                        </span>
                                                    ) : p.is_public ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            En ligne (Public)
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                                            Privé
                                                        </span>
                                                    )}

                                                    {p.suspension_reason && !p.is_active && (
                                                        <span className="text-[9px] text-rose-500 truncate max-w-[130px] italic" title={p.suspension_reason}>
                                                            {p.suspension_reason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 4. Clics */}
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-neutral-800">
                                                    <BarChart3 className="w-3.5 h-3.5 text-neutral-400" />
                                                    {p.total_clicks || 0}
                                                </span>
                                            </td>

                                            {/* 5. Actions */}
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {fullUrl && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(fullUrl)
                                                                    toast.success("Lien de la VCard copié")
                                                                }}
                                                                title="Copier le lien public"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors"
                                                                onClick={() => window.open(fullUrl, '_blank')}
                                                                title="Ouvrir la page"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openConfirm(
                                                            p,
                                                            !p.is_active ? "Réactiver ce profil ?" : "Suspendre ce profil ?",
                                                            !p.is_active 
                                                                ? `Le mini-site "${p.name}" sera de nouveau accessible publiquement.` 
                                                                : `Le mini-site "${p.name}" sera mis hors ligne. Les QR codes et cartes NFC associés afficheront une page d'indisponibilité.`,
                                                            !p.is_active ? 'default' : 'destructive'
                                                        )}
                                                        className={cn(
                                                            "h-8 px-2.5 text-xs font-medium rounded-lg ml-1 transition-colors",
                                                            !p.is_active 
                                                                ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200" 
                                                                : "text-neutral-600 hover:text-rose-700 hover:bg-rose-50"
                                                        )}
                                                    >
                                                        <Power className="w-3.5 h-3.5 mr-1" />
                                                        <span>{!p.is_active ? "Activer" : "Suspendre"}</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center max-w-xs mx-auto gap-2">
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                                                    <SearchX className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs font-semibold text-neutral-900">
                                                    Aucun profil trouvé
                                                </p>
                                                <p className="text-[11px] text-neutral-400">
                                                    Modifiez vos filtres ou le terme de recherche.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Confirmation Épurée (Linear Dialog) */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-xl border border-neutral-200 shadow-xl bg-white p-6">
                    <DialogHeader className="space-y-2">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            confirmConfig.variant === 'destructive' 
                                ? "bg-rose-50 text-rose-600 border border-rose-100" 
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        )}>
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-base font-semibold text-neutral-950">
                            {confirmConfig.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-500 leading-relaxed">
                            {confirmConfig.message}
                        </DialogDescription>
                    </DialogHeader>

                    {confirmConfig.variant === 'destructive' && (
                        <div className="space-y-1.5 my-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                                Raison de la suspension (optionnel)
                            </label>
                            <Input 
                                placeholder="Ex: Contenu inapproprié, signalement, non-respect CGU..." 
                                className="h-9 text-xs bg-white border-neutral-200 rounded-lg focus-visible:ring-1 focus-visible:ring-neutral-950"
                                value={suspensionReason}
                                onChange={(e) => setSuspensionReason(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    <DialogFooter className="mt-4 gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsConfirmOpen(false)}
                            className="h-9 text-xs font-medium border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-lg flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            className={cn(
                                "h-9 text-xs font-medium rounded-lg flex-1 shadow-xs text-white",
                                confirmConfig.variant === 'destructive' 
                                    ? "bg-rose-600 hover:bg-rose-700" 
                                    : "bg-neutral-950 hover:bg-neutral-800"
                            )}
                        >
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
