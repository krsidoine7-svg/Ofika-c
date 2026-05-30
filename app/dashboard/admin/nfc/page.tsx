'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import { Users, Calendar, Search, Filter, Loader2, CreditCard, Smartphone, Layers, QrCode, Settings, Database, Eye, PlusCircle, Download, Copy, TrendingUp, Clock, Truck, CheckCircle2, Package, ChevronRight, SearchX, Trash2, Power, Edit3, AlertTriangle, Paintbrush, BarChart3 } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { Badge } from "@/components/core/ui/badge"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/core/ui/dialog"
import { Label } from "@/components/core/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/core/ui/tabs"

const DESIGN_NAMES: Record<string, string> = {
    design1: 'Classique', design2: 'Design', design3: 'Créatif', design4: 'Nature',
    influencer: 'Influenceur', ecommerce: 'E-commerce', design7: 'Dark Elegant', freelance: 'Freelance'
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
}

interface NFCStats {
    total: number
    pending: number
    production: number
    shipped: number
    activated: number
}

export default function AdminNFCPage() {
    const [cards, setCards] = useState<NFCCard[]>([])
    const [stats, setStats] = useState<NFCStats>({ total: 0, pending: 0, production: 0, shipped: 0, activated: 0 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')

    // État pour le dialogue de mise à jour de statut
    const [selectedCard, setSelectedCard] = useState<NFCCard | null>(null)
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
    const [trackingNumber, setTrackingNumber] = useState('')
    const [newStatus, setNewStatus] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [cardToEdit, setCardToEdit] = useState<NFCCard | null>(null)
    const [themeData, setThemeData] = useState<{recentDesigns: any[], stats: any}>({recentDesigns: [], stats: {}})

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
        fetchCards()
        fetchThemeData()
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

            // 1. Récupérer toutes les cartes (table fusionnée)
            const { data: cardsData, error: cardsError } = await supabase
                .from('digital_nfc_cards')
                .select('*')
                .order('created_at', { ascending: false })

            if (cardsError) throw cardsError

            const allCards = cardsData || []

            // 2. Récupérer les infos utilisateurs
            const userIds = Array.from(new Set(allCards.map(c => c.user_id)))

            if (userIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .in('id', userIds)

                const usersMap = new Map(usersData?.map(u => [u.id, u]))

                const mergedCards = allCards.map(card => ({
                    ...card,
                    user: usersMap.get(card.user_id)
                }))

                setCards(mergedCards)
                calculateStats(mergedCards)
            } else {
                setCards(allCards)
                calculateStats(allCards)
            }

        } catch (error) {
            console.error('Erreur fetch NFC cards:', error)
            toast.error('Impossible de charger les cartes NFC')
        } finally {
            setLoading(false)
        }
    }

    function calculateStats(cardsList: NFCCard[]) {
        const stats: NFCStats = {
            total: cardsList.length,
            pending: cardsList.filter(c => c.status === 'ordered').length,
            production: cardsList.filter(c => c.status === 'in_production').length,
            shipped: cardsList.filter(c => c.status === 'shipped').length,
            activated: cardsList.filter(c => c.status === 'activated' || c.status === 'active').length
        }
        setStats(stats)
    }

    const updateCardStatus = async () => {
        if (!selectedCard || !newStatus) return

        try {
            setIsUpdating(true)

            const updateData: any = {
                status: newStatus,
                updated_at: new Date().toISOString()
            }

            if (newStatus === 'shipped' && trackingNumber) {
                const updatedPreview = {
                    ...(selectedCard.preview_data || {}),
                    tracking_number: trackingNumber
                }
                updateData.preview_data = updatedPreview
            }

            const response = await fetch(`/api/admin/nfc/${selectedCard.id}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()
            if (!response.ok || !data.success) throw new Error(data.error || "Erreur lors de la mise à jour")

            toast.success(`Statut mis à jour : ${newStatus}`)
            setIsStatusDialogOpen(false)
            fetchCards()
        } catch (error) {
            console.error('Erreur update status:', error)
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
            case 'active': return <Badge className="bg-green-100 text-green-700 border-none">Activée</Badge>
            case 'shipped': return <Badge className="bg-blue-100 text-blue-700 border-none">Expédiée</Badge>
            case 'in_production': return <Badge className="bg-purple-100 text-purple-700 border-none">En production</Badge>
            case 'ordered': return <Badge className="bg-gray-100 text-gray-700 border-none">Commandée</Badge>
            case 'inactive': return <Badge variant="secondary" className="bg-red-100 text-red-600 border-none">Désactivée</Badge>
            default: return <Badge variant="secondary" className="bg-gray-100 uppercase text-[10px]">{status}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
            </div>
        )
    }

    const filteredCards = cards.filter(card => {
        const matchesSearch =
            card.id.toLowerCase().includes(search.toLowerCase()) ||
            (card.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (card.user?.email || '').toLowerCase().includes(search.toLowerCase())

        const matchesTab =
            activeTab === 'all' ||
            (activeTab === 'to_produce' && card.status === 'ordered') ||
            (activeTab === 'in_production' && card.status === 'in_production') ||
            (activeTab === 'shipped' && card.status === 'shipped') ||
            (activeTab === 'activated' && (card.status === 'activated' || card.status === 'active'))

        return matchesSearch && matchesTab
    })

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion Logistique NFC</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Pilotage de la production et des expéditions</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest px-6 py-6 rounded-2xl shadow-xl shadow-gray-200 flex items-center gap-3 transition-all active:scale-95"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Nouvelle Carte
                    </Button>
                </div>
            </div>

            {/* Statistiques Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm rounded-2xl bg-white group hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                                <Package className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-gray-600 border-gray-200">En attente</Badge>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-gray-900">{stats.pending}</p>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">À produire</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white group hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                                <Settings className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-purple-600 border-purple-200">En cours</Badge>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-gray-900">{stats.production}</p>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">En fabrication</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white group hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                                <Truck className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">Expédié</Badge>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-gray-900">{stats.shipped}</p>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Envoyés</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white group hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 transition-colors group-hover:bg-green-500 group-hover:text-white">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200">Succès</Badge>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-gray-900">{stats.activated}</p>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Activées</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-100/80 p-1 rounded-xl h-auto flex flex-wrap gap-1">
                        <TabsTrigger value="all" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 shadow-none border-none">Tout</TabsTrigger>
                        <TabsTrigger value="to_produce" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 shadow-none border-none">À Produire</TabsTrigger>
                        <TabsTrigger value="in_production" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 shadow-none border-none">Fabrication</TabsTrigger>
                        <TabsTrigger value="shipped" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 shadow-none border-none">Expédié</TabsTrigger>
                        <TabsTrigger value="activated" className="rounded-lg font-bold text-xs uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 shadow-none border-none">Activées</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher par nom, email..."
                        className="pl-10 h-11 border-gray-200 focus:ring-black rounded-xl bg-white"
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
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest min-w-[180px]">Design / Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Couleur</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest min-w-[200px]">Client</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-20">Contenu</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredCards.length > 0 ? filteredCards.map((card) => (
                                    <tr key={card.id} className="hover:bg-gray-50/80 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-all relative overflow-hidden",
                                                    (card.card_type === 'physical' || card.color_theme) ? (
                                                        card.color_theme === 'white' ? "bg-white text-gray-900 border border-gray-100" :
                                                        "bg-gray-900 text-white"
                                                    ) : "bg-gradient-to-br from-gray-700 to-gray-900 text-white"
                                                )}>
                                                    {card.type === 'physical' ? <CreditCard className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                                                    
                                                    {/* Color identifier badge */}
                                                    {(card.card_type === 'physical' || card.color_theme) && (
                                                        <div className={cn(
                                                            "absolute bottom-0 right-0 w-full h-1.5",
                                                            card.color_theme === 'white' ? "bg-gray-100" :
                                                            "bg-black"
                                                        )} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                                        {(card.design_id || card.design_choice || 'design1').replace('design-', '')}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-mono font-bold tracking-tighter">#{card.id.substring(0, 8).toUpperCase()}</p>
                                                    <Badge variant="outline" className="mt-1 text-[8px] h-4 py-0 font-black border-gray-100 text-gray-400 uppercase">{card.card_type || 'Digital'}</Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {(card.card_type === 'physical' || card.color_theme) ? (
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className={cn(
                                                            "w-8 h-8 rounded-lg border-2 border-gray-100 shadow-sm",
                                                            card.color_theme === 'white' ? "bg-white" : 
                                                            "bg-gray-900"
                                                        )} 
                                                    />
                                                    <span className="text-xs font-black text-gray-900 uppercase">
                                                        {card.color_theme === 'white' ? 'Blanche' : 'Noire'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-[10px] font-bold uppercase">— Digital</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-black text-gray-900 tracking-tight">{card.user?.name || 'Inconnu'}</div>
                                            <div className="text-xs text-gray-400 font-medium">{card.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                {(() => {
                                                    const nfcLink = card.preview_data?.nfc_link || card.nfc_link || "";
                                                    const qrUrl = card.preview_data?.qr_code_url || (nfcLink ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(nfcLink)}` : null);

                                                    if (!qrUrl) return <Badge variant="secondary" className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-tighter">No Link/QR</Badge>;

                                                    return (
                                                        <div className="relative group/qr">
                                                            <div className="p-1 px-1 border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden transition-all group-hover/qr:shadow-lg w-14 h-14 flex items-center justify-center">
                                                                <img
                                                                    src={qrUrl}
                                                                    alt="QR Code"
                                                                    className="w-12 h-12 object-contain transition-all group-hover/qr:scale-110 cursor-pointer"
                                                                    onClick={() => window.open(qrUrl, '_blank')}
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="absolute -right-2 -top-2 h-7 w-7 p-0 rounded-full opacity-0 group-hover/qr:opacity-100 transition-opacity bg-black text-white hover:bg-gray-800 shadow-lg border-2 border-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const link = document.createElement('a');
                                                                    link.href = qrUrl;
                                                                    link.target = '_blank';
                                                                    link.download = `QR-${card.id.substring(0, 8)}.png`;
                                                                    link.click();
                                                                }}
                                                            >
                                                                <Download className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })()}

                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-[10px] px-2 font-bold uppercase tracking-wider text-gray-900 bg-gray-100/50 hover:bg-gray-200 rounded-lg flex items-center gap-1.5"
                                                        onClick={() => {
                                                            const link = card.preview_data?.nfc_link || card.nfc_link || "";
                                                            if (link) {
                                                                navigator.clipboard.writeText(link);
                                                                toast.success("Lien copié");
                                                            } else {
                                                                toast.error("Aucun lien à copier");
                                                            }
                                                        }}
                                                    >
                                                        <Copy className="w-3 h-3" /> Lien Card
                                                    </Button>
                                                    {(card.preview_data?.profile_name || card.profile_name) && (
                                                        <span className="text-[10px] text-gray-400 font-bold italic truncate max-w-[120px]">
                                                            "{card.preview_data?.profile_name || card.profile_name}"
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                {card.type === 'physical' ? (
                                                    <Badge className="w-fit bg-blue-50 text-blue-600 border-none text-[10px] font-black uppercase tracking-tight">Physique PVC</Badge>
                                                ) : (
                                                    <Badge className="w-fit bg-purple-50 text-purple-600 border-none text-[10px] font-black uppercase tracking-tight">Digital / Virtuel</Badge>
                                                )}
                                                <div>
                                                    {getStatusBadge(card.status)}
                                                    {card.tracking_number && (
                                                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                                                            <Truck className="w-3 h-3" /> {card.tracking_number}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {card.status === 'ordered' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-gray-200 h-9 px-4"
                                                        onClick={() => openStatusDialog(card, 'in_production')}
                                                    >
                                                        Lancer Prod
                                                    </Button>
                                                )}
                                                {card.status === 'in_production' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-100 h-9 px-4"
                                                        onClick={() => openStatusDialog(card, 'shipped')}
                                                    >
                                                        Expédier
                                                    </Button>
                                                )}

                                                <div className="flex items-center ml-2 border-l border-gray-100 pl-2 gap-1">
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100" onClick={() => window.open(card.preview_data?.nfc_link, '_blank')}>
                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                        onClick={() => {
                                                            setCardToEdit(card)
                                                            setIsEditDialogOpen(true)
                                                        }}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "h-9 w-9 p-0 rounded-xl transition-colors",
                                                            card.status === 'inactive' ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"
                                                        )}
                                                        onClick={() => openConfirm(
                                                            card.status === 'inactive' ? "Réactiver la carte ?" : "Désactiver la carte ?",
                                                            card.status === 'inactive' ? "La carte sera de nouveau fonctionnelle pour l'utilisateur." : "L'utilisateur ne pourra plus utiliser cette carte nfc tant qu'elle est désactivée.",
                                                            () => toggleCardStatus(card)
                                                        )}
                                                        title={card.status === 'inactive' ? "Réactiver" : "Désactiver"}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                                        onClick={() => openConfirm(
                                                            "Régénérer le QR Code ?",
                                                            "Cette action va créer une nouvelle redirection dynamique pour cette carte. L'utilisateur pourra toujours utiliser ses anciens liens mais le QR sera mis à jour.",
                                                            () => regenerateQRCode(card)
                                                        )}
                                                        title="Régénérer QR"
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                                                        onClick={() => openConfirm(
                                                            "Supprimer la carte ?",
                                                            "Cette action est irréversible. Toutes les données associées à cette carte seront perdues.",
                                                            () => deleteCard(card),
                                                            'destructive'
                                                        )}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center max-w-xs mx-auto">
                                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                                    <SearchX className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="font-black text-gray-900 uppercase tracking-tighter mb-1">Aucune carte trouvée</p>
                                                <p className="text-gray-400 text-sm font-medium">Réessayez avec d'autres critères de recherche.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Design Distribution Chart - Moved from Themes */}
            {themeData.stats?.designDistribution && Object.keys(themeData.stats.designDistribution).length > 0 && (
                <div className="space-y-4 pt-8">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Répartition des Designs</h2>
                    </div>
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {Object.entries(themeData.stats.designDistribution as Record<string, number>)
                                    .sort(([,a], [,b]) => (b as number) - (a as number))
                                    .map(([design, count]) => {
                                        const maxCount = Math.max(...Object.values(themeData.stats.designDistribution as Record<string, number>))
                                        const percentage = Math.round(((count as number) / themeData.recentDesigns.length) * 100)
                                        const barWidth = Math.round(((count as number) / (maxCount as number)) * 100)
                                        const designLabel = DESIGN_NAMES[design] || design
                                        return (
                                            <div key={design} className="flex items-center gap-4">
                                                <div className="w-28 shrink-0 text-right">
                                                    <span className="text-xs font-black text-gray-600 uppercase tracking-wider">{designLabel}</span>
                                                </div>
                                                <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden relative">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-gray-700 to-gray-900 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                                                        style={{ width: `${Math.max(barWidth, 8)}%` }}
                                                    >
                                                        {barWidth > 20 && (
                                                            <span className="text-[10px] font-black text-white">{count as number}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-12 shrink-0 text-right">
                                                    <span className="text-xs font-bold text-gray-400">{percentage}%</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* User Design Choices - Detailed Table - Moved from Themes */}
            <div className="space-y-6 pt-8">
                <div className="flex items-center gap-2">
                    <Paintbrush className="w-5 h-5 text-gray-400" />
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Choix Utilisateurs Détaillés</h2>
                    <Badge variant="outline" className="ml-2 rounded-lg font-black text-[10px]">{themeData.recentDesigns.length} profils</Badge>
                </div>
                {themeData.recentDesigns.length > 0 ? (
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
                                        <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Design</th>
                                        <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Couleur</th>
                                        <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                        <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Voir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {themeData.recentDesigns.map((p: any) => (
                                        <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 font-black text-sm flex items-center justify-center">
                                                            {p.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{p.name || 'Sans nom'}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">@{p.username || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                    p.design_choice === 'design1' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    p.design_choice === 'design2' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                    p.design_choice === 'design3' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    p.design_choice === 'design4' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    p.design_choice === 'influencer' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                                                    p.design_choice === 'ecommerce' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    p.design_choice === 'design7' ? 'bg-gray-800 text-gray-100 border-gray-700' :
                                                    p.design_choice === 'freelance' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                                } border`}>
                                                    {DESIGN_NAMES[p.design_choice] || p.design_choice || 'Non défini'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-6 h-6 rounded-lg border-2 border-gray-200 shadow-inner"
                                                        style={{ backgroundColor: p.color_theme && p.color_theme !== 'default' ? p.color_theme : '#f3f4f6' }}
                                                        title={p.color_theme || 'Par défaut'}
                                                    />
                                                    <span className="text-[10px] font-mono text-gray-400">{p.color_theme || 'défaut'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs text-gray-500 capitalize">{p.profile_type || '—'}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs text-gray-400">
                                                    {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {p.username && (
                                                    <a 
                                                        href={`/${p.username}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-gray-400 hover:text-gray-900 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ) : (
                    <div className="py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Paintbrush className="w-8 h-8 opacity-20" />
                        <p className="font-bold text-sm uppercase tracking-widest">Aucun profil récent</p>
                    </div>
                )}
            </div>

            {/* Modal de Mise à Jour de Statut / Logistique */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                            {newStatus === 'in_production' ? '🚚 Mise en Production' : '🚀 Expédition de la carte'}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-gray-500">
                            Propriétaire : <span className="text-gray-900">{selectedCard?.user?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {newStatus === 'shipped' && (
                            <div className="space-y-2">
                                <Label htmlFor="tracking" className="font-black text-xs uppercase tracking-widest text-gray-400 ml-1">Numéro de Suivi (Transporteur)</Label>
                                <Input
                                    id="tracking"
                                    placeholder="Ex: FR123456789LA"
                                    className="h-12 border-gray-200 focus:ring-blue-500 rounded-xl font-bold uppercase"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-400 font-bold ml-1 italic">Note: Le client pourra voir ce numéro sur son dashboard.</p>
                            </div>
                        )}

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-900 shadow-sm">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Action</p>
                                    <p className="text-sm font-black text-gray-900">Passer au statut {newStatus}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsStatusDialogOpen(false)} className="rounded-xl font-bold">Annuler</Button>
                        <Button
                            className={cn(
                                "rounded-xl font-black uppercase tracking-widest px-8 shadow-lg transition-all",
                                newStatus === 'in_production' ? "bg-black hover:bg-gray-800 shadow-gray-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                            )}
                            onClick={updateCardStatus}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Création de Carte (Nouveau) */}
            <AdminCreateCardDialog
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => {
                    fetchCards()
                    setIsCreateDialogOpen(false)
                }}
            />

            {/* Modal d'Édition de Carte (Nouveau) */}
            {cardToEdit && (
                <AdminEditCardDialog
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    card={cardToEdit}
                    onSuccess={() => {
                        fetchCards()
                        setIsEditDialogOpen(false)
                    }}
                />
            )}

            {/* Modal de Confirmation Générique */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="hidden">
                        <DialogTitle>{confirmConfig.title}</DialogTitle>
                        <DialogDescription>{confirmConfig.message}</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg",
                            confirmConfig.variant === 'destructive' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-900"
                        )}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{confirmConfig.title}</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            {confirmConfig.message}
                        </p>
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
                            onClick={confirmConfig.action}
                            className={cn(
                                "rounded-xl font-black uppercase tracking-widest flex-1 h-12 shadow-md",
                                confirmConfig.variant === 'destructive' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-black hover:bg-gray-800 text-white"
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

/**
 * Composant d'édition de carte pour l'admin
 */
function AdminEditCardDialog({ isOpen, onOpenChange, card, onSuccess }: { isOpen: boolean, onOpenChange: (open: boolean) => void, card: NFCCard, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        profile_name: card.preview_data?.profile_name || card.profile_name || '',
        nfc_link: card.nfc_link || (card.preview_data as any)?.nfc_link || '',
        design_id: card.design_id || card.design_choice || 'design1',
        color_theme: card.color_theme || 'black',
        status: card.status || 'ordered',
        tracking_number: card.tracking_number || (card.preview_data as any)?.tracking_number || ''
    })

    const supabase = useMemo(() => createClient(), [])

    const handleUpdate = async () => {
        setLoading(true)
        try {
            const table = 'digital_nfc_cards'
            const updatePayload: any = {
                status: formData.status,
                profile_name: formData.profile_name,
                design_choice: formData.design_id,
                color_theme: formData.color_theme,
                chip_id: formData.tracking_number, // On réutilise le champ pour stocker une info
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
            
            // Si la carte a un QR dynamique associé, on met à jour sa destination aussi pour la synchro
            const qrRedirectId = card.qr_redirect_id || (card.preview_data as any)?.redirect_id;
            if (qrRedirectId) {
                // On nettoie le lien si c'est notre domaine
                let cleanLink = formData.nfc_link;
                const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
                if (cleanLink.includes(appUrl)) {
                    const parts = cleanLink.split(appUrl);
                    if (parts.length > 1) {
                        cleanLink = parts[1].replace(/^\//, '');
                    }
                }

                await supabase
                    .from('qr_redirects')
                    .update({ 
                        nfc_link: cleanLink,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', qrRedirectId);
            }

            toast.success("Carte et redirection mises à jour")
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                        Modifier la carte
                    </DialogTitle>
                    <DialogDescription className="font-medium text-gray-500">
                        ID: {card.id.substring(0, 8).toUpperCase()} - {card.user?.name || 'Inconnu'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nom du profil</Label>
                        <Input
                            value={formData.profile_name}
                            onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                            className="h-12 border-gray-100 rounded-xl font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Lien NFC (Destination)</Label>
                        <Input
                            value={formData.nfc_link}
                            onChange={(e) => setFormData({ ...formData, nfc_link: e.target.value })}
                            className="h-12 border-gray-100 rounded-xl font-bold font-mono text-sm"
                            placeholder="Ex: errison ou https://google.com"
                        />
                        <p className="text-[10px] text-gray-400 font-medium">C'est ici que le QR code redirigera.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Design</Label>
                            <select
                                className="w-full h-12 border border-gray-100 rounded-xl px-4 font-bold bg-white"
                                value={formData.design_id}
                                onChange={(e) => setFormData({ ...formData, design_id: e.target.value })}
                            >
                                <option value="design1">Classique</option>
                                <option value="design2">Moderne</option>
                                <option value="design3">Premium</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Couleur Physique</Label>
                            <select
                                className="w-full h-12 border border-gray-100 rounded-xl px-4 font-bold bg-white"
                                value={formData.color_theme}
                                onChange={(e) => setFormData({ ...formData, color_theme: e.target.value })}
                            >
                                <option value="black">Noir</option>
                                <option value="white">Blanc</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Statut</Label>
                            <select
                                className="w-full h-12 border border-gray-100 rounded-xl px-4 font-bold bg-white"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="ordered">Commandée</option>
                                <option value="in_production">En production</option>
                                <option value="shipped">Expédiée</option>
                                <option value="activated">Activée</option>
                                <option value="inactive">Désactivée</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Numéro de suivi</Label>
                        <Input
                            value={formData.tracking_number}
                            onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                            className="h-12 border-gray-100 rounded-xl font-bold"
                            placeholder="FR123456789LA"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">Annuler</Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest px-8 rounded-xl"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * Composant de création de carte pour l'admin
 */
function AdminCreateCardDialog({ isOpen, onOpenChange, onSuccess }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) {
    const [step, setStep] = useState(1)
    const [type, setType] = useState<'digital' | 'physical'>('digital')
    const [users, setUsers] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [profiles, setProfiles] = useState<any[]>([])
    const [selectedProfile, setSelectedProfile] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [searchUser, setSearchUser] = useState('')

    const [formData, setFormData] = useState({
        profile_name: '',
        custom_url: '',
        design_choice: 'design1',
        color_theme: 'black',
        status: 'active'
    })

    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        if (isOpen) {
            fetchUsers()
        }
    }, [isOpen])

    async function fetchUsers() {
        const { data } = await supabase.from('users').select('id, name, email').limit(20)
        setUsers(data || [])
    }

    useEffect(() => {
        if (selectedUser) {
            fetchUserProfiles(selectedUser)
        }
    }, [selectedUser])

    async function fetchUserProfiles(userId: string) {
        const { data } = await supabase.from('profiles').select('id, name').eq('user_id', userId)
        setProfiles(data || [])
    }

    const handleCreate = async () => {
        if (!selectedUser) {
            toast.error("Veuillez sélectionner un utilisateur")
            return
        }

        setLoading(true)
        try {
            // Unification : On crée toujours dans digital_nfc_cards
            const nfc_link = `${window.location.origin}/p/${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;
            
            const insertData = {
                user_id: selectedUser,
                profile_id: selectedProfile || null,
                profile_name: formData.profile_name || 'Ma Carte NFC',
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
            toast.success(type === 'digital' ? "Carte numérique créée" : "Commande de carte physique créée")
            onSuccess()
        } catch (error: any) {
            console.error('Erreur creation:', error)
            toast.error(error.message || "Erreur lors de la création")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                        Créer une nouvelle carte
                    </DialogTitle>
                    <DialogDescription className="font-medium text-gray-500">
                        Ajouter une carte numérique ou physique pour un utilisateur
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Choix du type */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant={type === 'digital' ? 'default' : 'outline'}
                            onClick={() => setType('digital')}
                            className={cn("h-20 rounded-2xl flex flex-col gap-2 font-bold", type === 'digital' ? "bg-black" : "border-gray-100")}
                        >
                            <Smartphone className="w-6 h-6" />
                            Virtuel (Digital)
                        </Button>
                        <Button
                            variant={type === 'physical' ? 'default' : 'outline'}
                            onClick={() => setType('physical')}
                            className={cn("h-20 rounded-2xl flex flex-col gap-2 font-bold", type === 'physical' ? "bg-black" : "border-gray-100")}
                        >
                            <CreditCard className="w-6 h-6" />
                            Physique (PVC)
                        </Button>
                    </div>

                    {/* Sélection Utilisateur */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Utilisateur (Propriétaire)</Label>
                        <select
                            className="w-full h-12 border border-gray-100 rounded-xl px-4 font-bold bg-white focus:ring-2 focus:ring-black outline-none"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">Sélectionner un utilisateur</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    {/* Profil lié (Optionnel) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Profil Public Lié (Optionnel)</Label>
                        <select
                            className="w-full h-12 border border-gray-100 rounded-xl px-4 font-bold bg-white focus:ring-2 focus:ring-black outline-none"
                            value={selectedProfile}
                            onChange={(e) => setSelectedProfile(e.target.value)}
                        >
                            <option value="">Aucun profil lié</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Champs communs */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nom du profil sur la carte</Label>
                            <Input
                                placeholder="Ex: Jean Dupont"
                                value={formData.profile_name}
                                onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                                className="h-12 border-gray-100 rounded-xl font-bold"
                            />
                        </div>

                        {type === 'digital' && (
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">URL / Slug personnalisé</Label>
                                <Input
                                    placeholder="jean-dupont"
                                    value={formData.custom_url}
                                    onChange={(e) => setFormData({ ...formData, custom_url: e.target.value })}
                                    className="h-12 border-gray-100 rounded-xl font-bold"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Design</Label>
                                <select
                                    className="w-full h-12 border border-gray-100 rounded-xl px-4 font-bold bg-white"
                                    value={formData.design_choice}
                                    onChange={(e) => setFormData({ ...formData, design_choice: e.target.value })}
                                >
                                    <option value="design1">Classique</option>
                                    <option value="design2">Moderne</option>
                                    <option value="design3">Premium</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Couleur</Label>
                                <select
                                    className="w-full h-12 border border-gray-100 rounded-xl px-4 font-bold bg-white"
                                    value={formData.color_theme}
                                    onChange={(e) => setFormData({ ...formData, color_theme: e.target.value })}
                                >
                                    <option value="black">Noir</option>
                                    <option value="white">Blanc</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">Annuler</Button>
                    <Button
                        onClick={handleCreate}
                        disabled={loading}
                        className="bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest px-8 rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer la carte'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
