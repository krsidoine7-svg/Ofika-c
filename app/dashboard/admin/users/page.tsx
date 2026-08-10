'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Mail, Phone, Calendar, Search, Shield, User, Filter, MoreHorizontal, Loader2, Star, Trash2, Edit, Globe, Smartphone, LayoutGrid, List, Eye, Key, Lock, ChevronDown, CheckCircle2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { fetchUsersAdmin } from './actions'
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
import { AlertTriangle } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserRecord {
    id: string
    email: string
    name: string
    is_admin: boolean
    admin_role?: string
    subscription_tier: string
    created_at: string
    last_login?: string
    profileCount?: number
    cardCount?: number
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const itemsPerPage = 15
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    // États pour le reset password
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
    const [resetUser, setResetUser] = useState<UserRecord | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isResetting, setIsResetting] = useState(false)

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

    const openConfirm = (title: string, message: string, action: () => void, variant: 'default' | 'destructive' = 'default') => {
        setConfirmConfig({ title, message, action, variant })
        setIsConfirmOpen(true)
    }

    useEffect(() => {
        fetchUsers()
    }, [supabase])

    async function fetchUsers() {
        try {
            setLoading(true)
            const mergedUsers = await fetchUsersAdmin()
            setUsers(mergedUsers)
        } catch (error) {
            console.error('Erreur fetch users:', error)
            toast.error('Impossible de charger les utilisateurs')
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()))

        let matchesFilter = true
        if (filter === 'admin') matchesFilter = user.is_admin
        else if (filter === 'user') matchesFilter = !user.is_admin
        else if (filter !== 'all') matchesFilter = user.subscription_tier === filter

        return matchesSearch && matchesFilter
    })

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // Reset page quand on filtre ou cherche
    useEffect(() => {
        setCurrentPage(1)
    }, [search, filter])

    const impersonateUser = async (user: UserRecord) => {
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, action: 'start' })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Mode Mascarade activé : ${user.email}`)
                router.push('/dashboard')
            } else {
                toast.error(data.error || 'Erreur d\'usurpation')
            }
        } catch (err) {
            toast.error('Erreur technique')
        } finally {
            setIsConfirmOpen(false)
        }
    }

    const toggleAdmin = async (user: UserRecord) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    action: 'TOGGLE_ADMIN',
                    isAdmin: !user.is_admin,
                    email: user.email,
                    name: user.name
                })
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error)

            toast.success(`${user.name || user.email} ${!user.is_admin ? 'est maintenant administrateur' : "n'est plus administrateur"}`)
            setUsers(users.map(u => u.id === user.id ? { ...u, is_admin: !user.is_admin, admin_role: !user.is_admin ? 'admin' : undefined } : u))
        } catch (error: any) {
            console.error('Erreur toggle admin:', error)
            toast.error(error.message || 'Erreur lors de la modification des droits admin')
        } finally {
            setIsConfirmOpen(false)
        }
    }

    const deleteUser = async (user: UserRecord) => {
        try {
            const res = await fetch(`/api/admin/users?id=${user.id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error)

            toast.success("Utilisateur supprimé définitivement");
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la suppression");
        } finally {
            setIsConfirmOpen(false)
        }
    }

    const updatePlan = async (user: UserRecord, tier: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    action: 'UPDATE_PLAN',
                    tier,
                    previousTier: user.subscription_tier
                })
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error)

            toast.success(`Plan mis à jour : ${tier.toUpperCase()}`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || "Erreur de mise à jour");
        } finally {
            setIsConfirmOpen(false)
        }
    }

    const resetUserPassword = async () => {
        if (!resetUser || !newPassword) return

        if (newPassword !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas')
            return
        }

        try {
            setIsResetting(true)
            const res = await fetch('/api/admin/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: resetUser.id, newPassword })
            })

            const data = await res.json()
            if (data.success) {
                toast.success(`Mot de passe réinitialisé pour ${resetUser.email}`)
                setIsResetDialogOpen(false)
                setNewPassword('')
                setConfirmPassword('')
                setResetUser(null)
            } else {
                toast.error(data.error || 'Erreur lors du reset')
            }
        } catch (err) {
            toast.error('Erreur technique')
        } finally {
            setIsResetting(false)
        }
    }

    const getTierBadge = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'pro': return <Badge className="bg-blue-100 text-blue-700 border-none font-bold uppercase text-[10px]">PRO</Badge>
            case 'premium': return <Badge className="bg-purple-100 text-purple-700 border-none font-bold uppercase text-[10px]">PREMIUM</Badge>
            case 'business': return <Badge className="bg-blue-100 text-blue-700 border-none font-bold uppercase text-[10px]">BUSINESS</Badge>
            case 'entreprise': return <Badge className="bg-black text-white border-none font-bold uppercase text-[10px]">ENTREPRISE</Badge>
            case 'free': return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold uppercase text-[10px]">FREE</Badge>
            default: return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold uppercase text-[10px]">FREE</Badge>
        }
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
            {/* Header & Filters (Airtable Style) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
                <div className="flex-1 space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Utilisateurs</h1>
                    <p className="text-sm text-gray-500 font-medium">{users.length} comptes enregistrés</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-200">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 px-2.5 rounded-sm transition-all text-gray-500", viewMode === 'table' && "bg-white text-gray-900 shadow-sm")}
                            onClick={() => setViewMode('table')}
                            title="Vue Tableau"
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 px-2.5 rounded-sm transition-all text-gray-500", viewMode === 'grid' && "bg-white text-gray-900 shadow-sm")}
                            onClick={() => setViewMode('grid')}
                            title="Vue Galerie"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden h-9">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-full px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-none border-r border-gray-200 flex items-center gap-1.5"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    {filter === 'all' ? 'Filtrer' : filter.toUpperCase()}
                                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48 rounded-md shadow-lg border-gray-200 p-1">
                                <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Rôle</DropdownMenuLabel>
                                {[
                                    { value: 'all', label: 'Tous les rôles' },
                                    { value: 'admin', label: 'Administrateurs' },
                                    { value: 'user', label: 'Utilisateurs' },
                                ].map(opt => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => setFilter(opt.value)}
                                        className={cn(
                                            "flex items-center justify-between px-2 py-1.5 rounded-sm cursor-pointer text-xs",
                                            filter === opt.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        {opt.label}
                                        {filter === opt.value && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator className="my-1" />
                                <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Abonnement</DropdownMenuLabel>
                                {['free', 'pro', 'business', 'entreprise'].map(tier => (
                                    <DropdownMenuItem
                                        key={tier}
                                        onClick={() => setFilter(tier)}
                                        className={cn(
                                            "flex items-center justify-between px-2 py-1.5 rounded-sm cursor-pointer text-xs capitalize",
                                            filter === tier ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        {tier}
                                        {filter === tier && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="relative flex items-center px-2 w-full sm:w-48">
                            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <Input
                                placeholder="Rechercher..."
                                className="h-full border-none shadow-none focus-visible:ring-0 text-xs px-2"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users List Container (Airtable Style) */}
            {viewMode === 'table' ? (
                <div className="bg-white border border-gray-200 overflow-x-auto shadow-sm rounded-md">
                    <table className="w-full text-left border-collapse min-w-max text-[13px]">
                        <thead>
                            <tr className="bg-gray-50/80">
                                <th className="sticky top-0 px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50 z-10 w-64">Utilisateur</th>
                                <th className="sticky top-0 px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50 z-10 w-32">Profils / NFC</th>
                                <th className="sticky top-0 px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50 z-10 w-24">Rôle</th>
                                <th className="sticky top-0 px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50 z-10 w-24">Plan</th>
                                <th className="sticky top-0 px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50 z-10 w-32">Inscription</th>
                                <th className="sticky top-0 px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50 z-10 w-32 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-3 py-1.5 border-r border-gray-200 max-w-[250px] truncate">
                                        <div className="flex flex-col justify-center">
                                            <span className="font-semibold text-gray-900 truncate">{user.name || 'Sans Nom'}</span>
                                            <span className="text-gray-500 truncate text-[11px]">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-1.5 border-r border-gray-200 text-gray-700">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1" title="Profils / QR Codes"><Globe className="w-3 h-3 text-blue-500" /> {user.profileCount}</span>
                                            <span className="flex items-center gap-1" title="Cartes NFC"><Smartphone className="w-3 h-3 text-gray-600" /> {user.cardCount}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-1.5 border-r border-gray-200">
                                        <span className={cn(
                                            "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                            user.is_admin ? "bg-gray-900 text-white" : "bg-blue-50 text-blue-700"
                                        )}>
                                            {user.is_admin ? (user.admin_role || 'ADMIN') : 'USER'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1.5 border-r border-gray-200">
                                        <span className={cn(
                                            "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                            user.subscription_tier === 'free' ? "bg-gray-100 text-gray-600" :
                                            user.subscription_tier === 'pro' ? "bg-blue-100 text-blue-700" :
                                            user.subscription_tier === 'business' ? "bg-indigo-100 text-indigo-700" :
                                            "bg-black text-white"
                                        )}>
                                            {user.subscription_tier}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1.5 border-r border-gray-200 text-gray-500 text-xs">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-3 py-1.5">
                                        <div className="flex items-center justify-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn("h-6 w-6 p-0 rounded-sm hover:bg-gray-100", user.is_admin && "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700")}
                                                onClick={() => openConfirm(
                                                    user.is_admin ? "Retirer admin ?" : "Promouvoir admin ?",
                                                    user.is_admin ? "Cet utilisateur perdra l'accès admin." : "Il pourra gérer la plateforme.",
                                                    () => toggleAdmin(user),
                                                    user.is_admin ? 'destructive' : 'default'
                                                )}
                                                title={user.is_admin ? "Retirer droits admin" : "Promouvoir admin"}
                                            >
                                                <Shield className="w-3.5 h-3.5" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-sm hover:bg-gray-100" title="Changer Plan">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-md shadow-lg border-gray-200 p-1">
                                                    <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Plan</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="my-1"/>
                                                    {['free', 'pro', 'business', 'entreprise'].map((tier) => (
                                                        <DropdownMenuItem
                                                            key={tier}
                                                            className={cn(
                                                                "flex items-center justify-between px-2 py-1 cursor-pointer rounded-sm text-xs capitalize",
                                                                user.subscription_tier === tier ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                                                            )}
                                                            onClick={() => openConfirm("Changer l'abonnement ?", `Passer au plan ${tier.toUpperCase()} ?`, () => updatePlan(user, tier))}
                                                        >
                                                            {tier}
                                                            {user.subscription_tier === tier && <Star className="w-3 h-3 text-blue-500 fill-blue-500" />}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 rounded-sm hover:bg-gray-100"
                                                onClick={() => { setResetUser(user); setIsResetDialogOpen(true); }}
                                                title="Réinitialiser mot de passe"
                                            >
                                                <Key className="w-3.5 h-3.5" />
                                            </Button>
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 rounded-sm hover:bg-gray-100"
                                                onClick={() => openConfirm("Mascarade", `Se connecter en tant que ${user.email} ?`, () => impersonateUser(user))}
                                                title="Login As"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 rounded-sm hover:bg-red-50 text-red-500 hover:text-red-600 ml-1"
                                                onClick={() => openConfirm("Supprimer ?", "Cette action est irréversible.", () => deleteUser(user), 'destructive')}
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                                        Aucun utilisateur ne correspond à votre recherche
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                        <div key={user.id} className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow group flex flex-col relative">
                            {/* Header: Avatar + Title + Actions (...) */}
                            <div className="flex items-start justify-between p-3 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 shrink-0 rounded bg-gray-200 flex items-center justify-center text-gray-700 font-bold border border-gray-300">
                                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-bold text-gray-900 truncate" title={user.name}>{user.name || 'Sans Nom'}</p>
                                        <p className="text-[11px] text-gray-500 truncate" title={user.email}>{user.email}</p>
                                    </div>
                                </div>
                                <div className="shrink-0 ml-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm text-gray-400 hover:text-gray-900 hover:bg-gray-200">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-md shadow-xl border-gray-200 p-1">
                                            <DropdownMenuItem
                                                onClick={() => openConfirm(
                                                    user.is_admin ? "Retirer admin ?" : "Promouvoir admin ?",
                                                    user.is_admin ? "Cet utilisateur perdra l'accès admin." : "Il pourra gérer la plateforme.",
                                                    () => toggleAdmin(user),
                                                    user.is_admin ? 'destructive' : 'default'
                                                )}
                                                className={cn("text-xs cursor-pointer", user.is_admin ? "text-red-600 focus:bg-red-50" : "")}
                                            >
                                                <Shield className="w-3.5 h-3.5 mr-2" /> {user.is_admin ? "Retirer Admin" : "Promouvoir Admin"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => { setResetUser(user); setIsResetDialogOpen(true); }}
                                                className="text-xs cursor-pointer"
                                            >
                                                <Key className="w-3.5 h-3.5 mr-2" /> Réinitialiser mot de passe
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => openConfirm("Mascarade", `Se connecter en tant que ${user.email} ?`, () => impersonateUser(user))}
                                                className="text-xs cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-2" /> Se connecter (Login As)
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Changer le Plan</DropdownMenuLabel>
                                            {['free', 'pro', 'business', 'entreprise'].map((tier) => (
                                                <DropdownMenuItem
                                                    key={tier}
                                                    className={cn("text-xs capitalize cursor-pointer", user.subscription_tier === tier && "bg-blue-50 text-blue-700")}
                                                    onClick={() => openConfirm("Changer l'abonnement ?", `Passer au plan ${tier.toUpperCase()} ?`, () => updatePlan(user, tier))}
                                                >
                                                    <Star className={cn("w-3.5 h-3.5 mr-2", user.subscription_tier === tier ? "text-blue-500 fill-blue-500" : "text-gray-400")} />
                                                    {tier}
                                                </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => openConfirm("Supprimer ?", "Cette action est irréversible.", () => deleteUser(user), 'destructive')}
                                                className="text-xs cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Supprimer l'utilisateur
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            
                            {/* Data Fields */}
                            <div className="p-3 flex flex-col gap-2 flex-1">
                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-gray-500 font-medium">Rôle</span>
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                        user.is_admin ? "bg-gray-900 text-white" : "bg-blue-50 text-blue-700"
                                    )}>
                                        {user.is_admin ? (user.admin_role || 'ADMIN') : 'USER'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-gray-500 font-medium">Plan</span>
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                        user.subscription_tier === 'free' ? "bg-gray-100 text-gray-600" :
                                        user.subscription_tier === 'pro' ? "bg-blue-100 text-blue-700" :
                                        user.subscription_tier === 'business' ? "bg-indigo-100 text-indigo-700" :
                                        "bg-black text-white"
                                    )}>
                                        {user.subscription_tier}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-[12px] border-t border-gray-100 pt-2 mt-1">
                                    <span className="text-gray-500 font-medium flex items-center gap-1.5"><Globe className="w-3.5 h-3.5"/> Profils / QR</span>
                                    <span className="font-semibold text-gray-900">{user.profileCount}</span>
                                </div>

                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-gray-500 font-medium flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5"/> Cartes NFC</span>
                                    <span className="font-semibold text-gray-900">{user.cardCount}</span>
                                </div>
                                
                                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center text-[11px] text-gray-400">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center text-gray-400 text-sm bg-white border border-gray-200 rounded-md">
                            Aucun utilisateur ne correspond à votre recherche
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-500">
                        Affichage de <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> sur <span className="font-bold text-gray-900">{filteredUsers.length}</span> utilisateurs
                    </p>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs px-3 shadow-none border-gray-200 hover:bg-gray-50"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Précédent
                        </Button>
                        <div className="flex items-center px-3 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md">
                            Page {currentPage} / {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs px-3 shadow-none border-gray-200 hover:bg-gray-50"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}

            {/* Modal de Confirmation Générique */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg",
                            confirmConfig.variant === 'destructive' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-900"
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
                                confirmConfig.variant === 'destructive' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-900 hover:bg-gray-800 text-white"
                            )}
                        >
                            Confirmer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Reset Password */}
            <Dialog open={isResetDialogOpen} onOpenChange={(open) => {
                setIsResetDialogOpen(open)
                if (!open) {
                    setNewPassword('')
                    setConfirmPassword('')
                }
            }}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg bg-gray-100 text-gray-900">
                            <Lock className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-black text-gray-900 mb-2">Réinitialiser le mot de passe</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium mb-6">
                            Saisissez un nouveau mot de passe pour <span className="text-gray-900 font-black">{resetUser?.email}</span>.
                        </DialogDescription>

                        <div className="space-y-4 text-left">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nouveau Mot de Passe</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min. 6 caractères"
                                    className="rounded-xl h-12 border-gray-200 focus:ring-black"
                                    autoFocus
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Confirmer le Mot de Passe</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Saisissez à nouveau le mot de passe"
                                    className="rounded-xl h-12 border-gray-200 focus:ring-black"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex gap-3 justify-center border-t border-gray-100">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsResetDialogOpen(false)
                                setNewPassword('')
                                setConfirmPassword('')
                            }}
                            className="rounded-xl font-bold flex-1 h-12"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={resetUserPassword}
                            disabled={isResetting || newPassword.length < 6 || newPassword !== confirmPassword}
                            className="rounded-xl font-black uppercase tracking-widest flex-1 h-12 shadow-md bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            {isResetting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Mettre à jour"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-gray-900 text-white overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center font-black uppercase tracking-tight">
                            <Shield className="w-5 h-5 mr-3" />
                            Accès Rapides
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-300 font-medium">Gérez rapidement les permissions globales ou les alertes de sécurité pour l'ensemble des utilisateurs.</p>
                        <div className="flex gap-2">
                            <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-50 border-none font-bold" size="sm">Audit Log</Button>
                            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 font-bold" size="sm">Rapport Mensuel</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-600 text-white overflow-hidden group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center font-black uppercase tracking-tight">
                            <Star className="w-5 h-5 mr-3" />
                            Abonnements PRO
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-blue-100 font-medium">Consultez la liste des utilisateurs ayant un abonnement payant et gérez leurs privilèges spécifiques.</p>
                        <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 border-none font-bold" size="sm">Liste des Abonnés</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
