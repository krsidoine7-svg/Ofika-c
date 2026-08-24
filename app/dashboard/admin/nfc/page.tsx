'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Users, Calendar, Search, Filter, Loader2, CreditCard, Smartphone, Layers, QrCode,
    Settings, Database, Eye, PlusCircle, Download, Copy, TrendingUp, Clock, Truck,
    CheckCircle2, Package, ChevronRight, SearchX, Trash2, Power, Edit3, AlertTriangle,
    Paintbrush, BarChart3, Link2, ExternalLink, RefreshCw, BarChart, LayoutGrid, Table,
    Wifi, User, Sparkles, ShieldCheck, Check, ArrowUpRight
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
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
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const DESIGN_NAMES: Record<string, string> = {
    design1: 'Classique', design2: 'Design', design3: 'Créatif', design4: 'Nature',
    influencer: 'Influenceur', ecommerce: 'E-commerce', design7: 'Dark Elegant', freelance: 'Freelance'
}

function getBaseUrl() {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL
    if (envUrl) return envUrl.replace(/\/$/, '')
    
    if (typeof window !== 'undefined') {
        return window.location.origin
    }
    return 'http://localhost:3000'
}

interface QRRedirect {
    id: string
    user_id: string
    short_code: string
    target_url: string
    type: string
    title: string | null
    description: string | null
    scan_count: number
    last_scanned_at: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    user?: {
        name: string
        email: string
    }
}

interface NFCCard {
    id: string
    user_id: string
    profile_id: string
    status: string
    design_id?: string
    design_choice?: string
    created_at: string
    type?: 'physical' | 'digital'
    card_type?: string
    preview_data?: {
        qr_code_url?: string
        nfc_link?: string
        profile_name?: string
    }
    profile_name?: string
    nfc_link?: string
    color_theme?: string
    user?: {
        name: string
        email: string
    }
    tracking_number?: string
    qr_redirect_id?: string
    short_code?: string
}

interface NFCStats {
    total: number
    pending: number
    production: number
    shipped: number
    activated: number
}

/**
 * Composant de prévisualisation graphique 3D d'une carte physique NFC
 */
