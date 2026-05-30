'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import {
    Megaphone,
    Plus,
    Trash2,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Info,
    Rocket,
    Loader2,
    Pencil,
    Eye,
    Search,
    Filter,
    X,
    Calendar,
    Users,
    BarChart3,
    Pin,
    Save
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Badge } from "@/components/core/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/core/ui/dialog"

interface Announcement {
    id: string
    title: string
    content: string
    type: string
    target_audience: string
    is_active: boolean
    expires_at: string | null
    created_at: string
    created_by: string | null
}

type FormState = {
    title: string
    content: string
    type: string
    target_audience: string
    expires_at: string
}

const emptyForm: FormState = {
    title: '',
    content: '',
    type: 'info',
    target_audience: 'all',
    expires_at: ''
}

const TYPE_CONFIG: Record<string, { label: string, color: string, bgColor: string, borderColor: string, icon: React.ReactNode }> = {
    info: { label: 'Information', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100', icon: <Info className="w-4 h-4" /> },
    warning: { label: 'Attention', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-100', icon: <AlertTriangle className="w-4 h-4" /> },
    success: { label: 'Nouveauté', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100', icon: <CheckCircle2 className="w-4 h-4" /> },
    promo: { label: 'Offre Pro', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-100', icon: <Rocket className="w-4 h-4" /> },
}

const AUDIENCE_LABELS: Record<string, string> = {
    all: 'Tous les utilisateurs',
    free: 'Plan Gratuit',
    pro: 'Plan Pro uniquement'
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const supabase = useMemo(() => createClient(), [])

    // Form
    const [form, setForm] = useState<FormState>(emptyForm)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    // Preview
    const [showPreview, setShowPreview] = useState(false)

    // Confirm dialog
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

    const openConfirm = (title: string, message: string, action: () => void, variant: 'default' | 'destructive' = 'default') => {
        setConfirmConfig({ title, message, action, variant })
        setIsConfirmOpen(true)
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [supabase])

    async function fetchAnnouncements() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setAnnouncements(data || [])
        } catch (error) {
            toast.error("Erreur lors du chargement des annonces")
        } finally {
            setLoading(false)
        }
    }

    // ---- Stats KPI ----
    const stats = useMemo(() => {
        const now = new Date()
        const active = announcements.filter(a => a.is_active && (!a.expires_at || new Date(a.expires_at) > now))
        const expired = announcements.filter(a => a.expires_at && new Date(a.expires_at) <= now)
        const scheduled = announcements.filter(a => a.is_active && a.expires_at && new Date(a.expires_at) > now)
        const inactive = announcements.filter(a => !a.is_active)

        return {
            total: announcements.length,
            active: active.length,
            expired: expired.length,
            inactive: inactive.length
        }
    }, [announcements])

    // ---- Filtrage ----
    const filteredAnnouncements = useMemo(() => {
        const now = new Date()
        return announcements.filter(ann => {
            // Recherche
            if (searchQuery) {
                const q = searchQuery.toLowerCase()
                if (!ann.title.toLowerCase().includes(q) && !ann.content.toLowerCase().includes(q)) {
                    return false
                }
            }
            // Filtre type
            if (filterType !== 'all' && ann.type !== filterType) return false
            // Filtre statut
            if (filterStatus === 'active' && (!ann.is_active || (ann.expires_at && new Date(ann.expires_at) <= now))) return false
            if (filterStatus === 'inactive' && ann.is_active) return false
            if (filterStatus === 'expired' && !(ann.expires_at && new Date(ann.expires_at) <= now)) return false

            return true
        })
    }, [announcements, searchQuery, filterType, filterStatus])

    // ---- Statut d'une annonce ----
    function getAnnouncementStatus(ann: Announcement): { label: string, color: string, bgColor: string } {
        const now = new Date()
        if (ann.expires_at && new Date(ann.expires_at) <= now) {
            return { label: 'Expirée', color: 'text-gray-500', bgColor: 'bg-gray-100' }
        }
        if (!ann.is_active) {
            return { label: 'Inactive', color: 'text-red-500', bgColor: 'bg-red-50' }
        }
        return { label: 'Active', color: 'text-green-600', bgColor: 'bg-green-50' }
    }

    // ---- CRUD ----
    async function handleSave() {
        if (!form.title || !form.content) {
            toast.error("Veuillez remplir le titre et le contenu")
            return
        }

        try {
            setIsSaving(true)

            const payload: any = {
                title: form.title,
                content: form.content,
                type: form.type,
                target_audience: form.target_audience,
                expires_at: form.expires_at || null
            }

            if (editingId) {
                // Mise à jour via API
                const res = await fetch('/api/admin/announcements', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, ...payload })
                })
                const result = await res.json()
                if (!result.success) throw new Error(result.error)

                toast.success("Annonce modifiée avec succès")
            } else {
                // Création via API
                const res = await fetch('/api/admin/announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                const result = await res.json()
                if (!result.success) throw new Error(result.error)

                toast.success("Annonce créée avec succès")
            }

            resetForm()
            fetchAnnouncements()
        } catch (error) {
            toast.error(editingId ? "Erreur lors de la modification" : "Erreur lors de la création")
        } finally {
            setIsSaving(false)
        }
    }

    function startEdit(ann: Announcement) {
        setForm({
            title: ann.title,
            content: ann.content,
            type: ann.type,
            target_audience: ann.target_audience,
            expires_at: ann.expires_at ? ann.expires_at.slice(0, 16) : ''
        })
        setEditingId(ann.id)
        setIsFormOpen(true)
    }

    function resetForm() {
        setForm(emptyForm)
        setEditingId(null)
        setIsFormOpen(false)
        setShowPreview(false)
    }

    async function toggleActive(id: string, currentState: boolean) {
        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !currentState })
            })
            const result = await res.json()
            if (!result.success) throw new Error(result.error)

            toast.success(currentState ? "Annonce désactivée" : "Annonce activée")
            fetchAnnouncements()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour")
        } finally {
            setIsConfirmOpen(false)
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/admin/announcements?id=${id}`, {
                method: 'DELETE'
            })
            const result = await res.json()
            if (!result.success) throw new Error(result.error)

            toast.success("Annonce supprimée")
            fetchAnnouncements()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la suppression")
        } finally {
            setIsConfirmOpen(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1 space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-orange-500" />
                        Gestion des Annonces
                    </h1>
                    <p className="text-gray-500 font-medium">Communiquez avec vos utilisateurs en temps réel.</p>
                </div>
                <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 px-6 rounded-xl shadow-md"
                    onClick={() => { resetForm(); setIsFormOpen(true) }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle annonce
                </Button>
            </div>

            {/* Stats KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500 font-medium">Total</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-green-600">{stats.active}</p>
                            <p className="text-xs text-gray-500 font-medium">Actives</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                            <X className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-red-500">{stats.inactive}</p>
                            <p className="text-xs text-gray-500 font-medium">Inactives</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-500">{stats.expired}</p>
                            <p className="text-xs text-gray-500 font-medium">Expirées</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtres */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher une annonce..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 rounded-xl border-gray-200"
                            />
                        </div>
                        <select
                            className="h-10 px-3 text-sm border border-gray-200 rounded-xl outline-none bg-white"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">Tous les types</option>
                            <option value="info">📘 Information</option>
                            <option value="warning">⚠️ Attention</option>
                            <option value="success">✅ Nouveauté</option>
                            <option value="promo">🚀 Offre Pro</option>
                        </select>
                        <select
                            className="h-10 px-3 text-sm border border-gray-200 rounded-xl outline-none bg-white"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">🟢 Actives</option>
                            <option value="inactive">🔴 Inactives</option>
                            <option value="expired">⏰ Expirées</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des annonces */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : filteredAnnouncements.length === 0 ? (
                    <Card className="border-dashed border-2 border-gray-100 shadow-none py-16">
                        <div className="text-center space-y-3">
                            <Megaphone className="w-12 h-12 text-gray-200 mx-auto" />
                            <p className="text-gray-400 font-medium italic">
                                {announcements.length === 0 ? "Aucune annonce créée." : "Aucune annonce ne correspond aux filtres."}
                            </p>
                            {announcements.length === 0 && (
                                <Button
                                    variant="outline"
                                    className="mt-2 rounded-xl"
                                    onClick={() => { resetForm(); setIsFormOpen(true) }}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Créer la première annonce
                                </Button>
                            )}
                        </div>
                    </Card>
                ) : (
                    filteredAnnouncements.map((ann) => {
                        const status = getAnnouncementStatus(ann)
                        const typeConf = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info

                        return (
                            <Card key={ann.id} className={cn(
                                "border-none shadow-sm transition-all hover:shadow-md",
                                !ann.is_active && "opacity-60 bg-gray-50/50"
                            )}>
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={cn("p-3 rounded-2xl border flex-shrink-0", typeConf.bgColor, typeConf.borderColor)}>
                                            <div className={typeConf.color}>
                                                {ann.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                                    ann.type === 'promo' ? <Rocket className="w-5 h-5" /> :
                                                        ann.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                                            <Info className="w-5 h-5" />}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 truncate">{ann.title}</h3>
                                                    <p className="text-sm text-gray-500 leading-relaxed mt-1 line-clamp-2">{ann.content}</p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <Badge className={cn("text-[10px] uppercase font-bold px-2 py-0.5", status.bgColor, status.color, "border-0")}>
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Metadata row */}
                                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                                <span className="text-[11px] flex items-center text-gray-400 font-medium">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {format(new Date(ann.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                                                </span>
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-400 px-2 py-0 h-5">
                                                    <Users className="w-3 h-3 mr-1" />
                                                    {AUDIENCE_LABELS[ann.target_audience] || ann.target_audience}
                                                </Badge>
                                                <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-2 py-0 h-5", typeConf.color)}>
                                                    {typeConf.label}
                                                </Badge>
                                                {ann.expires_at && (
                                                    <span className="text-[11px] flex items-center text-gray-400 font-medium">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        Expire le {format(new Date(ann.expires_at), "d MMM yyyy", { locale: fr })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold"
                                                    onClick={() => startEdit(ann)}
                                                >
                                                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                                    Modifier
                                                </Button>
                                                <button
                                                    onClick={() => openConfirm(
                                                        ann.is_active ? "Désactiver l'annonce ?" : "Activer l'annonce ?",
                                                        ann.is_active
                                                            ? "L'annonce ne sera plus visible par les utilisateurs."
                                                            : "L'annonce sera instantanément visible par l'audience cible.",
                                                        () => toggleActive(ann.id, ann.is_active)
                                                    )}
                                                    className={cn(
                                                        "h-8 px-3 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors",
                                                        ann.is_active
                                                            ? "text-yellow-600 hover:bg-yellow-50"
                                                            : "text-green-600 hover:bg-green-50"
                                                    )}
                                                >
                                                    {ann.is_active ? (
                                                        <><X className="w-3.5 h-3.5" /> Désactiver</>
                                                    ) : (
                                                        <><CheckCircle2 className="w-3.5 h-3.5" /> Activer</>
                                                    )}
                                                </button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold ml-auto"
                                                    onClick={() => openConfirm(
                                                        "Supprimer cette annonce ?",
                                                        "Cette action supprimera définitivement l'annonce. Cette action est irréversible.",
                                                        () => handleDelete(ann.id),
                                                        'destructive'
                                                    )}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* ===== Dialog Création / Édition ===== */}
            <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm() }}>
                <DialogContent className="sm:max-w-[560px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="p-6 space-y-5">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                                {editingId ? <Pencil className="w-5 h-5 text-orange-500" /> : <Plus className="w-5 h-5 text-orange-500" />}
                                {editingId ? "Modifier l'annonce" : "Nouvelle annonce"}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500">
                                {editingId ? "Modifiez les informations de l'annonce." : "Créez un message qui s'affichera sur le dashboard de vos utilisateurs."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Titre */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Titre *</label>
                                <Input
                                    placeholder="ex: Maintenance prévue ce soir"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Contenu */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Contenu *</label>
                                <textarea
                                    className="w-full min-h-[100px] p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                                    placeholder="Message détaillé pour vos utilisateurs..."
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                />
                            </div>

                            {/* Type + Audience */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Type</label>
                                    <select
                                        className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl outline-none"
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="info">📘 Information</option>
                                        <option value="warning">⚠️ Attention</option>
                                        <option value="success">✅ Nouveauté</option>
                                        <option value="promo">🚀 Offre Pro</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Audience</label>
                                    <select
                                        className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl outline-none"
                                        value={form.target_audience}
                                        onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                                    >
                                        <option value="all">👥 Tous les utilisateurs</option>
                                        <option value="free">🆓 Plan Gratuit</option>
                                        <option value="pro">⭐ Pro uniquement</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date d'expiration */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Date d'expiration
                                    <span className="text-xs font-normal text-gray-400">(optionnel)</span>
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={form.expires_at}
                                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                    className="rounded-xl"
                                />
                                <p className="text-xs text-gray-400">L'annonce disparaîtra automatiquement à cette date.</p>
                            </div>

                            {/* Prévisualisation */}
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1.5 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    {showPreview ? "Masquer la prévisualisation" : "Prévisualiser"}
                                </button>

                                {showPreview && form.title && (
                                    <div className={cn(
                                        "relative overflow-hidden p-4 rounded-2xl border flex items-start gap-4 shadow-sm",
                                        TYPE_CONFIG[form.type]?.bgColor || 'bg-blue-50',
                                        TYPE_CONFIG[form.type]?.borderColor || 'border-blue-100',
                                    )}>
                                        <div className={cn("flex-shrink-0 mt-0.5", TYPE_CONFIG[form.type]?.color || 'text-blue-600')}>
                                            {form.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                                form.type === 'promo' ? <Rocket className="w-5 h-5" /> :
                                                    form.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                                        <Info className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 pr-6">
                                            <h4 className={cn("text-sm font-bold leading-tight", TYPE_CONFIG[form.type]?.color?.replace('text-', 'text-') || 'text-blue-800')}>
                                                {form.title}
                                            </h4>
                                            {form.content && (
                                                <p className="text-xs mt-1 opacity-90 leading-relaxed">{form.content}</p>
                                            )}
                                        </div>
                                        <div className="absolute top-3 right-3 p-1 bg-black/5 rounded-full">
                                            <X className="w-3 h-3 text-gray-500" />
                                        </div>
                                    </div>
                                )}

                                {showPreview && !form.title && (
                                    <p className="text-xs text-gray-400 italic">Remplissez le titre pour voir la prévisualisation.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="bg-gray-50 p-4 flex gap-3 justify-end border-t border-gray-100">
                        <Button
                            variant="ghost"
                            onClick={resetForm}
                            className="rounded-xl font-bold h-11"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !form.title || !form.content}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 px-6 rounded-xl shadow-md"
                        >
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enregistrement...</>
                            ) : editingId ? (
                                <><Save className="w-4 h-4 mr-2" /> Enregistrer</>
                            ) : (
                                <><Plus className="w-4 h-4 mr-2" /> Publier l'annonce</>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ===== Dialog Confirmation ===== */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg",
                            confirmConfig.variant === 'destructive' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                        )}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-black text-gray-900 mb-2">{confirmConfig.title}</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium leading-relaxed">
                            {confirmConfig.message}
                        </DialogDescription>
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
                                confirmConfig.variant === 'destructive' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"
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
