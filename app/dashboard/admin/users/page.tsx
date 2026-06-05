'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Mail, Phone, Calendar, Search, Shield, User, Filter, MoreHorizontal, Loader2, Star, Trash2, Edit, Globe, Smartphone, LayoutGrid, List, Eye, Key, Lock, ChevronDown, CheckCircle2 } from "lucide-react"
import { useRouter } from 'next/navigation'
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
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
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

            // 1. Récupérer les utilisateurs
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, email, name, subscription_tier, created_at, last_login')
                .order('created_at', { ascending: false })

            if (usersError) throw usersError

            // 2. Récupérer la liste des admins
            const { data: adminsData, error: adminsError } = await supabase
                .from('admin_users')
                .select('id, role')

            if (adminsError) throw adminsError

            // 3. Récupérer les nombres de profils et de cartes NFC
            const { data: profilesData } = await supabase.from('profiles').select('user_id')
            const { data: cardsData } = await supabase.from('digital_nfc_cards').select('user_id')

            const profilesMap: Record<string, number> = {}
            profilesData?.forEach(p => {
                if (p.user_id) profilesMap[p.user_id] = (profilesMap[p.user_id] || 0) + 1
            })

            const cardsMap: Record<string, number> = {}
            cardsData?.forEach(c => {
                if (c.user_id) cardsMap[c.user_id] = (cardsMap[c.user_id] || 0) + 1
            })

            // 4. Fusionner les données
            const adminsMap = new Map(adminsData.map(a => [a.id, a.role]))
            const mergedUsers = (usersData || []).map(user => ({
                ...user,
                is_admin: adminsMap.has(user.id),
                admin_role: adminsMap.get(user.id),
                profileCount: profilesMap[user.id] || 0,
                cardCount: cardsMap[user.id] || 0
            }))

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
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Utilisateurs</h1>
                    <p className="text-gray-500 font-medium">Gestion globale des comptes et des permissions ({users.length})</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-10 h-11 border-gray-200 focus:ring-black rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-xl h-11">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("px-3 rounded-lg flex items-center gap-2", viewMode === 'table' && "bg-white shadow-sm text-gray-900")}
                            onClick={() => setViewMode('table')}
                        >
                            <List className="w-4 h-4" />
                            <span className="hidden sm:inline">Table</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("px-3 rounded-lg flex items-center gap-2", viewMode === 'grid' && "bg-white shadow-sm text-gray-900")}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">Cartes</span>
                        </Button>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-11 px-4 border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 w-full sm:w-auto flex items-center gap-2 shadow-sm"
                            >
                                <Filter className="w-4 h-4 text-gray-400" />
                                {filter === 'all' ? 'Tous les rôles' :
                                    filter === 'admin' ? 'Administrateurs' :
                                    filter === 'user' ? 'Utilisateurs' :
                                    `Abonnement ${filter.toUpperCase()}`}
                                <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-gray-100 p-1">
                            <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1.5">Filtrer par rôle</DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1" />
                            {[
                                { value: 'all', label: 'Tous les rôles' },
                                { value: 'admin', label: 'Administrateurs' },
                                { value: 'user', label: 'Utilisateurs' },
                            ].map(opt => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() => setFilter(opt.value)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer font-medium text-sm",
                                        filter === opt.value ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    {opt.label}
                                    {filter === opt.value && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1.5">Abonnement</DropdownMenuLabel>
                            {['free', 'pro', 'business', 'entreprise'].map(tier => (
                                <DropdownMenuItem
                                    key={tier}
                                    onClick={() => setFilter(tier)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer font-medium text-sm capitalize",
                                        filter === tier ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                    {filter === tier && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Users List Container */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <Card key={user.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group bg-white">
                            <div className={cn("h-2 w-full", user.is_admin ? "bg-gray-900" : "bg-blue-500")}></div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-600 font-extrabold text-xl border border-gray-200 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge className={cn(
                                            "text-[10px] font-black uppercase px-2 py-0.5 border-none",
                                            user.is_admin ? "bg-gray-900 text-white" : "bg-blue-50 text-blue-600"
                                        )}>
                                            {user.is_admin ? (user.admin_role || 'ADMIN') : 'USER'}
                                        </Badge>
                                        {getTierBadge(user.subscription_tier)}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <CardTitle className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-gray-600 transition-colors uppercase tracking-tight">
                                        {user.name || 'SANS NOM'}
                                    </CardTitle>
                                    <div className="text-sm text-gray-500 font-medium flex items-center mt-1">
                                        <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-6">
                                {/* Stats Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Globe className="w-4 h-4 text-blue-500" />
                                            <span className="text-xl font-black text-gray-900">{user.profileCount}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">QR Codes</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Smartphone className="w-4 h-4 text-gray-900" />
                                            <span className="text-xl font-black text-gray-900">{user.cardCount}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cartes NFC</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 uppercase tracking-tighter">
                                    <div className="flex items-center text-[10px] font-bold text-gray-400">
                                        <Calendar className="w-3 h-3 mr-1.5" />
                                        Depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-9 w-9 p-0 rounded-xl transition-all",
                                                user.is_admin ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                            )}
                                            onClick={() => openConfirm(
                                                user.is_admin ? "Retirer les droits admin ?" : "Promouvoir administrateur ?",
                                                user.is_admin ? `L'utilisateur ${user.email} n'aura plus accès à la section administration.` : `L'utilisateur ${user.email} aura un accès complet au dashboard admin.`,
                                                () => toggleAdmin(user),
                                                user.is_admin ? 'destructive' : 'default'
                                            )}
                                        >
                                            <Shield className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100"
                                            onClick={() => {
                                                setResetUser(user)
                                                setIsResetDialogOpen(true)
                                            }}
                                            title="Réinitialiser le mot de passe"
                                        >
                                            <Key className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100"
                                            onClick={() => openConfirm(
                                                "Activer le mode Mascarade ?",
                                                `Vous allez être redirigé vers le dashboard de ${user.email}. Vous pourrez revenir à votre compte admin à tout moment.`,
                                                () => impersonateUser(user)
                                            )}
                                            title="Mascarade (Login as)"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100">
                                                <DropdownMenuLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2">Plan Tarifaire</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {['free', 'pro', 'business', 'entreprise'].map((tier) => (
                                                    <DropdownMenuItem
                                                        key={tier}
                                                        className={cn(
                                                            "flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg mx-1 my-0.5 font-bold text-sm capitalize",
                                                            user.subscription_tier === tier ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                                                        )}
                                                        onClick={() => openConfirm(
                                                            "Changer le plan tarifaire ?",
                                                            `Passer l'utilisateur ${user.email} au plan ${tier.toUpperCase()} ?`,
                                                            () => updatePlan(user, tier)
                                                        )}
                                                    >
                                                        {tier}
                                                        {user.subscription_tier === tier && <Star className="w-3 h-3 fill-gray-900 text-gray-900" />}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                                            onClick={() => openConfirm(
                                                "Supprimer l'utilisateur ?",
                                                `Cette action est irréversible. Toutes les données de ${user.email} (profils, cartes, analytics) seront définitivement supprimées.`,
                                                () => deleteUser(user),
                                                'destructive'
                                            )}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-50">
                            <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aucun utilisateur trouvé</p>
                        </div>
                    )}
                </div>
            ) : (
                <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Utilisateur</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Profils</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">NFC</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Rôle</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Plan</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date Création</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold mr-4 border border-gray-200 group-hover:scale-110 transition-transform">
                                                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 group-hover:text-gray-600 transition-colors truncate">{user.name || 'Sans Nom'}</p>
                                                        <p className="text-xs text-gray-400 flex items-center truncate mt-0.5">
                                                            <Mail className="w-3 h-3 mr-1" />
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center space-x-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-sm font-bold text-gray-700">{user.profileCount}</span>
                                                </div>
                                                <div className="text-[9px] text-gray-400 mt-0.5 font-bold uppercase tracking-tighter">QR CODES</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center space-x-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                    <Smartphone className="w-3.5 h-3.5 text-gray-900" />
                                                    <span className="text-sm font-bold text-gray-700">{user.cardCount}</span>
                                                </div>
                                                <div className="text-[9px] text-gray-400 mt-0.5 font-bold uppercase tracking-tighter">CARTES</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge
                                                    className={cn(
                                                        "text-[10px] font-black uppercase px-2 py-0.5 border-none",
                                                        user.is_admin ? "bg-gray-900 text-white" : "bg-blue-50 text-blue-600"
                                                    )}
                                                >
                                                    {user.is_admin ? (user.admin_role || 'ADMIN') : 'USER'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getTierBadge(user.subscription_tier)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Calendar className="w-3 h-3 mr-1.5 opacity-60" />
                                                    {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={cn(
                                                            "h-8 w-8 p-0 rounded-lg transition-all",
                                                            user.is_admin ? "bg-gray-900 text-white border-none shadow-md" : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                                                        )}
                                                        onClick={() => openConfirm(
                                                            user.is_admin ? "Retirer les droits admin ?" : "Promouvoir administrateur ?",
                                                            user.is_admin ? "Cet utilisateur perdra l'accès à la zone admin." : "L'utilisateur pourra gérer toute la plateforme.",
                                                            () => toggleAdmin(user),
                                                            user.is_admin ? 'destructive' : 'default'
                                                        )}
                                                        title={user.is_admin ? "Retirer admin" : "Promouvoir admin"}
                                                    >
                                                        <Shield className={cn("w-4 h-4", user.is_admin ? "fill-white/20" : "")} />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 rounded-lg hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100 transition-all"
                                                        onClick={() => {
                                                            setResetUser(user)
                                                            setIsResetDialogOpen(true)
                                                        }}
                                                        title="Réinitialiser le mot de passe"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 rounded-lg hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100 transition-all"
                                                        onClick={() => openConfirm(
                                                            "Simuler cet utilisateur ?",
                                                            `Prendre le contrôle du compte de ${user.email} ?`,
                                                            () => impersonateUser(user)
                                                        )}
                                                        title="Mode Mascarade"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 rounded-lg hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100 transition-all"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100">
                                                            <DropdownMenuLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2">Changer le Plan</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {['free', 'pro', 'business', 'entreprise'].map((tier) => (
                                                                <DropdownMenuItem
                                                                    key={tier}
                                                                    className={cn(
                                                                        "flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg mx-1 my-0.5 font-bold text-sm capitalize",
                                                                        user.subscription_tier === tier ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                                                                    )}
                                                                    onClick={() => openConfirm(
                                                                        "Changer l'abonnement ?",
                                                                        `Passer au plan ${tier.toUpperCase()} ?`,
                                                                        () => updatePlan(user, tier)
                                                                    )}
                                                                >
                                                                    {tier}
                                                                    {user.subscription_tier === tier && <Star className="w-3 h-3 fill-gray-900 text-gray-900" />}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all"
                                                        onClick={() => openConfirm(
                                                            "Supprimer définitivement ?",
                                                            `L'utilisateur ${user.email} sera effacé de la base de données.`,
                                                            () => deleteUser(user),
                                                            'destructive'
                                                        )}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Users className="w-12 h-12 text-gray-200 mb-4" />
                                                    <p className="text-gray-400 font-medium">Aucun utilisateur ne correspond à votre recherche</p>
                                                    <Button variant="link" className="text-gray-900 mt-2" onClick={() => { setSearch(''); setFilter('all') }}>Réinitialiser</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
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
