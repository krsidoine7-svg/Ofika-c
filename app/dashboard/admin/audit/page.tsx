'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import {
    History,
    Search,
    Filter,
    Loader2,
    User,
    Eye,
    Clock,
    ShieldAlert,
    MousePointerClick,
    ExternalLink,
    AlertCircle
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { Badge } from "@/components/core/ui/badge"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/core/ui/dialog"
import { cn } from "@/lib/utils"

interface AuditLog {
    id: string
    admin_id: string
    action: string
    target_type: string
    target_id: string
    details: any
    created_at: string
    admin_email?: string
}

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        fetchLogs()
    }, [supabase])

    async function fetchLogs() {
        try {
            setLoading(true)

            // 1. Récupérer les logs
            const { data, error } = await supabase
                .from('admin_audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) throw error

            // 2. Enrichir avec les emails des admins
            const adminIds = Array.from(new Set((data || []).map(l => l.admin_id)))
            if (adminIds.length > 0) {
                const { data: adminData } = await supabase
                    .from('users')
                    .select('id, email')
                    .in('id', adminIds)

                const adminMap = new Map(adminData?.map(a => [a.id, a.email]))

                const enrichedLogs = (data || []).map(log => ({
                    ...log,
                    admin_email: adminMap.get(log.admin_id) || 'Système'
                }))
                setLogs(enrichedLogs)
            } else {
                setLogs(data || [])
            }

        } catch (error) {
            console.error('Erreur fetch audit logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log => {
        const matchesSearch = (
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.admin_email?.toLowerCase().includes(search.toLowerCase()) ||
            log.target_id?.toLowerCase().includes(search.toLowerCase())
        )
        const matchesType = typeFilter === 'all' || log.target_type === typeFilter
        return matchesSearch && matchesType
    })

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'IMPERSONATION_START':
                return <Badge className="bg-purple-100 text-purple-700 border-none font-bold text-[10px] uppercase">Mascarade ON</Badge>
            case 'IMPERSONATION_STOP':
                return <Badge className="bg-gray-100 text-gray-700 border-none font-bold text-[10px] uppercase">Mascarade OFF</Badge>
            case 'USER_ROLE_UPDATE':
                return <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px] uppercase">Rôle Modifié</Badge>
            case 'ORDER_STATUS_UPDATE':
                return <Badge className="bg-green-100 text-green-700 border-none font-bold text-[10px] uppercase">Commande</Badge>
            default:
                return <Badge className="bg-orange-100 text-orange-700 border-none font-bold text-[10px] uppercase">{action.replace('_', ' ')}</Badge>
        }
    }

    const getTargetIcon = (type: string) => {
        switch (type) {
            case 'user': return <User className="w-4 h-4" />
            case 'order': return <ExternalLink className="w-4 h-4" />
            default: return <ShieldAlert className="w-4 h-4" />
        }
    }

    // États pour le dialogue de détails
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <History className="w-8 h-8 text-orange-500" />
                        Journal d'Audit
                    </h1>
                    <p className="text-gray-500 font-medium">Traçabilité des actions administratives et sécurité.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher action, admin..."
                            className="pl-10 h-11 border-gray-200 focus:ring-orange-500 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-11 px-4 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:ring-orange-500 outline-none w-full sm:w-auto shadow-sm"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">Tous les types</option>
                        <option value="user">Utilisateurs</option>
                        <option value="order">Commandes</option>
                        <option value="nfc_card">NFC</option>
                        <option value="profile">Profils</option>
                        <option value="system">Système</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : (
                <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Heure</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Administrateur</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Cible</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Détails</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 leading-none">
                                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                                                </span>
                                                <span className="text-[10px] text-gray-400 mt-1 font-medium">
                                                    {new Date(log.created_at).toLocaleString('fr-FR')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                                                    <MousePointerClick className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{log.admin_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="text-gray-400">
                                                    {getTargetIcon(log.target_type)}
                                                </div>
                                                <code className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-500 font-mono">
                                                    {log.target_id || 'Global'}
                                                </code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                                                onClick={() => {
                                                    setSelectedLog(log)
                                                    setIsDetailsOpen(true)
                                                }}
                                            >
                                                Détails Action
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                            <p className="text-gray-400 font-medium italic">Aucun log d'audit trouvé pour cette recherche.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Modal de Détails */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <History className="w-5 h-5 text-orange-500" />
                            Détails de l'action
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Action exécutée par {selectedLog?.admin_email}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Action</p>
                                <p className="font-bold text-gray-900">{selectedLog?.action.replace('_', ' ')}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cible</p>
                                <p className="font-bold text-gray-900 uppercase">{selectedLog?.target_type}</p>
                            </div>
                        </div>

                        <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Informations Supplémentaires</p>
                            <div className="space-y-3">
                                {selectedLog?.details ? (
                                    Object.entries(selectedLog.details).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-start border-b border-orange-100/30 pb-2 last:border-0 last:pb-0">
                                            <span className="text-xs font-bold text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                                            <span className="text-xs font-black text-gray-900 text-right max-w-[200px] break-words">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Aucun détail supplémentaire disponible.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400 px-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {selectedLog && new Date(selectedLog.created_at).toLocaleString('fr-FR')}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 flex justify-end border-t border-gray-100">
                        <Button
                            onClick={() => setIsDetailsOpen(false)}
                            className="bg-gray-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8"
                        >
                            Fermer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
