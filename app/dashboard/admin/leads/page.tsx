'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import {
    Search,
    Download,
    Loader2,
    Mail,
    Phone,
    User,
    Building,
    Trash2,
    Eye,
    RotateCw,
    ExternalLink,
    MessageSquare,
    Briefcase,
    ArrowUpRight,
    Users,
    Sparkles,
    Calendar,
    Copy,
    Check,
    AlertTriangle,
    Inbox
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import Link from 'next/link'

interface Lead {
    id: string
    created_at: string
    profile_id: string
    name: string
    email?: string | null
    phone?: string | null
    company?: string | null
    job_title?: string | null
    message?: string | null
    profiles?: {
        id?: string
        name?: string
        username?: string
    } | null
}

type FilterTab = 'all' | 'with_phone' | 'with_company' | 'with_message'

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastSyncTime, setLastSyncTime] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    // Dialogue de confirmation minimaliste
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string
        message: string
        action: () => Promise<void> | void
        variant: 'default' | 'destructive'
        confirmLabel?: string
    }>({
        title: '',
        message: '',
        action: () => {},
        variant: 'default',
        confirmLabel: 'Confirmer'
    })

    const supabase = useMemo(() => createClient(), [])

    const fetchLeads = useCallback(async (isManual = false) => {
        try {
            if (isManual) setIsRefreshing(true)
            else setLoading(true)

            const res = await fetch('/api/admin/leads')
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Erreur lors du chargement des leads')
            }

            setLeads(json.leads || [])
            const now = new Date()
            setLastSyncTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

            if (isManual) {
                toast.success('Liste des contacts actualisée')
            }
        } catch (err: any) {
            console.error('Erreur fetch leads:', err)
            toast.error(err?.message || "Impossible de charger les leads")
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchLeads()

        // Abonnement temps réel Supabase
        const channel = supabase
            .channel('admin-leads-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'captured_contacts' },
                () => {
                    fetchLeads()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchLeads, supabase])

    // KPIs calculés
    const stats = useMemo(() => {
        const totalCount = leads.length
        const withPhoneCount = leads.filter(l => Boolean(l.phone)).length
        const withCompanyCount = leads.filter(l => Boolean(l.company)).length
        const withMessageCount = leads.filter(l => Boolean(l.message)).length

        // Nombre de profils uniques ayant capturé au moins un lead
        const uniqueProfilesCount = new Set(leads.map(l => l.profile_id).filter(Boolean)).size

        return {
            totalCount,
            withPhoneCount,
            withCompanyCount,
            withMessageCount,
            uniqueProfilesCount
        }
    }, [leads])

    // Filtrage dynamique
    const filteredLeads = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return leads.filter(lead => {
            const matchesQuery = !query || (
                (lead.name || '').toLowerCase().includes(query) ||
                (lead.email || '').toLowerCase().includes(query) ||
                (lead.phone || '').toLowerCase().includes(query) ||
                (lead.company || '').toLowerCase().includes(query) ||
                (lead.job_title || '').toLowerCase().includes(query) ||
                (lead.profiles?.username || '').toLowerCase().includes(query) ||
                (lead.profiles?.name || '').toLowerCase().includes(query)
            )

            if (!matchesQuery) return false

            switch (activeTab) {
                case 'with_phone':
                    return Boolean(lead.phone)
                case 'with_company':
                    return Boolean(lead.company)
                case 'with_message':
                    return Boolean(lead.message)
                case 'all':
                default:
                    return true
            }
        })
    }, [leads, searchQuery, activeTab])

    const deleteLead = async (leadId: string) => {
        try {
            setIsConfirmOpen(false)
            const res = await fetch(`/api/admin/leads?id=${leadId}`, {
                method: 'DELETE'
            })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.error || 'Erreur lors de la suppression')

            toast.success('Contact supprimé avec succès')
            setLeads(prev => prev.filter(l => l.id !== leadId))
            if (selectedLead && selectedLead.id === leadId) {
                setIsDetailsOpen(false)
                setSelectedLead(null)
            }
        } catch (error: any) {
            console.error('Erreur suppression lead:', error)
            toast.error(error?.message || 'Erreur lors de la suppression')
        }
    }

    const openConfirm = (
        title: string,
        message: string,
        action: () => Promise<void> | void,
        variant: 'default' | 'destructive' = 'default',
        confirmLabel = 'Confirmer'
    ) => {
        setConfirmConfig({ title, message, action, variant, confirmLabel })
        setIsConfirmOpen(true)
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        toast.success(`Copié : ${text}`)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const exportToCSV = () => {
        if (leads.length === 0) {
            toast.error('Aucun lead à exporter')
            return
        }

        const headers = ["Date", "Nom", "Email", "Telephone", "Entreprise", "Fonction", "Profil Source", "Message"]
        const rows = filteredLeads.map(lead => [
            `"${new Date(lead.created_at).toLocaleDateString('fr-FR')}"`,
            `"${lead.name || ''}"`,
            `"${lead.email || ''}"`,
            `"${lead.phone || ''}"`,
            `"${lead.company || ''}"`,
            `"${lead.job_title || ''}"`,
            `"${lead.profiles?.name || lead.profiles?.username || lead.profile_id || ''}"`,
            `"${(lead.message || '').replace(/"/g, '""')}"`
        ])

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `ofika-leads-${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Export CSV généré')
    }

    return (
        <div className="space-y-6 bg-white pb-16">
            {/* 1. Header Exécutif */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
                            Centrale des Leads & Réseau B2B
                        </h1>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            En direct
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Tous les contacts d'affaires et opportunités capturés par vos utilisateurs via leurs cartes NFC et profils Ofika.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {lastSyncTime && (
                        <span className="text-[11px] text-gray-400 font-mono hidden sm:inline-block">
                            Synchro {lastSyncTime}
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchLeads(true)}
                        disabled={isRefreshing}
                        className="h-8 text-xs font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg gap-1.5"
                    >
                        <RotateCw className={cn("w-3.5 h-3.5 text-gray-400", isRefreshing && "animate-spin text-gray-900")} />
                        <span>Actualiser</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="h-8 text-xs font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5 text-gray-400" />
                        <span>Export CSV</span>
                    </Button>
                </div>
            </div>

            {/* 2. Bandeau 4 KPIs Exécutives */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Contacts Capturés</span>
                        <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-gray-950 font-mono tabular-nums">
                            {stats.totalCount}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">au total</span>
                    </div>
                </Card>

                <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Avec Téléphone</span>
                        <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-gray-950 font-mono tabular-nums">
                            {stats.withPhoneCount}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">joignables</span>
                    </div>
                </Card>

                <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Entreprises Identifiées</span>
                        <Building className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-gray-950 font-mono tabular-nums">
                            {stats.withCompanyCount}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">profils B2B</span>
                    </div>
                </Card>

                <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Profils Générateurs</span>
                        <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-gray-950 font-mono tabular-nums">
                            {stats.uniqueProfilesCount}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">cartes actives</span>
                    </div>
                </Card>
            </div>

            {/* 3. Onglets de filtrage & Recherche */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                    {[
                        { id: 'all' as FilterTab, label: 'Tous', count: stats.totalCount },
                        { id: 'with_phone' as FilterTab, label: 'Avec Téléphone', count: stats.withPhoneCount },
                        { id: 'with_company' as FilterTab, label: 'B2B / Entreprise', count: stats.withCompanyCount },
                        { id: 'with_message' as FilterTab, label: 'Avec Message', count: stats.withMessageCount }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-gray-950 text-white shadow-xs"
                                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-100/70"
                            )}
                        >
                            <span>{tab.label}</span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                                activeTab === tab.id
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-100 text-gray-600"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Rechercher contact, entreprise, source..."
                        className="pl-9 h-9 border-gray-200 bg-white rounded-lg text-xs text-gray-900 focus-visible:ring-1 focus-visible:ring-gray-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* 4. Tableau Haute Densité Linear / Stripe */}
            <Card className="border border-gray-100 shadow-none overflow-hidden rounded-xl bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        Contact & Date
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        Coordonnées
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        Entreprise & Poste
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        Profil Source
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        Message
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                                <p className="text-xs text-gray-400 font-medium">Chargement des leads...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead) => {
                                        const initials = (lead.name || 'Cl')
                                            .split(' ')
                                            .map(s => s[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()

                                        return (
                                            <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors group">
                                                {/* Contact & Date */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center shrink-0 border border-gray-200/60">
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0 max-w-[180px]">
                                                            <p className="text-xs font-bold text-gray-900 truncate">
                                                                {lead.name}
                                                            </p>
                                                            <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Coordonnées */}
                                                <td className="px-4 py-3">
                                                    <div className="space-y-1">
                                                        {lead.email ? (
                                                            <a
                                                                href={`mailto:${lead.email}`}
                                                                className="text-xs text-gray-600 hover:text-gray-950 flex items-center gap-1.5 truncate max-w-[200px]"
                                                                title="Envoyer un email"
                                                            >
                                                                <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                                                <span className="truncate">{lead.email}</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-[11px] text-gray-400 italic">Sans email</span>
                                                        )}

                                                        {lead.phone ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <a
                                                                    href={`tel:${lead.phone}`}
                                                                    className="text-[11px] font-mono text-gray-600 hover:text-gray-950 flex items-center gap-1"
                                                                >
                                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                                    <span>{lead.phone}</span>
                                                                </a>
                                                                <a
                                                                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[10px] font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60"
                                                                    title="Ouvrir dans WhatsApp"
                                                                >
                                                                    WA
                                                                </a>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </td>

                                                {/* Entreprise & Poste */}
                                                <td className="px-4 py-3">
                                                    {lead.company ? (
                                                        <div>
                                                            <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900">
                                                                <Building className="w-3 h-3 text-gray-400 shrink-0" />
                                                                <span className="truncate max-w-[160px]">{lead.company}</span>
                                                            </div>
                                                            {lead.job_title && (
                                                                <p className="text-[11px] text-gray-400 truncate max-w-[160px]">
                                                                    {lead.job_title}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : lead.job_title ? (
                                                        <span className="text-xs text-gray-600 truncate max-w-[160px] block">
                                                            {lead.job_title}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400 italic">Non renseigné</span>
                                                    )}
                                                </td>

                                                {/* Profil Source */}
                                                <td className="px-4 py-3">
                                                    {lead.profiles?.username ? (
                                                        <Link
                                                            href={`/${lead.profiles.username}`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-950 bg-gray-50 hover:bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/60 transition-colors"
                                                        >
                                                            <span>@{lead.profiles.username}</span>
                                                            <ExternalLink className="w-3 h-3 text-gray-400" />
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[11px] font-mono text-gray-400">
                                                            {lead.profile_id ? lead.profile_id.slice(0, 8) : 'N/A'}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Message */}
                                                <td className="px-4 py-3">
                                                    {lead.message ? (
                                                        <p className="text-xs text-gray-600 line-clamp-1 max-w-[200px]" title={lead.message}>
                                                            "{lead.message}"
                                                        </p>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-300">-</span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => { setSelectedLead(lead); setIsDetailsOpen(true); }}
                                                            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                                            title="Consulter la fiche"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openConfirm(
                                                                "Supprimer ce contact ?",
                                                                `Êtes-vous sûr de vouloir supprimer le contact "${lead.name}" de la centrale des leads ?`,
                                                                () => deleteLead(lead.id),
                                                                'destructive',
                                                                'Supprimer'
                                                            )}
                                                            className="h-7 w-7 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                            title="Supprimer"
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
                                        <td colSpan={6} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-2 border border-gray-100">
                                                    <Inbox className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs font-semibold text-gray-900">Aucun contact trouvé</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {searchQuery ? "Aucun contact ne correspond à votre recherche." : "Aucun lead capturé pour l'instant dans cette section."}
                                                </p>
                                                {searchQuery && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSearchQuery('')}
                                                        className="mt-3 text-xs text-gray-700 hover:text-gray-950 font-medium"
                                                    >
                                                        Effacer la recherche
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* 5. Fiche Détaillée Lead (Linear Style Dialog) */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl border border-gray-200 bg-white shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-5 border-b border-gray-100 bg-white">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-base font-bold text-gray-950 flex items-center gap-2">
                                <span>{selectedLead?.name}</span>
                                {selectedLead?.company && (
                                    <span className="text-xs font-normal text-gray-500">
                                        ({selectedLead.company})
                                    </span>
                                )}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-gray-400 mt-1">
                            Contact capturé le {selectedLead ? new Date(selectedLead.created_at).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : ''}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLead && (
                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Coordonnées directes */}
                            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 space-y-2.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                    Moyens de Contact Direct
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    {selectedLead.email ? (
                                        <div className="bg-white p-2.5 rounded-lg border border-gray-100 space-y-1">
                                            <span className="text-[10px] text-gray-400 font-semibold block">Email</span>
                                            <a
                                                href={`mailto:${selectedLead.email}`}
                                                className="text-gray-900 font-medium hover:underline block truncate"
                                            >
                                                {selectedLead.email}
                                            </a>
                                        </div>
                                    ) : null}

                                    {selectedLead.phone ? (
                                        <div className="bg-white p-2.5 rounded-lg border border-gray-100 space-y-1">
                                            <span className="text-[10px] text-gray-400 font-semibold block">Téléphone</span>
                                            <div className="flex items-center justify-between gap-1">
                                                <a
                                                    href={`tel:${selectedLead.phone}`}
                                                    className="font-mono font-medium text-gray-900 hover:underline"
                                                >
                                                    {selectedLead.phone}
                                                </a>
                                                <a
                                                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60"
                                                >
                                                    WhatsApp
                                                </a>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* Entreprise & Poste */}
                            {(selectedLead.company || selectedLead.job_title) && (
                                <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                        Informations Professionnelles
                                    </span>
                                    <p className="font-semibold text-gray-900">
                                        {selectedLead.company || 'Entreprise non spécifiée'}
                                    </p>
                                    {selectedLead.job_title && (
                                        <p className="text-[11px] text-gray-500">
                                            Poste : {selectedLead.job_title}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Message laissé */}
                            {selectedLead.message && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3 text-gray-500" />
                                        Message Laissé par le Contact
                                    </span>
                                    <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed italic">
                                        "{selectedLead.message}"
                                    </div>
                                </div>
                            )}

                            {/* Profil Source */}
                            <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                        Carte & Profil Ofika Source
                                    </span>
                                    <p className="font-semibold text-gray-900 mt-0.5">
                                        {selectedLead.profiles?.name || 'Profil Membre'}
                                    </p>
                                </div>

                                {selectedLead.profiles?.username && (
                                    <Link
                                        href={`/${selectedLead.profiles.username}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-900 bg-white hover:bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs"
                                    >
                                        <span>@{selectedLead.profiles.username}</span>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 flex sm:justify-between items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (!selectedLead) return
                                const idToDelete = selectedLead.id
                                openConfirm(
                                    "Supprimer ce contact ?",
                                    `Supprimer définitivement la fiche de "${selectedLead.name}" ?`,
                                    () => deleteLead(idToDelete),
                                    'destructive',
                                    'Supprimer'
                                )
                            }}
                            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-3 rounded-lg"
                        >
                            Supprimer la fiche
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => setIsDetailsOpen(false)}
                            className="bg-gray-950 hover:bg-black text-white text-xs font-medium rounded-lg h-8 px-4"
                        >
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 6. Dialogue de confirmation minimaliste */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl border border-gray-200 bg-white shadow-xl p-5">
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                            confirmConfig.variant === 'destructive' ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-900"
                        )}>
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-sm font-bold text-gray-950">
                                {confirmConfig.title || 'Confirmation requise'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500 leading-relaxed">
                                {confirmConfig.message || 'Veuillez confirmer cette opération.'}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsConfirmOpen(false)}
                            className="h-8 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg"
                        >
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            onClick={confirmConfig.action}
                            className={cn(
                                "h-8 text-xs font-medium rounded-lg px-3 text-white shadow-xs",
                                confirmConfig.variant === 'destructive'
                                    ? "bg-rose-600 hover:bg-rose-700"
                                    : "bg-gray-950 hover:bg-black"
                            )}
                        >
                            {confirmConfig.confirmLabel || 'Confirmer'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
