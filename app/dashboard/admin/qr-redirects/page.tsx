'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Link2, Search, Loader2, Edit3, Trash2, ExternalLink, RefreshCw, BarChart } from "lucide-react"
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

interface QRRedirect {
    id: string
    user_id: string
    short_code: string
    nfc_link: string
    redirect_type: string
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

export default function AdminQRRedirectsPage() {
    const [redirects, setRedirects] = useState<QRRedirect[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    
    // Edit state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingRedirect, setEditingRedirect] = useState<QRRedirect | null>(null)
    const [editUrl, setEditUrl] = useState('')
    const [editShortCode, setEditShortCode] = useState('')
    const [editIsActive, setEditIsActive] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)

    // Delete state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [redirectToDelete, setRedirectToDelete] = useState<QRRedirect | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchRedirects()
    }, [])

    const fetchRedirects = async () => {
        try {
            setLoading(true)
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
            setLoading(false)
        }
    }

    const handleEditClick = (redirect: QRRedirect) => {
        setEditingRedirect(redirect)
        setEditUrl(redirect.nfc_link)
        setEditShortCode(redirect.short_code)
        setEditIsActive(redirect.is_active)
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async () => {
        if (!editingRedirect || !editUrl) return

        try {
            setIsUpdating(true)
            const res = await fetch(`/api/admin/qr-redirects/${editingRedirect.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nfc_link: editUrl,
                    short_code: editShortCode,
                    is_active: editIsActive
                })
            })

            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || "Erreur de mise à jour")

            toast.success("Redirection mise à jour avec succès")
            setIsEditDialogOpen(false)
            fetchRedirects()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteClick = (redirect: QRRedirect) => {
        setRedirectToDelete(redirect)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (!redirectToDelete) return

        try {
            setIsDeleting(true)
            const res = await fetch(`/api/admin/qr-redirects/${redirectToDelete.id}`, {
                method: 'DELETE'
            })

            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || "Erreur lors de la suppression")

            toast.success("Redirection supprimée")
            setIsConfirmOpen(false)
            fetchRedirects()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la suppression")
        } finally {
            setIsDeleting(false)
        }
    }

    const filteredRedirects = redirects.filter(r => 
        r.short_code.toLowerCase().includes(search.toLowerCase()) ||
        r.nfc_link.toLowerCase().includes(search.toLowerCase()) ||
        (r.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.user?.email || '').toLowerCase().includes(search.toLowerCase())
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
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Redirections QR</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Gérer les liens courts et destinations des cartes NFC et QR Codes.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={fetchRedirects}
                        variant="outline"
                        className="font-bold border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                <Link2 className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{redirects.length}</p>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Liens courts actifs</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <BarChart className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900">
                            {redirects.reduce((acc, curr) => acc + (curr.scan_count || 0), 0)}
                        </p>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Scans totaux</p>
                    </CardContent>
                </Card>
            </div>

            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Rechercher par utilisateur, lien court ou URL..."
                    className="pl-10 h-12 border-none shadow-sm focus:ring-2 focus:ring-gray-900 rounded-2xl bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Card className="border-none shadow-sm overflow-hidden rounded-3xl bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center w-16">Statut</th>
                                    <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Utilisateur</th>
                                    <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest min-w-[300px]">Lien à graver (Lien Dynamique) ➡️ Destination</th>
                                    <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Type</th>
                                    <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Scans</th>
                                    <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredRedirects.length > 0 ? filteredRedirects.map((redirect) => (
                                    <tr key={redirect.id} className="hover:bg-gray-50/80 transition-all group">
                                        <td className="px-6 py-4 text-center">
                                            <div className={cn(
                                                "w-3 h-3 rounded-full mx-auto",
                                                redirect.is_active ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-red-500"
                                            )} title={redirect.is_active ? "Actif" : "Désactivé"} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm">{redirect.user?.name || 'Inconnu'}</div>
                                            <div className="text-xs text-gray-500">{redirect.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 max-w-[400px]">
                                                <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-lg border border-gray-100">
                                                    <span className="font-mono text-[11px] font-bold text-gray-700 select-all flex-1">
                                                        {`${getBaseUrl()}/qr/${redirect.short_code}`}
                                                    </span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-6 w-6 p-0 hover:bg-white text-gray-400 hover:text-gray-900 shadow-sm"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`${getBaseUrl()}/qr/${redirect.short_code}`)
                                                            toast.success('Lien dynamique copié ! C\'est ce lien qu\'il faut graver sur la carte NFC.')
                                                        }}
                                                    >
                                                        <Link2 className="w-3 h-3" />
                                                    </Button>
                                                    <a href={`${getBaseUrl()}/qr/${redirect.short_code}`} target="_blank" rel="noreferrer" className="flex items-center justify-center h-6 w-6 rounded-md hover:bg-white text-gray-400 hover:text-gray-900 transition-colors shadow-sm">
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400">Pointe vers :</span>
                                                    <a href={redirect.nfc_link} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate">
                                                        {redirect.nfc_link}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant="secondary" className="bg-purple-50 text-purple-600 border-none uppercase text-[10px] tracking-widest">
                                                {redirect.redirect_type || 'NFC'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-gray-600">
                                            {redirect.scan_count || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleEditClick(redirect)}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteClick(redirect)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500">
                                            Aucun lien court trouvé
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal d'édition */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-gray-900">Modifier le Lien Court</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            ID : <span className="font-mono bg-gray-100 px-1 rounded text-[10px]">{editingRedirect?.id}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-gray-500">Slug (Code court)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-mono">/qr/</span>
                                <Input
                                    value={editShortCode}
                                    onChange={(e) => setEditShortCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                                    placeholder="ex: ma-carte"
                                    className="h-12 rounded-xl bg-gray-50 focus:bg-white font-mono font-bold"
                                />
                            </div>
                            <p className="text-[10px] text-amber-600 font-medium">⚠️ Modifier le slug changera l'URL physique. Le QR déjà imprimé pourrait ne plus fonctionner s'il n'est pas dynamique.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-gray-500">URL de destination</Label>
                            <Input
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                placeholder="https://..."
                                className="h-12 rounded-xl bg-gray-50 focus:bg-white"
                            />
                        </div>
                        
                        <div className="flex items-center justify-between border border-gray-100 p-4 rounded-xl">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-gray-900">Statut du lien</Label>
                                <p className="text-xs text-gray-500">Si désactivé, la redirection échouera.</p>
                            </div>
                            <Switch
                                checked={editIsActive}
                                onCheckedChange={setEditIsActive}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl border-gray-200" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
                            Annuler
                        </Button>
                        <Button className="rounded-xl bg-black text-white hover:bg-gray-800" onClick={handleUpdate} disabled={isUpdating}>
                            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de suppression */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-red-600">Supprimer le lien court ?</DialogTitle>
                        <DialogDescription className="text-gray-600 mt-2">
                            Attention ! Si vous supprimez ce lien court, la carte NFC de l'utilisateur qui l'a gravé physiquement ne fonctionnera plus du tout. Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="outline" className="rounded-xl border-gray-200" onClick={() => setIsConfirmOpen(false)} disabled={isDeleting}>Annuler</Button>
                        <Button className="rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Confirmer la suppression
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