function NFCCardPreview({
    profileName,
    colorTheme = 'black',
    designChoice = 'design1',
    status = 'activated',
    qrCodeUrl,
    className
}: {
    profileName?: string
    colorTheme?: string
    designChoice?: string
    status?: string
    qrCodeUrl?: string
    className?: string
}) {
    const isDark = colorTheme === 'black' || colorTheme === 'dark' || designChoice === 'design7'

    return (
        <div
            className={cn(
                "relative aspect-[1.586/1] w-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 select-none border group/card",
                isDark
                    ? "bg-gradient-to-br from-neutral-900 via-black to-neutral-950 text-white border-neutral-800/80 shadow-black/40"
                    : "bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900 border-slate-200/90 shadow-slate-200/50",
                className
            )}
        >
            {/* Glossy reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            
            {/* Mesh subtle pattern */}
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent blur-2xl pointer-events-none" />

            {/* Header: Logo & Contactless NFC Icon */}
            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm tracking-tighter shadow-sm",
                        isDark ? "bg-white text-black" : "bg-black text-white"
                    )}>
                        O
                    </div>
                    <div>
                        <span className="font-black text-xs tracking-widest uppercase opacity-90">OFIKA</span>
                        <span className="block text-[8px] font-semibold tracking-wider opacity-50 uppercase">NFC PRO</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* NFC Signal Waves Icon */}
                    <div className="flex items-center gap-1 opacity-70">
                        <Wifi className="w-5 h-5 rotate-90" />
                    </div>
                </div>
            </div>

            {/* Middle: Design Badge & Chip Placeholder */}
            <div className="relative z-10 flex items-center justify-between my-2">
                <div className={cn(
                    "w-10 h-7 rounded-md border flex items-center justify-center text-[9px] font-bold font-mono opacity-80",
                    isDark ? "bg-amber-400/10 border-amber-400/30 text-amber-300" : "bg-amber-500/10 border-amber-500/30 text-amber-700"
                )}>
                    CHIP
                </div>
                <Badge variant="outline" className={cn(
                    "text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 border-none",
                    isDark ? "bg-white/10 text-white/90" : "bg-black/10 text-black/90"
                )}>
                    {DESIGN_NAMES[designChoice] || designChoice}
                </Badge>
            </div>

            {/* Footer: Printed Name & Micro QR Code */}
            <div className="flex items-end justify-between relative z-10 mt-auto pt-2">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">TITULAIRE</p>
                    <p className="font-black text-sm md:text-base tracking-tight truncate max-w-[170px] uppercase">
                        {profileName || 'NOM DU PROFIL'}
                    </p>
                </div>

                {qrCodeUrl ? (
                    <div className="w-10 h-10 rounded-lg bg-white p-1 shrink-0 shadow-md border border-black/10">
                        <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                ) : (
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center p-1 shrink-0 border border-dashed",
                        isDark ? "border-white/20 bg-white/5 text-white/40" : "border-black/20 bg-black/5 text-black/40"
                    )}>
                        <QrCode className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default function AdminNFCPage() {
    const [mainTab, setMainTab] = useState('cards')
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
    const [cards, setCards] = useState<NFCCard[]>([])
    const [stats, setStats] = useState<NFCStats>({ total: 0, pending: 0, production: 0, shipped: 0, activated: 0 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')

    // États Redirections QR
    const [redirects, setRedirects] = useState<QRRedirect[]>([])
    const [loadingRedirects, setLoadingRedirects] = useState(false)
    const [searchRedirects, setSearchRedirects] = useState('')

    // États édition/suppression QR
    const [isQREditDialogOpen, setIsQREditDialogOpen] = useState(false)
    const [editingRedirect, setEditingRedirect] = useState<QRRedirect | null>(null)
    const [editUrl, setEditUrl] = useState('')
    const [editShortCode, setEditShortCode] = useState('')
    const [editIsActive, setEditIsActive] = useState(true)
    const [isUpdatingQR, setIsUpdatingQR] = useState(false)

    const [isQRConfirmOpen, setIsQRConfirmOpen] = useState(false)
    const [redirectToDelete, setRedirectToDelete] = useState<QRRedirect | null>(null)
    const [isDeletingQR, setIsDeletingQR] = useState(false)

    // État pour le dialogue de mise à jour de statut
    const [selectedCard, setSelectedCard] = useState<NFCCard | null>(null)
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
    const [trackingNumber, setTrackingNumber] = useState('')
    const [newStatus, setNewStatus] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [cardToEdit, setCardToEdit] = useState<NFCCard | null>(null)
    const [themeData, setThemeData] = useState<{ recentDesigns: any[], stats: any }>({ recentDesigns: [], stats: {} })

    // États pour le dialogue de confirmation groupé
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string,
        message: string,
        action: () => void,
        variant: 'default' | 'destructive'
    }>({
        title: '',
        message: '',
        action: () => { },
        variant: 'default'
    })

    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const tab = params.get('tab')
            if (tab === 'qr-redirects' || tab === 'cards') {
                setMainTab(tab)
            }
        }
    }, [])

    useEffect(() => {
        fetchCards()
        fetchThemeData()
        fetchRedirects()
    }, [supabase])

    const fetchThemeData = async () => {
        try {
            const res = await fetch('/api/admin/themes')
            const json = await res.json()
            if (json.success) setThemeData(json)
        } catch (err) {
            console.error("Erreur theme data:", err)
        }
    }

    async function fetchCards() {
        try {
            setLoading(true)

            const { data: cardsData, error: cardsError } = await supabase
                .from('digital_nfc_cards')
                .select('*')
                .order('created_at', { ascending: false })

            if (cardsError) throw cardsError

            const allCards = cardsData || []

            // Récupérer toutes les redirections QR pour lier le short_code
            const { data: qrData } = await supabase
                .from('qr_redirects')
                .select('id, short_code, target_url, user_id')

            const qrMapById = new Map(qrData?.map(q => [q.id, q]))
            const qrMapByUserId = new Map(qrData?.map(q => [q.user_id, q]))
            const qrMapByTargetUrl = new Map(qrData?.map(q => [q.target_url, q]))

            const userIds = Array.from(new Set(allCards.map(c => c.user_id)))
            let usersMap = new Map()

            if (userIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .in('id', userIds)

                usersMap = new Map(usersData?.map(u => [u.id, u]))
            }

            const mergedCards = allCards.map(card => {
                const targetLink = card.nfc_link || (card.preview_data as any)?.nfc_link
                const shortCodeInPreview = (card.preview_data as any)?.short_code
                const qrMatch = (card.qr_redirect_id && qrMapById.get(card.qr_redirect_id))
                    || (targetLink && qrMapByTargetUrl.get(targetLink))
                    || qrMapByUserId.get(card.user_id)

                const finalShortCode = qrMatch?.short_code || shortCodeInPreview

                return {
                    ...card,
                    user: usersMap.get(card.user_id),
                    short_code: finalShortCode
                }
            })

            setCards(mergedCards)
            calculateStats(mergedCards)

        } catch (error) {
            console.error('Erreur fetch NFC cards:', error)
            toast.error('Impossible de charger les cartes NFC')
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (data: NFCCard[]) => {
        const statsObj = {
            total: data.length,
            pending: data.filter(c => c.status === 'ordered').length,
            production: data.filter(c => c.status === 'in_production').length,
            shipped: data.filter(c => c.status === 'shipped').length,
            activated: data.filter(c => c.status === 'activated' || c.status === 'active').length
        }
        setStats(statsObj)
    }

    const fetchRedirects = async () => {
        try {
            setLoadingRedirects(true)
            const res = await fetch('/api/admin/qr-redirects')
            const json = await res.json()
            if (json.success) {
                setRedirects(json.data)
            } else {
                toast.error(json.error || 'Erreur lors du chargement des redirections')
            }
        } catch (error) {
            console.error('Erreur:', error)
            toast.error('Impossible de charger les redirections')
        } finally {
            setLoadingRedirects(false)
        }
    }

    const updateCardStatus = async () => {
        if (!selectedCard) return
        try {
            setIsUpdating(true)
            const updatePayload: any = {
                status: newStatus,
                updated_at: new Date().toISOString()
            }

            if (newStatus === 'shipped' && trackingNumber) {
                updatePayload.chip_id = trackingNumber
            }

            const response = await fetch(`/api/admin/nfc/${selectedCard.id}`, {
                method: 'PATCH',
                body: JSON.stringify(updatePayload),
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()
            if (!response.ok || !data.success) throw new Error(data.error || "Erreur lors du changement de statut")

            toast.success("Statut mis à jour")
            setIsStatusDialogOpen(false)
            fetchCards()
        } catch (error) {
            toast.error('Erreur lors de la mise à jour')
        } finally {
            setIsUpdating(false)
        }
    }

    const deleteCard = async (card: NFCCard) => {
        try {
            const response = await fetch(`/api/admin/nfc/${card.id}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Erreur lors de la suppression")
            }

            toast.success("Carte supprimée")
            fetchCards()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la suppression")
        } finally {
            setIsConfirmOpen(false)
        }
    }

    const toggleCardStatus = async (card: NFCCard) => {
        const currentActive = card.status !== 'inactive'
        const nextStatus = currentActive ? 'inactive' : 'activated'

        try {
            const response = await fetch(`/api/admin/nfc/${card.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: nextStatus,
                    updated_at: new Date().toISOString()
                }),
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()
            if (!response.ok || !data.success) throw new Error(data.error || "Erreur lors du changement de statut")
            toast.success(currentActive ? "Carte désactivée" : "Carte réactivée")
            fetchCards()
        } catch (error) {
            toast.error("Erreur lors du changement de statut")
        } finally {
            setIsConfirmOpen(false)
        }
    }

    const regenerateQRCode = async (card: NFCCard) => {
        try {
            const response = await fetch(`/api/admin/nfc/${card.id}/regenerate`, {
                method: 'POST',
            })

            const data = await response.json()
            if (!response.ok || !data.success) throw new Error(data.error || "Erreur lors de la régénération")

            toast.success("QR Code régénéré avec succès")
            fetchCards()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la régénération")
        } finally {
            setIsConfirmOpen(false)
        }
    }

    const handleQREditClick = (redirect: QRRedirect) => {
        setEditingRedirect(redirect)
        setEditUrl(redirect.target_url)
        setEditShortCode(redirect.short_code)
        setEditIsActive(redirect.is_active)
        setIsQREditDialogOpen(true)
    }

    const handleQRUpdate = async () => {
        if (!editingRedirect || !editUrl) return

        try {
            setIsUpdatingQR(true)
            const res = await fetch(`/api/admin/qr-redirects/${editingRedirect.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_url: editUrl,
                    short_code: editShortCode,
                    is_active: editIsActive
                })
            })

            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || "Erreur de mise à jour")

            toast.success("Redirection mise à jour avec succès")
            setIsQREditDialogOpen(false)
            fetchRedirects()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour")
        } finally {
            setIsUpdatingQR(false)
        }
    }

    const handleQRDeleteClick = (redirect: QRRedirect) => {
        setRedirectToDelete(redirect)
        setIsQRConfirmOpen(true)
    }

    const confirmQRDelete = async () => {
        if (!redirectToDelete) return

        try {
            setIsDeletingQR(true)
            const res = await fetch(`/api/admin/qr-redirects/${redirectToDelete.id}`, {
                method: 'DELETE'
            })

            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || "Erreur lors de la suppression")

            toast.success("Redirection supprimée")
            setIsQRConfirmOpen(false)
            fetchRedirects()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la suppression")
        } finally {
            setIsDeletingQR(false)
        }
    }

    const openConfirm = (title: string, message: string, action: () => void, variant: 'default' | 'destructive' = 'default') => {
        setConfirmConfig({ title, message, action, variant })
        setIsConfirmOpen(true)
    }

    const openStatusDialog = (card: NFCCard, status: string) => {
        setSelectedCard(card)
        setNewStatus(status)
        setTrackingNumber(card.tracking_number || (card.preview_data as any)?.tracking_number || '')
        setIsStatusDialogOpen(true)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'activated':
            case 'active':
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold px-2.5 py-0.5 text-[11px] flex items-center gap-1.5 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Activée
                    </Badge>
                )
            case 'shipped':
                return (
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold px-2.5 py-0.5 text-[11px] flex items-center gap-1.5 w-fit">
                        <Truck className="w-3 h-3 text-blue-500" />
                        Expédiée
                    </Badge>
                )
            case 'in_production':
                return (
                    <Badge className="bg-purple-50 text-purple-700 border border-purple-200/60 font-semibold px-2.5 py-0.5 text-[11px] flex items-center gap-1.5 w-fit">
                        <Settings className="w-3 h-3 text-purple-500 animate-spin" />
                        En fabrication
                    </Badge>
                )
            case 'ordered':
                return (
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold px-2.5 py-0.5 text-[11px] flex items-center gap-1.5 w-fit">
                        <Package className="w-3 h-3 text-amber-500" />
                        Commandée
                    </Badge>
                )
            case 'inactive':
                return (
                    <Badge className="bg-slate-100 text-slate-600 border border-slate-200 font-semibold px-2.5 py-0.5 text-[11px] flex items-center gap-1.5 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Désactivée
                    </Badge>
                )
            default:
                return <Badge variant="outline" className="text-slate-600 uppercase text-[10px]">{status}</Badge>
        }
    }

    const filteredCards = cards.filter(card => {
        const matchesSearch =
            card.id.toLowerCase().includes(search.toLowerCase()) ||
            (card.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (card.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (card.profile_name || card.preview_data?.profile_name || '').toLowerCase().includes(search.toLowerCase())

        const matchesTab =
            activeTab === 'all' ||
            (activeTab === 'to_produce' && card.status === 'ordered') ||
            (activeTab === 'in_production' && card.status === 'in_production') ||
            (activeTab === 'shipped' && card.status === 'shipped') ||
            (activeTab === 'activated' && (card.status === 'activated' || card.status === 'active'))

        return matchesSearch && matchesTab
    })

    const filteredRedirects = redirects.filter(r =>
        r.short_code.toLowerCase().includes(searchRedirects.toLowerCase()) ||
        r.target_url?.toLowerCase().includes(searchRedirects.toLowerCase()) ||
        (r.user?.name || '').toLowerCase().includes(searchRedirects.toLowerCase()) ||
        (r.user?.email || '').toLowerCase().includes(searchRedirects.toLowerCase())
    )

    const getBaseUrl = () => {
        const envUrl = process.env.NEXT_PUBLIC_APP_URL
        if (envUrl) return envUrl.replace(/\/$/, '')

        if (typeof window !== 'undefined') {
            return window.location.origin
        }
        return 'http://localhost:3000'
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
                <p className="text-sm font-medium text-slate-400">Chargement de l'espace administration NFC & QR...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-7xl mx-auto">
            {/* Header principal */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200/60">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestion NFC & QR Codes</h1>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-mono text-xs px-2.5 py-0.5">Vercel SaaS Edition</Badge>
                    </div>
                    <p className="text-sm text-slate-500 font-normal">Supervisez la fabrication des cartes physiques, gérez les profils digitaux et contrôlez les liens dynamiques.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider px-5 py-5 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Nouvelle Carte
                    </Button>
                </div>
            </div>

            {/* Onglets principaux NFC vs QR */}
            <Tabs value={mainTab} onValueChange={setMainTab} className="w-full space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <TabsList className="bg-slate-100/80 p-1 rounded-xl inline-flex gap-1 border border-slate-200/60">
                        <TabsTrigger
                            value="cards"
                            className="rounded-lg px-5 py-2 font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            Cartes NFC ({cards.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="qr-redirects"
                            className="rounded-lg px-5 py-2 font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                        >
                            <QrCode className="w-3.5 h-3.5" />
                            Redirections QR ({redirects.length})
                        </TabsTrigger>
                    </TabsList>

                    {mainTab === 'cards' && (
                        <div className="flex items-center gap-2 self-end md:self-auto">
                            <div className="bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "h-8 px-3 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all",
                                        viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" /> Grille 3D
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className={cn(
                                        "h-8 px-3 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all",
                                        viewMode === 'table' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    <Table className="w-3.5 h-3.5" /> Tableau
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contenu Onglet 1 : Cartes NFC */}
                <TabsContent value="cards" className="space-y-6 border-none p-0">
                    {/* Statistiques SaaS */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card className="border border-slate-200/60 shadow-sm rounded-xl bg-white p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-slate-500">
                                <span className="text-[11px] font-bold uppercase tracking-wider">Total cartes</span>
                                <Package className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Physiques & digitales</p>
                            </div>
                        </Card>

                        <Card className="border border-slate-200/60 shadow-sm rounded-xl bg-white p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-amber-600">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">À produire</span>
                                <Clock className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-black text-slate-900">{stats.pending}</p>
                                <p className="text-[10px] text-amber-600 font-bold mt-0.5">Commandes récentes</p>
                            </div>
                        </Card>

                        <Card className="border border-slate-200/60 shadow-sm rounded-xl bg-white p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-purple-600">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">En cours</span>
                                <Settings className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-black text-slate-900">{stats.production}</p>
                                <p className="text-[10px] text-purple-600 font-bold mt-0.5">En atelier d'impression</p>
                            </div>
                        </Card>

                        <Card className="border border-slate-200/60 shadow-sm rounded-xl bg-white p-4 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-blue-600">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Expédiées</span>
                                <Truck className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-black text-slate-900">{stats.shipped}</p>
                                <p className="text-[10px] text-blue-600 font-bold mt-0.5">En cours d'acheminement</p>
                            </div>
                        </Card>

                        <Card className="border border-slate-200/60 shadow-sm rounded-xl bg-white p-4 flex flex-col justify-between col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between text-emerald-600">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Activées</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-black text-slate-900">{stats.activated}</p>
                                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Cartes prêtes & actives</p>
                            </div>
                        </Card>
                    </div>

                    {/* Filtres & Recherche */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
                        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
                            <TabsList className="bg-slate-100/70 p-1 rounded-xl h-auto flex flex-wrap gap-1">
                                <TabsTrigger value="all" className="rounded-lg font-bold text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-none border-none">Toutes</TabsTrigger>
                                <TabsTrigger value="to_produce" className="rounded-lg font-bold text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-none border-none">À Produire</TabsTrigger>
                                <TabsTrigger value="in_production" className="rounded-lg font-bold text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-none border-none">Fabrication</TabsTrigger>
                                <TabsTrigger value="shipped" className="rounded-lg font-bold text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-none border-none">Expédiées</TabsTrigger>
                                <TabsTrigger value="activated" className="rounded-lg font-bold text-xs px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-none border-none">Activées</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Filtrer par nom, email, ID..."
                                className="pl-10 h-10 border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-xl bg-slate-50/50 focus:bg-white text-xs font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* VUE 1 : GRILLE 3D (CARDS VIEW) */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCards.length > 0 ? (
                                filteredCards.map((card) => {
                                    const qrUrl = card.preview_data?.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(card.preview_data?.nfc_link || card.nfc_link || getBaseUrl())}`
                                    const profileName = card.profile_name || card.preview_data?.profile_name || card.user?.name || 'Nom non défini'

                                    return (
                                        <Card key={card.id} className="border border-slate-200/70 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white group flex flex-col justify-between">
                                            <CardContent className="p-5 space-y-4">
                                                {/* En-tête de la carte */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center font-black text-xs text-slate-800">
                                                            {card.user?.name ? card.user.name.substring(0, 2).toUpperCase() : 'NFC'}
                                                        </div>
                                                        <div className="space-y-0.5 max-w-[160px]">
                                                            <p className="font-bold text-xs text-slate-900 truncate">{card.user?.name || 'Utilisateur inconnu'}</p>
                                                            <p className="text-[11px] text-slate-400 truncate">{card.user?.email}</p>
                                                        </div>
                                                    </div>

                                                    <div>{getStatusBadge(card.status)}</div>
                                                </div>

                                                {/* Previsu 3D Badge physique */}
                                                <NFCCardPreview
                                                    profileName={profileName}
                                                    colorTheme={card.color_theme || 'black'}
                                                    designChoice={card.design_choice || 'design1'}
                                                    status={card.status}
                                                    qrCodeUrl={qrUrl}
                                                />

                                                {/* Affichage du Lien Short Dynamique (/qr/short_code) */}
                                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                                            <Link2 className="w-3 h-3 text-orange-500" /> Lien Short Dynamique
                                                        </span>
                                                        {card.short_code && (
                                                            <Badge className="bg-orange-100 text-orange-700 border-none font-mono text-[9px] px-1.5 py-0">
                                                                /qr/{card.short_code}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {card.short_code ? (
                                                        <div className="flex items-center justify-between gap-1 pt-0.5">
                                                            <span className="font-mono text-xs font-bold text-slate-800 truncate select-all">
                                                                {`${getBaseUrl()}/qr/${card.short_code}`}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-1.5 text-[10px] font-bold hover:bg-slate-200 text-slate-600 shrink-0"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(`${getBaseUrl()}/qr/${card.short_code}`)
                                                                    toast.success("Lien short copié !")
                                                                }}
                                                            >
                                                                <Copy className="w-3 h-3 mr-1" /> Copier
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">Aucun lien short généré</span>
                                                    )}
                                                </div>

                                                {/* Infos de suivi & type */}
                                                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">ID: {card.id.substring(0, 8)}</span>
                                                        {card.type === 'physical' ? (
                                                            <Badge variant="outline" className="text-[10px] border-slate-200">PVC Physique</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-700 bg-purple-50">Virtuelle</Badge>
                                                        )}
                                                    </div>

                                                    {card.tracking_number && (
                                                        <span className="text-[10px] font-mono font-bold text-blue-600 flex items-center gap-1">
                                                            <Truck className="w-3 h-3" /> {card.tracking_number}
                                                        </span>
                                                    )}
                                                </div>
                                            </CardContent>

                                            {/* Barre d'action rapide sous la carte */}
                                            <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg flex items-center gap-1"
                                                        onClick={() => {
                                                            const link = card.preview_data?.nfc_link || card.nfc_link || ""
                                                            if (link) {
                                                                navigator.clipboard.writeText(link)
                                                                toast.success("Lien de la carte copié !")
                                                            } else {
                                                                toast.error("Aucun lien configuré")
                                                            }
                                                        }}
                                                    >
                                                        <Copy className="w-3.5 h-3.5" /> Copier lien
                                                    </Button>

                                                    {card.preview_data?.nfc_link && (
                                                        <a
                                                            href={card.preview_data.nfc_link}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
                                                            title="Voir la page publique"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {card.status === 'ordered' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-3 text-[11px] font-extrabold bg-slate-900 text-white hover:bg-black rounded-lg"
                                                            onClick={() => openStatusDialog(card, 'in_production')}
                                                        >
                                                            Prod
                                                        </Button>
                                                    )}
                                                    {card.status === 'in_production' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-3 text-[11px] font-extrabold bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                                                            onClick={() => openStatusDialog(card, 'shipped')}
                                                        >
                                                            Expédier
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
                                                        onClick={() => {
                                                            setCardToEdit(card)
                                                            setIsEditDialogOpen(true)
                                                        }}
                                                        title="Modifier la carte"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => openConfirm(
                                                            "Supprimer la carte ?",
                                                            "Toutes les données associées à cette carte seront définitivement effacées.",
                                                            () => deleteCard(card),
                                                            'destructive'
                                                        )}
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })
                            ) : (
                                <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200/60">
                                    <SearchX className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="font-bold text-slate-800 text-sm">Aucune carte trouvée</p>
                                    <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VUE 2 : TABLEAU SAAS (TABLE VIEW) */}
                    {viewMode === 'table' && (
                        <Card className="border border-slate-200/60 shadow-sm overflow-hidden rounded-2xl bg-white">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs whitespace-nowrap">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                                <th className="px-6 py-3.5">ID / Propriétaire</th>
                                                <th className="px-6 py-3.5">Nom sur Carte & Thème</th>
                                                <th className="px-6 py-3.5">Type & Statut</th>
                                                <th className="px-6 py-3.5 text-center">Aperçu QR</th>
                                                <th className="px-6 py-3.5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {filteredCards.length > 0 ? (
                                                filteredCards.map((card) => {
                                                    const qrUrl = card.preview_data?.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(card.preview_data?.nfc_link || card.nfc_link || getBaseUrl())}`

                                                    return (
                                                        <tr key={card.id} className="hover:bg-slate-50/60 transition-all">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700">
                                                                        {card.user?.name ? card.user.name.substring(0, 2).toUpperCase() : 'U'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-900 text-xs">{card.user?.name || 'Inconnu'}</p>
                                                                        <p className="text-[11px] text-slate-400">{card.user?.email}</p>
                                                                        <span className="font-mono text-[9px] text-slate-400">ID: {card.id.substring(0, 8)}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="space-y-1">
                                                                    <p className="font-black text-slate-800 uppercase tracking-tight">
                                                                        {card.profile_name || card.preview_data?.profile_name || 'Sans Nom'}
                                                                    </p>
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className="text-[9px] border-slate-200 uppercase">
                                                                            {card.color_theme || 'black'}
                                                                        </Badge>
                                                                        <span className="text-[10px] text-slate-400">
                                                                            {DESIGN_NAMES[card.design_choice || 'design1'] || card.design_choice}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="space-y-1">
                                                                    {getStatusBadge(card.status)}
                                                                    {card.tracking_number && (
                                                                        <p className="text-[10px] font-mono text-blue-600 font-bold flex items-center gap-1">
                                                                            <Truck className="w-3 h-3" /> {card.tracking_number}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <img
                                                                    src={qrUrl}
                                                                    alt="QR"
                                                                    className="w-9 h-9 object-contain mx-auto rounded border border-slate-200 p-0.5 cursor-pointer hover:scale-110 transition-transform"
                                                                    onClick={() => window.open(qrUrl, '_blank')}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                                                        onClick={() => {
                                                                            setCardToEdit(card)
                                                                            setIsEditDialogOpen(true)
                                                                        }}
                                                                    >
                                                                        <Edit3 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                        onClick={() => openConfirm(
                                                                            "Supprimer la carte ?",
                                                                            "Action irréversible.",
                                                                            () => deleteCard(card),
                                                                            'destructive'
                                                                        )}
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                                                        Aucune donnée enregistrée
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Contenu Onglet 2 : Redirections QR */}
                <TabsContent value="qr-redirects" className="space-y-6 border-none p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border border-slate-200/60 shadow-sm rounded-2xl bg-white p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Liens Courts Actifs</span>
                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <Link2 className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-slate-900">{redirects.length}</p>
                        </Card>

                        <Card className="border border-slate-200/60 shadow-sm rounded-2xl bg-white p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scans Totaux Effectués</span>
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <BarChart className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-slate-900">
                                {redirects.reduce((acc, curr) => acc + (curr.scan_count || 0), 0)}
                            </p>
                        </Card>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher par slug, destination ou utilisateur..."
                                className="pl-10 h-10 border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-xl bg-white text-xs"
                                value={searchRedirects}
                                onChange={(e) => setSearchRedirects(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={fetchRedirects}
                            variant="outline"
                            className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 text-xs flex items-center gap-2"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Actualiser
                        </Button>
                    </div>

                    <Card className="border border-slate-200/60 shadow-sm overflow-hidden rounded-2xl bg-white">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                            <th className="px-6 py-3.5 text-center w-12">Actif</th>
                                            <th className="px-6 py-3.5">Utilisateur</th>
                                            <th className="px-6 py-3.5">Lien Dynamique NFC ➡️ Destination</th>
                                            <th className="px-6 py-3.5 text-center">Scans</th>
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {filteredRedirects.length > 0 ? (
                                            filteredRedirects.map((redirect) => (
                                                <tr key={redirect.id} className="hover:bg-slate-50/60 transition-all">
                                                    <td className="px-6 py-4 text-center">
                                                        <div className={cn(
                                                            "w-2.5 h-2.5 rounded-full mx-auto",
                                                            redirect.is_active ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-red-400"
                                                        )} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-900 text-xs">{redirect.user?.name || 'Inconnu'}</p>
                                                        <p className="text-[11px] text-slate-400">{redirect.user?.email}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1 max-w-md">
                                                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                                                                <span className="font-mono text-[11px] font-bold text-slate-800 flex-1 truncate">
                                                                    {`${getBaseUrl()}/qr/${redirect.short_code}`}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0 hover:bg-white text-slate-400 hover:text-slate-900"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(`${getBaseUrl()}/qr/${redirect.short_code}`)
                                                                        toast.success('Lien court copié !')
                                                                    }}
                                                                >
                                                                    <Copy className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[11px]">
                                                                <span className="text-slate-400">Pointe vers :</span>
                                                                <a href={redirect.target_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium truncate max-w-xs">
                                                                    {redirect.target_url}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-700 text-xs">
                                                        {redirect.scan_count || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                onClick={() => handleQREditClick(redirect)}
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                onClick={() => handleQRDeleteClick(redirect)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                                                    Aucune redirection disponible
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* MODALE 1 : REFONTE MODIFIER LA CARTE (2 COLONNES AVEC APERÇU EN DIRECT) */}
            {cardToEdit && (
                <AdminEditCardDialog
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    card={cardToEdit}
                    onSuccess={(shouldClose = true) => {
                        fetchCards()
                        if (shouldClose) setIsEditDialogOpen(false)
                    }}
                />
            )}

            {/* MODALE 2 : CRÉER UNE CARTE */}
            <AdminCreateCardDialog
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => {
                    fetchCards()
                    setIsCreateDialogOpen(false)
                }}
            />

            {/* MODALE 3 : CHANGEMENT DE STATUT LOGISTIQUE */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">
                            {newStatus === 'in_production' ? '🚚 Lancer la fabrication' : '🚀 Déclarer l\'expédition'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Propriétaire : <span className="font-bold text-slate-900">{selectedCard?.user?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {newStatus === 'shipped' && (
                            <div className="space-y-1.5">
                                <Label htmlFor="tracking" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Numéro de Suivi Colis</Label>
                                <Input
                                    id="tracking"
                                    placeholder="Ex: FR123456789LA"
                                    className="h-11 border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-xl font-mono uppercase"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} className="rounded-xl border-slate-200">Annuler</Button>
                        <Button
                            className="bg-slate-900 hover:bg-black text-white rounded-xl font-bold px-6"
                            onClick={updateCardStatus}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer le statut'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODALE 4 : CONFIRMATION GÉNÉRIQUE */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-sm rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className={cn(
                            "text-lg font-black",
                            confirmConfig.variant === 'destructive' ? "text-red-600" : "text-slate-900"
                        )}>
                            {confirmConfig.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-600 mt-1">
                            {confirmConfig.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setIsConfirmOpen(false)}>Annuler</Button>
                        <Button
                            onClick={confirmConfig.action}
                            className={cn(
                                "rounded-xl font-bold px-5 text-white",
                                confirmConfig.variant === 'destructive' ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-black"
                            )}
                        >
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODALE 5 : ÉDITION REDIRECTION QR */}
            <Dialog open={isQREditDialogOpen} onOpenChange={setIsQREditDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">Modifier la Redirection QR</DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            ID : <span className="font-mono bg-slate-100 px-1 rounded">{editingRedirect?.id}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Slug (Code court)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-mono">/qr/</span>
                                <Input
                                    value={editShortCode}
                                    onChange={(e) => setEditShortCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                                    placeholder="ex: ma-carte"
                                    className="h-11 rounded-xl bg-slate-50 font-mono font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase">URL de destination</Label>
                            <Input
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                placeholder="https://..."
                                className="h-11 rounded-xl bg-slate-50"
                            />
                        </div>

                        <div className="flex items-center justify-between border border-slate-100 p-3 rounded-xl">
                            <div>
                                <Label className="text-xs font-bold text-slate-900">Activer le lien</Label>
                                <p className="text-[10px] text-slate-400">Permet ou désactive les redirections instantanées.</p>
                            </div>
                            <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setIsQREditDialogOpen(false)} disabled={isUpdatingQR}>Annuler</Button>
                        <Button className="rounded-xl bg-slate-900 text-white hover:bg-black" onClick={handleQRUpdate} disabled={isUpdatingQR}>
                            {isUpdatingQR && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODALE 6 : SUPPRESSION QR REDIRECT */}
            <Dialog open={isQRConfirmOpen} onOpenChange={setIsQRConfirmOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-red-600">Supprimer la redirection ?</DialogTitle>
                        <DialogDescription className="text-xs text-slate-600 mt-1">
                            Cette action supprimera définitivement le code court et désactivera l'accès à la carte associée.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setIsQRConfirmOpen(false)} disabled={isDeletingQR}>Annuler</Button>
                        <Button className="rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={confirmQRDelete} disabled={isDeletingQR}>
                            {isDeletingQR && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

/**
 * COMPOSANT REFONDU DE LA MODALE "MODIFIER LA CARTE" (2 COLONNES AVEC APERÇU EN DIRECT)
 */
function AdminEditCardDialog({
    isOpen,
    onOpenChange,
    card,
    onSuccess
}: {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    card: NFCCard
    onSuccess: (shouldClose?: boolean) => void
}) {
    const [loading, setLoading] = useState(false)
    const [isGeneratingShort, setIsGeneratingShort] = useState(false)
    const [currentShortCode, setCurrentShortCode] = useState<string | undefined>(card.short_code)

    const [formData, setFormData] = useState({
        profile_name: card.preview_data?.profile_name || card.profile_name || '',
        nfc_link: card.nfc_link || (card.preview_data as any)?.nfc_link || '',
        design_id: card.design_id || card.design_choice || 'design1',
        color_theme: card.color_theme || 'black',
        status: card.status || 'ordered',
        tracking_number: card.tracking_number || (card.preview_data as any)?.tracking_number || ''
    })

    const handleGenerateShortCode = async () => {
        try {
            setIsGeneratingShort(true)
            const response = await fetch(`/api/admin/nfc/${card.id}/regenerate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nfc_link: formData.nfc_link })
            })
            const data = await response.json()
            if (!response.ok || !data.success) throw new Error(data.error || "Erreur de génération")

            const generatedCode = data.data?.short_code
            if (generatedCode) {
                setCurrentShortCode(generatedCode)
                card.short_code = generatedCode
            }

            toast.success("Lien short dynamique généré avec succès !")
            onSuccess(false)
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la génération du lien short")
        } finally {
            setIsGeneratingShort(false)
        }
    }

    useEffect(() => {
        setCurrentShortCode(card.short_code)
        setFormData({
            profile_name: card.preview_data?.profile_name || card.profile_name || '',
            nfc_link: card.nfc_link || (card.preview_data as any)?.nfc_link || '',
            design_id: card.design_id || card.design_choice || 'design1',
            color_theme: card.color_theme || 'black',
            status: card.status || 'ordered',
            tracking_number: card.tracking_number || (card.preview_data as any)?.tracking_number || ''
        })
    }, [card])

    const handleUpdate = async () => {
        setLoading(true)
        try {
            const updatePayload: any = {
                status: formData.status,
                profile_name: formData.profile_name,
                design_choice: formData.design_id,
                color_theme: formData.color_theme,
                chip_id: formData.tracking_number,
                updated_at: new Date().toISOString()
            }

            const response = await fetch(`/api/admin/nfc/${card.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    ...updatePayload,
                    nfc_link: formData.nfc_link
                }),
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()
            if (!response.ok || !data.success) throw new Error(data.error || "Erreur lors de la mise à jour")
            
            toast.success("Carte modifiée avec succès")
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour")
        } finally {
            setLoading(false)
        }
    }

    const qrUrl = card.preview_data?.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(formData.nfc_link || 'https://ofika.ci')}`

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[850px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white">
                <DialogHeader className="sr-only">
                    <DialogTitle>Modifier la carte</DialogTitle>
                    <DialogDescription>Formulaire de modification de la carte NFC</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                    
                    {/* Colonne Gauche : Aperçu Live Carte Physical Badge 3D */}
                    <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="space-y-1 relative z-10">
                            <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono text-[10px] uppercase tracking-wider">
                                Aperçu en Direct
                            </Badge>
                            <h3 className="text-xl font-black tracking-tight text-white">Rendu Physique Carte</h3>
                            <p className="text-xs text-slate-400">Les modifications apportées au formulaire se mettent à jour automatiquement sur la carte ci-dessous.</p>
                        </div>

                        {/* Composant de carte interactive live */}
                        <div className="my-6 relative z-10 transform hover:scale-[1.02] transition-transform">
                            <NFCCardPreview
                                profileName={formData.profile_name}
                                colorTheme={formData.color_theme}
                                designChoice={formData.design_id}
                                status={formData.status}
                                qrCodeUrl={qrUrl}
                            />
                        </div>

                        <div className="relative z-10 space-y-2 text-[11px] text-slate-400 bg-white/5 p-3 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between">
                                <span>ID Carte :</span>
                                <span className="font-mono text-white font-bold">{card.id.substring(0, 8)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Propriétaire :</span>
                                <span className="text-white font-bold">{card.user?.name || 'Inconnu'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Colonne Droite : Formulaire d'Édition Pro Style Vercel */}
                    <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6 bg-white">
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modifier la carte</h2>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    ID: <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{card.id.substring(0, 8)}</span> — Propriétaire: <span className="font-bold text-slate-800">{card.user?.name || 'Inconnu'}</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Nom du profil */}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        Nom du Profil sur la Carte
                                    </Label>
                                    <Input
                                        placeholder="Ex: Jean Dupont"
                                        value={formData.profile_name}
                                        onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                                        className="h-11 border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-xl font-bold text-sm bg-slate-50/50 focus:bg-white"
                                    />
                                </div>

                                {/* Lien Short Dynamique (À graver sur la carte NFC) */}
                                <div className="space-y-1.5 p-3.5 bg-orange-50/40 rounded-xl border border-orange-200/60">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                            <QrCode className="w-3.5 h-3.5 text-orange-500" />
                                            Lien Short Dynamique (À graver sur la carte NFC)
                                        </Label>
                                        {currentShortCode && (
                                            <Badge className="bg-orange-100 text-orange-800 border-none font-mono text-[10px]">
                                                /qr/{currentShortCode}
                                            </Badge>
                                        )}
                                    </div>
                                    {currentShortCode ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                readOnly
                                                value={`${getBaseUrl()}/qr/${currentShortCode}`}
                                                className="h-9 border-orange-200 bg-white font-mono text-xs text-slate-900 font-bold flex-1 select-all"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3 text-xs font-bold border-orange-200 text-orange-900 hover:bg-orange-100"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${getBaseUrl()}/qr/${currentShortCode}`)
                                                    toast.success("Lien short dynamique copié !")
                                                }}
                                            >
                                                <Copy className="w-3.5 h-3.5 mr-1" /> Copier
                                            </Button>
                                            <a
                                                href={`${getBaseUrl()}/qr/${currentShortCode}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="h-9 w-9 flex items-center justify-center rounded-lg border border-orange-200 bg-white hover:bg-orange-50 text-orange-700 shadow-sm"
                                                title="Tester le lien short"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2 pt-1">
                                            <span className="text-xs text-slate-500 italic">Aucun code short associé.</span>
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={isGeneratingShort}
                                                onClick={handleGenerateShortCode}
                                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
                                            >
                                                {isGeneratingShort ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                Générer un lien short
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        C'est ce lien court permanent qui doit être gravé physiquement sur la carte NFC pour permettre la redirection dynamique.
                                    </p>
                                </div>

                                {/* Lien NFC Destination */}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Link2 className="w-3.5 h-3.5 text-slate-400" />
                                        Lien NFC (Destination finale)
                                    </Label>
                                    <Input
                                        placeholder="Ex: https://ofika.ci/p/jean-dupont"
                                        value={formData.nfc_link}
                                        onChange={(e) => setFormData({ ...formData, nfc_link: e.target.value })}
                                        className="h-11 border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-xl font-mono text-xs bg-slate-50/50 focus:bg-white"
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium">C'est l'URL vers laquelle le lien short redirigera l'utilisateur lors du scan.</p>
                                </div>

                                {/* Design & Couleur */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <Paintbrush className="w-3.5 h-3.5 text-slate-400" />
                                            Design
                                        </Label>
                                        <select
                                            className="w-full h-11 border border-slate-200 rounded-xl px-3 font-bold text-xs bg-slate-50/50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-900"
                                            value={formData.design_id}
                                            onChange={(e) => setFormData({ ...formData, design_id: e.target.value })}
                                        >
                                            <option value="design1">Classique</option>
                                            <option value="design2">Moderne</option>
                                            <option value="design3">Créatif</option>
                                            <option value="design7">Dark Elegant</option>
                                            <option value="freelance">Freelance</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                                            Couleur Physique
                                        </Label>
                                        <select
                                            className="w-full h-11 border border-slate-200 rounded-xl px-3 font-bold text-xs bg-slate-50/50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-900"
                                            value={formData.color_theme}
                                            onChange={(e) => setFormData({ ...formData, color_theme: e.target.value })}
                                        >
                                            <option value="black">Noir Profond</option>
                                            <option value="white">Blanc Nacré</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Statut & Numéro de Suivi */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Statut Carte</Label>
                                        <select
                                            className="w-full h-11 border border-slate-200 rounded-xl px-3 font-bold text-xs bg-slate-50/50 focus:bg-white outline-none focus:ring-1 focus:ring-slate-900"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="ordered">Commandée</option>
                                            <option value="in_production">En fabrication</option>
                                            <option value="shipped">Expédiée</option>
                                            <option value="activated">Activée / Prête</option>
                                            <option value="inactive">Désactivée</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                                            N° de Suivi
                                        </Label>
                                        <Input
                                            placeholder="FR123456789LA"
                                            value={formData.tracking_number}
                                            onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                                            className="h-11 border-slate-200 focus:ring-1 focus:ring-slate-900 rounded-xl font-mono text-xs uppercase bg-slate-50/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer d'Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl font-bold text-xs hover:bg-slate-100 text-slate-600 px-5"
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="bg-slate-900 hover:bg-black text-white font-extrabold uppercase text-xs tracking-wider px-7 h-11 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                ENREGISTRER
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

/**
 * COMPOSANT REFONDU DE CRÉATION DE CARTE
 */
function AdminCreateCardDialog({
    isOpen,
    onOpenChange,
    onSuccess
}: {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [profiles, setProfiles] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState('')
    const [selectedProfile, setSelectedProfile] = useState('')
    const [type, setType] = useState<'digital' | 'physical'>('digital')

    const [formData, setFormData] = useState({
        profile_name: '',
        custom_url: '',
        design_choice: 'design1',
        color_theme: 'black'
    })

    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        if (isOpen) {
            fetchUsersAndProfiles()
        }
    }, [isOpen])

    const fetchUsersAndProfiles = async () => {
        try {
            const { data: usersData } = await supabase.from('users').select('id, name, email').order('name')
            const { data: profilesData } = await supabase.from('profiles').select('id, name, user_id').order('name')
            setUsers(usersData || [])
            setProfiles(profilesData || [])
        } catch (err) {
            console.error(err)
        }
    }

    const handleCreate = async () => {
        if (!selectedUser) {
            toast.error("Veuillez sélectionner un utilisateur")
            return
        }

        setLoading(true)
        try {
            const nfc_link = selectedProfile
                ? `${window.location.origin}/p/${selectedProfile}`
                : `${window.location.origin}/user-${selectedUser.substring(0, 6)}`

            const insertData = {
                user_id: selectedUser,
                profile_id: selectedProfile || null,
                profile_name: formData.profile_name || 'Sans nom',
                nfc_link: type === 'digital'
                    ? `${window.location.origin}/${formData.custom_url || 'card-' + Date.now()}`
                    : nfc_link,
                design_choice: formData.design_choice,
                color_theme: formData.color_theme,
                status: type === 'digital' ? 'active' : 'ordered',
                custom_url: type === 'digital' ? formData.custom_url : null,
                card_type: type
            }

            const { data: nfcCard, error: nfcError } = await supabase
                .from('digital_nfc_cards')
                .insert(insertData)
                .select()
                .single()

            if (nfcError) throw nfcError
            toast.success(type === 'digital' ? "Carte virtuelle créée" : "Commande carte physique créée")
            onSuccess()
        } catch (error: any) {
            console.error('Erreur création:', error)
            toast.error(error.message || "Erreur lors de la création")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl bg-white p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        Créer une carte NFC
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 font-medium">
                        Ajouter une nouvelle carte virtuelle ou commander une carte PVC physique.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Choix du Type */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant={type === 'digital' ? 'default' : 'outline'}
                            onClick={() => setType('digital')}
                            className={cn(
                                "h-16 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all",
                                type === 'digital' ? "bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            <Smartphone className="w-5 h-5" />
                            Virtuelle (Digital)
                        </Button>
                        <Button
                            variant={type === 'physical' ? 'default' : 'outline'}
                            onClick={() => setType('physical')}
                            className={cn(
                                "h-16 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all",
                                type === 'physical' ? "bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            <CreditCard className="w-5 h-5" />
                            Physique (PVC)
                        </Button>
                    </div>

                    {/* Propriétaire */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Propriétaire Utilisateur</Label>
                        <select
                            className="w-full h-11 border border-slate-200 rounded-xl px-3 font-bold text-xs bg-slate-50/50 outline-none"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">-- Sélectionner un utilisateur --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    {/* Nom du Profil */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Nom du profil sur la carte</Label>
                        <Input
                            placeholder="Ex: Jean Dupont"
                            value={formData.profile_name}
                            onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                            className="h-11 border-slate-200 rounded-xl font-bold text-xs"
                        />
                    </div>

                    {/* Thème & Design */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Design</Label>
                            <select
                                className="w-full h-11 border border-slate-200 rounded-xl px-3 font-bold text-xs bg-slate-50/50 outline-none"
                                value={formData.design_choice}
                                onChange={(e) => setFormData({ ...formData, design_choice: e.target.value })}
                            >
                                <option value="design1">Classique</option>
                                <option value="design2">Moderne</option>
                                <option value="design3">Premium</option>
                                <option value="design7">Dark Elegant</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Couleur</Label>
                            <select
                                className="w-full h-11 border border-slate-200 rounded-xl px-3 font-bold text-xs bg-slate-50/50 outline-none"
                                value={formData.color_theme}
                                onChange={(e) => setFormData({ ...formData, color_theme: e.target.value })}
                            >
                                <option value="black">Noir Profond</option>
                                <option value="white">Blanc Nacré</option>
                            </select>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold text-xs">Annuler</Button>
                    <Button
                        onClick={handleCreate}
                        disabled={loading}
                        className="bg-slate-900 hover:bg-black text-white font-extrabold uppercase tracking-wider text-xs px-6 h-11 rounded-xl shadow-md"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer la carte'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
