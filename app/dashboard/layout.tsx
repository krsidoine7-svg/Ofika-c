'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProtectedRoute } from "@/components/core/auth/ProtectedRoute"
import { Logo } from "@/components/core/ui/logo"
import { Button } from "@/components/core/ui/button"
import { Badge } from "@/components/core/ui/badge"
import { LayoutDashboard, Users, QrCode, Settings, Menu, X, BarChart3, CreditCard, Shield, Star, ShieldCheck } from "lucide-react"
import { LogoutButton } from "@/components/core/auth/LogoutButton"
import { useAuth } from "@/lib/hooks/useAuth"
import { useProfiles } from "@/lib/hooks/useProfiles"
import { useUser } from "@/lib/hooks/useUser"
import { AnnouncementBanner } from '@/components/dashboard/AnnouncementBanner'
import { UserRealtimeNotifications } from '@/components/features/card-ordering/UserRealtimeNotifications'
import { OrderNotifications } from '@/components/features/card-ordering/OrderNotifications'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/core/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/ui/avatar"
import { LogOut, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Ghost, StopCircle, XCircle } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [userData, setUserData] = useState<any>(null)
    const [impersonatedId, setImpersonatedId] = useState<string | null>(null)
    const [impersonatedUser, setImpersonatedUser] = useState<{ name: string, email: string } | null>(null)
    const pathname = usePathname()
    const { user } = useAuth()
    const { profiles } = useProfiles(impersonatedId || undefined)
    const { getUserData } = useUser()
    const { signOut } = useAuth()
    const router = useRouter()
    const profileIds = profiles.map(p => p.id)

    const handleLogout = async () => {
        try {
            await signOut()
            toast.success("Déconnexion réussie")
            router.push("/")
        } catch (error) {
            console.error("Error logging out:", error)
            toast.error("Erreur lors de la déconnexion")
        }
    }

    // 1. Initial check for impersonation (only once or when user changes)
    useEffect(() => {
        const checkImpersonation = async () => {
            try {
                const res = await fetch('/api/admin/impersonate')
                const data = await res.json()
                const val = data.impersonatingId || null
                if (val !== impersonatedId) {
                    setImpersonatedId(val)
                    if (data.user) {
                        setImpersonatedUser(data.user)
                    }
                }
            } catch (err) {
                console.error("Impersonation check error:", err)
            }
        }
        checkImpersonation()
    }, [user])

    // 2. Load user data when identity changes
    useEffect(() => {
        const loadUser = async () => {
            const effectiveId = impersonatedId || user?.id
            if (effectiveId) {
                const data = await getUserData(effectiveId)
                if (data) {
                    setUserData(data.data || data)
                }
            }
        }
        loadUser()
    }, [user, getUserData, impersonatedId])

    const getSubscriptionLabel = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'free': return 'Compte Gratuit'
            case 'pro': return 'Compte Pro'
            case 'enterprise': return 'Compte Entreprise'
            case 'lifetime': return 'Compte Vie'
            default: return tier ? `Compte ${tier}` : 'Compte Gratuit'
        }
    }

    const stopImpersonating = async () => {
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'stop' })
            })
            if (res.ok) {
                toast.success("Mode Mascarade désactivé")
                window.location.reload()
            }
        } catch (err) {
            toast.error("Erreur")
        }
    }

    const subscriptionLabel = getSubscriptionLabel(userData?.subscription_tier)
    const displayName = userData?.name || user?.user_metadata?.name || user?.email?.split('@')[0]
    const avatarUrl = userData?.image || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || profiles[0]?.image_url

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/profiles', label: 'Profils', icon: Users },
        { href: '/dashboard/contacts', label: 'Leads', icon: Users },
        { href: '/dashboard/qr-codes', label: 'QR Codes', icon: QrCode },
        { href: '/dashboard/avis-clients', label: 'Avis Clients', icon: Star },
        { href: '/dashboard/orders', label: 'Commandes', icon: CreditCard },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
    ]

    const isAdminPath = pathname?.startsWith('/dashboard/admin')

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Masquerade Banner - Enhanced UI */}
                {impersonatedId && (
                    <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-[100] shadow-lg animate-in slide-in-from-top duration-500 border-b border-orange-400/30">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Ghost className="w-6 h-6 animate-bounce [animation-duration:2000ms]" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <span className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    Mode Mascarade
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] font-bold">ACTIF</Badge>
                                </span>
                                <div className="hidden sm:block w-px h-4 bg-white/20" />
                                <div className="flex items-center gap-2 text-xs font-medium text-orange-50">
                                    <UserIcon className="w-3.5 h-3.5 opacity-70" />
                                    <span>
                                        {impersonatedUser?.name || "Utilisateur"}
                                        <span className="opacity-60 ml-2 font-mono text-[10px]">({impersonatedUser?.email || impersonatedId})</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="hidden lg:block text-[11px] font-bold opacity-80 uppercase tracking-tighter">
                                Navigation en cours sous l'identité de cet utilisateur
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={stopImpersonating}
                                className="bg-white text-orange-600 hover:bg-white hover:scale-105 border-none font-black text-[10px] h-9 px-4 uppercase tracking-widest rounded-xl shadow-sm transition-all"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Quitter la session
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex flex-1">
                    {/* Desktop Sidebar - Hidden on Admin paths to avoid double sidebar */}
                    {!isAdminPath && (
                        <aside className={cn(
                            "hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 transition-all duration-300",
                            impersonatedId ? "top-[64px] h-[calc(100vh-64px)]" : "top-0 h-screen"
                        )}>
                            <div className="p-4 border-b border-gray-100 flex items-center justify-center">
                                <Logo size="sm" showText />
                            </div>

                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant={isActive ? "secondary" : "ghost"}
                                                className={`w-full justify-start ${isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600'}`}
                                            >
                                                <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    )
                                })}
                            </nav>

                            {/* Bouton Admin — visible uniquement pour les admins */}
                            {(userData?.is_admin || userData?.role === 'admin' || userData?.role === 'superadmin') && (
                                <div className="px-4 pb-3">
                                    <Link href="/dashboard/admin">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 border border-orange-200 shadow-sm"
                                        >
                                            <ShieldCheck className="mr-2 h-4 w-4 text-orange-600" />
                                            <span className="font-semibold text-sm">Dashboard Admin</span>
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <OrderNotifications />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-3 p-0 h-auto hover:bg-transparent">
                                            <Avatar className="h-9 w-9 border border-gray-200">
                                                <AvatarImage src={avatarUrl} alt={displayName} />
                                                <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                                                    {displayName?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-left hidden lg:block">
                                                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{displayName}</p>
                                                <p className="text-xs text-gray-500">{subscriptionLabel}</p>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="start" side="right" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{displayName}</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <Link href="/dashboard/settings">
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Paramètres</span>
                                            </DropdownMenuItem>
                                        </Link>
                                        {(userData?.is_admin || userData?.role === 'admin' || userData?.role === 'superadmin') && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <Link href="/dashboard/admin">
                                                    <DropdownMenuItem className="cursor-pointer text-orange-700 focus:text-orange-700 focus:bg-orange-50">
                                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                                        <span className="font-semibold">Dashboard Admin</span>
                                                    </DropdownMenuItem>
                                                </Link>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Déconnexion</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </aside>
                    )}

                    {/* Content Area */}
                    <div className={cn(
                        "flex-1 flex flex-col min-w-0 transition-all duration-300",
                        !isAdminPath && "md:ml-64"
                    )}>
                        {/* Mobile Header - Hidden on Admin paths */}
                        {!isAdminPath && (
                            <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                    </Button>
                                    <Logo size="sm" showText={false} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <OrderNotifications />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden p-0 border border-gray-200">
                                                <Avatar className="h-full w-full">
                                                    <AvatarImage src={avatarUrl} alt={displayName} />
                                                    <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                                                        {displayName?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56" align="end" forceMount>
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">{displayName}</p>
                                                    <p className="text-xs leading-none text-muted-foreground">
                                                        {user?.email}
                                                    </p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <Link href="/dashboard/settings">
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    <span>Paramètres</span>
                                                </DropdownMenuItem>
                                            </Link>
                                            {(userData?.is_admin || userData?.role === 'admin' || userData?.role === 'superadmin') && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <Link href="/dashboard/admin">
                                                        <DropdownMenuItem className="cursor-pointer text-orange-700 focus:text-orange-700 focus:bg-orange-50">
                                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                                            <span className="font-semibold">Dashboard Admin</span>
                                                        </DropdownMenuItem>
                                                    </Link>
                                                </>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Déconnexion</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </header>
                        )}

                        {/* Mobile Menu Overlay - Hidden on Admin paths */}
                        {isMobileMenuOpen && !isAdminPath && (
                            <div className="md:hidden fixed inset-0 z-40 bg-white p-4">
                                <div className="flex justify-end mb-4">
                                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                        <X className="h-7 w-7 text-gray-500" />
                                    </Button>
                                </div>
                                <nav className="space-y-2">
                                    {navItems.map((item) => (
                                        <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button
                                                variant="ghost"
                                                className={`w-full justify-start text-lg h-12 ${pathname === item.href ? 'bg-orange-50 text-orange-600' : ''}`}
                                            >
                                                <item.icon className="mr-3 h-5 w-5" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    ))}
                                    {/* Bouton Admin mobile */}
                                    {(userData?.is_admin || userData?.role === 'admin' || userData?.role === 'superadmin') && (
                                        <Link href="/dashboard/admin" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-lg h-12 bg-orange-50 text-orange-700 border border-orange-200 mt-2"
                                            >
                                                <ShieldCheck className="mr-3 h-5 w-5" />
                                                Dashboard Admin
                                            </Button>
                                        </Link>
                                    )}
                                    <div className="pt-4 mt-4 border-t border-gray-100">
                                        <div className="mb-4 px-2">
                                            <p className="font-medium text-gray-900">{displayName}</p>
                                            <p className="text-sm text-gray-500">{subscriptionLabel}</p>
                                        </div>
                                        <LogoutButton className="w-full justify-start text-red-600" />
                                    </div>
                                </nav>
                            </div>
                        )}

                        {/* Page Content */}
                        <main className={cn("flex-1 overflow-auto", isAdminPath ? "p-0" : "p-4 md:p-8")}>
                            {!isAdminPath && <AnnouncementBanner />}
                            {children}
                            {user?.id && <UserRealtimeNotifications userId={user.id} />}
                        </main>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
