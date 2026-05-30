'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/core/ui/card"
import { Search, Loader2, Link as LinkIcon, ExternalLink, Power, Eye, AlertTriangle, ShieldAlert, BarChart3, Copy, SearchX } from "lucide-react"
import { Badge } from "@/components/core/ui/badge"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
} from "@/components/core/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/core/ui/tabs"

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
        name: string
        email: string
    }
}

export default function AdminProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [suspensionReason, setSuspensionReason] = useState('')

    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string,
        message: string,
        variant: 'default' | 'destructive'
    }>({
        title: '',
        message: '',
        variant: 'default'
    })

    useEffect(() => {
        fetchProfiles()
    }, [])

    async function fetchProfiles() {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/profiles')
            const data = await response.json()

            if (data.success) {
                setProfiles(data.profiles)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            console.error('Erreur fetch profiles:', error)
            toast.error('Impossible de charger la liste des profils')
        } finally {
            setLoading(false)
        }
    }

    const openConfirm = (profile: Profile, title: string, message: string, variant: 'default' | 'destructive' = 'default') => {
        setSelectedProfile(profile)
        setSuspensionReason('') // Réinitialiser la raison au cas où
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
            toast.error(error.message || "Impossible de changer le statut")
        } finally {
            setIsConfirmOpen(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    const filteredProfiles = profiles.filter(p => {
        const matchesSearch =
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.username?.toLowerCase().includes(search.toLowerCase()) ||
            p.custom_url?.toLowerCase().includes(search.toLowerCase()) ||
            p.user?.email?.toLowerCase().includes(search.toLowerCase())

        const matchesTab =
            activeTab === 'all' ||
            (activeTab === 'active' && p.is_active) ||
            (activeTab === 'suspended' && !p.is_active) ||
            (activeTab === 'public' && p.is_public) ||
            (activeTab === 'private' && !p.is_public)

        return matchesSearch && matchesTab
    })

    const getAppUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <LinkIcon className="w-8 h-8 text-orange-500" />
                        Modération des Profils
                    </h1>
                    <p className="text-gray-500 font-medium">Contrôlez et modérez les VCard/mini-sites créés par les utilisateurs.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-100/80 p-1 rounded-xl h-auto flex flex-wrap gap-1">
                        <TabsTrigger value="all" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 shadow-none border-none">Tous</TabsTrigger>
                        <TabsTrigger value="active" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-green-600 shadow-none border-none">Actifs</TabsTrigger>
                        <TabsTrigger value="suspended" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-red-600 shadow-none border-none">Suspendus</TabsTrigger>
                        <TabsTrigger value="public" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-none border-none">Public</TabsTrigger>
                        <TabsTrigger value="private" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-600 shadow-none border-none">Privé</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Chercher nom, email ou slug..."
                        className="pl-10 h-11 border-gray-200 focus:ring-orange-500 rounded-xl bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest min-w-[200px]">Profil VCard</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Utilisateur / Auteur</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Visibilité</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Statistiques</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredProfiles.length > 0 ? filteredProfiles.map((p) => {
                                    const fullUrl = p.custom_url ? `${getAppUrl()}/${p.custom_url}` : p.username ? `${getAppUrl()}/${p.username}` : null;
                                    
                                    return (
                                        <tr key={p.id} className={cn(
                                            "hover:bg-gray-50/80 transition-all group",
                                            !p.is_active && "bg-red-50/30 hover:bg-red-50/50"
                                        )}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center">
                                                    <div className="relative w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 mr-4 shrink-0 shadow-sm flex items-center justify-center font-bold text-gray-400">
                                                        {p.image_url ? (
                                                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            p.name?.substring(0, 2).toUpperCase() || 'P'
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col max-w-[200px]">
                                                        <span className="text-sm font-black text-gray-900 truncate" title={p.name}>{p.name}</span>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Badge variant="outline" className="text-[9px] px-1 font-bold text-gray-500 bg-gray-50 border-gray-200 uppercase">{p.profile_type || 'STANDARD'}</Badge>
                                                            {p.custom_url || p.username ? (
                                                                <span className="text-xs text-blue-500 font-medium truncate">/{p.custom_url || p.username}</span>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 font-medium italic">Pas d'URL</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-black text-gray-900">{p.user?.name || 'Inconnu'}</div>
                                                <div className="text-xs text-gray-500 font-medium">{p.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <Badge className={cn(
                                                    "uppercase font-black text-[10px] tracking-tight border-none",
                                                    !p.is_active ? "bg-red-100 text-red-700" :
                                                        p.is_public ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                )}>
                                                    {!p.is_active ? 'SUSPENDU' : p.is_public ? 'PUBLIC' : 'PRIVÉ'}
                                                </Badge>
                                                {!p.is_active && (
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-[10px] font-bold text-red-500 mt-1 flex items-center justify-center gap-1">
                                                            <ShieldAlert className="w-3 h-3" /> Suspendu
                                                        </div>
                                                        {p.suspension_reason && (
                                                            <div className="text-[9px] text-gray-400 italic max-w-[120px] truncate mt-0.5" title={p.suspension_reason}>
                                                                Raison: {p.suspension_reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="inline-flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 min-w-[60px]">
                                                    <BarChart3 className={cn("w-4 h-4 mb-0.5", (p.total_clicks || 0) > 0 ? "text-orange-500" : "text-gray-300")} />
                                                    <span className="text-xs font-black text-gray-900">{p.total_clicks || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {fullUrl && (
                                                        <div className="flex items-center border-r border-gray-100 pr-2 mr-1 gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(fullUrl)
                                                                    toast.success("Lien copié")
                                                                }}
                                                                title="Copier le lien"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                                                                onClick={() => window.open(fullUrl, '_blank')}
                                                                title="Visiter la page"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "h-8 rounded-lg px-3 font-bold text-xs transition-colors",
                                                            !p.is_active 
                                                                ? "bg-green-50 text-green-600 hover:bg-green-100" 
                                                                : "bg-red-50 text-red-600 hover:bg-red-100"
                                                        )}
                                                        onClick={() => openConfirm(
                                                            p,
                                                            !p.is_active ? "Réactiver ce profil ?" : "Suspendre ce profil ?",
                                                            !p.is_active 
                                                                ? "Le mini-site redeviendra accessible selon les paramètres de l'utilisateur." 
                                                                : "Attention: Le mini-site sera mis hors-ligne. Les liens et QR codes associés ne mèneront à rien tant que le profil est suspendu.",
                                                            !p.is_active ? 'default' : 'destructive'
                                                        )}
                                                    >
                                                        <Power className="w-3.5 h-3.5 mr-1.5" />
                                                        {!p.is_active ? "Activer" : "Suspendre"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center max-w-xs mx-auto">
                                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                                    <SearchX className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="font-black text-gray-900 uppercase tracking-tighter mb-1">Aucun profil trouvé</p>
                                                <p className="text-gray-400 text-sm font-medium">Réessayez avec d'autres filtres de recherche.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg",
                            confirmConfig.variant === 'destructive' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        )}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <p className="text-gray-500 font-medium leading-relaxed mb-4">
                            {confirmConfig.message}
                        </p>

                        {confirmConfig.variant === 'destructive' && (
                            <div className="text-left space-y-2 px-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Raison de la suspension (optionnel)</label>
                                <Input 
                                    placeholder="Ex: Contenu inapproprié, Spam..." 
                                    className="rounded-xl border-gray-200 focus:ring-red-500 bg-white h-11"
                                    value={suspensionReason}
                                    onChange={(e) => setSuspensionReason(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}
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
                            onClick={handleConfirmAction}
                            className={cn(
                                "rounded-xl font-black uppercase tracking-widest flex-1 h-12 shadow-md text-white",
                                confirmConfig.variant === 'destructive' ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                            )}
                        >
                            Confirmer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
