'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminGuard } from '@/components/core/auth/AdminGuard'
import { Button } from "@/components/core/ui/button"
import {
    Users,
    CreditCard,
    Settings,
    BarChart3,
    TrendingUp,
    LayoutDashboard,
    ArrowLeft,
    ChevronRight,
    UserCheck,
    Package,
    ShieldCheck,
    Database,
    History,
    Megaphone,
    Menu,
    X,
    Terminal,
    Contact,
    Palette,
    Cpu,
    Link2,
    Building,
    Sparkles,
    Wallet,
    ShieldCheck as ShieldIcon
} from 'lucide-react'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { AdminRealtimeNotifications } from '@/components/features/admin/AdminRealtimeNotifications'

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    const navGroups = [
        {
            title: 'Général',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/admin' },
                { label: 'Traffic & Trends', icon: TrendingUp, href: '/dashboard/admin/analytics' },
                { label: 'Stats Ventes', icon: BarChart3, href: '/dashboard/admin/stats' },
            ]
        },
        {
            title: 'Utilisateurs & Profils',
            items: [
                { label: 'Utilisateurs', icon: Users, href: '/dashboard/admin/users' },
                { label: 'Profils VCard', icon: Contact, href: '/dashboard/admin/profiles' },
                { label: 'Entreprises', icon: Building, href: '/dashboard/admin/companies' },
                { label: 'Modération', icon: ShieldCheck, href: '/dashboard/admin/moderation' },
            ]
        },
        {
            title: "Ventes & Logistique",
            items: [
                { label: "Commandes NFC", href: "/dashboard/admin/orders", icon: CreditCard },
                { label: "Méthodes de Paiement", href: "/dashboard/admin/payments", icon: Wallet },
                { label: "Leads & CRM", href: "/dashboard/admin/leads", icon: Users },
                { label: "Produits NFC", href: "/dashboard/admin/products", icon: Package },
            ]
        },
        {
            title: 'NFC & QR Codes',
            items: [
                { label: 'Cartes NFC', icon: UserCheck, href: '/dashboard/admin/nfc' },
                { label: 'Redirections QR', icon: Link2, href: '/dashboard/admin/qr-redirects' },
            ]
        },
        {
            title: 'Communication & Style',
            items: [
                { label: 'Broadcast', icon: Megaphone, href: '/dashboard/admin/broadcast' },
                { label: 'Templates', icon: Sparkles, href: '/dashboard/admin/templates' },
                { label: 'Thèmes & Design', icon: Palette, href: '/dashboard/admin/themes' },
            ]
        },
        {
            title: 'Système & Maintenance',
            items: [
                { label: 'Surveillance', icon: Terminal, href: '/dashboard/admin/monitoring' },
                { label: 'Journal d\'Audit', icon: History, href: '/dashboard/admin/audit' },
                { label: 'Paramètres', icon: Settings, href: '/dashboard/admin/settings' },
                { label: 'Config Avancée', icon: Cpu, href: '/dashboard/admin/settings/advanced' },
            ]
        }
    ]

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                {/* Desktop Sidebar */}
                <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm fixed h-screen z-30">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-xl">O</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">Ofika Admin</span>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-8 overflow-y-auto bg-white">
                        {navGroups.map((group) => (
                            <div key={group.title}>
                                <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {group.title}
                                </div>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group/item",
                                                    isActive
                                                        ? "bg-orange-50 text-orange-600 font-bold"
                                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                )}
                                            >
                                                <div className="flex items-center">
                                                    <item.icon className={cn("w-4 h-4 mr-3", isActive ? "text-orange-600" : "text-gray-400 group-hover/item:text-gray-600")} />
                                                    <span className="text-xs uppercase tracking-tight">{item.label}</span>
                                                </div>
                                                {isActive && (
                                                    <ChevronRight className="w-3 h-3 text-orange-600" />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full flex items-center justify-start text-gray-500 hover:text-gray-900 hover:bg-white mb-2"
                            onClick={() => router.push('/dashboard')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Espace Client
                        </Button>
                        <div className="flex items-center space-x-2 px-3 py-2 text-[10px] font-bold text-green-600 bg-white border border-green-100 rounded-lg shadow-sm">
                            <ShieldCheck className="w-3 h-3" />
                            <span>SESSION SUPERADMIN</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={cn(
                    "fixed inset-0 z-[100] md:hidden transition-opacity duration-300",
                    isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}>
                    {/* Dark Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Content */}
                    <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300",
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}>
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <Link href="/" className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">O</span>
                                    </div>
                                    <span className="text-xl font-bold tracking-tighter text-gray-900">Ofika Admin</span>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Nav */}
                            <nav className="flex-1 p-4 space-y-6 overflow-y-auto bg-gray-50/30">
                                {navGroups.map((group) => (
                                    <div key={group.title}>
                                        <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {group.title}
                                        </div>
                                        <div className="space-y-1">
                                            {group.items.map((item) => {
                                                const isActive = pathname === item.href
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className={cn(
                                                            "flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200",
                                                            isActive
                                                                ? "bg-white text-orange-600 shadow-sm border border-orange-100 font-bold"
                                                                : "text-gray-500 hover:bg-white/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center">
                                                            <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-orange-600" : "text-gray-400")} />
                                                            <span className="text-sm">{item.label}</span>
                                                        </div>
                                                        {isActive && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </nav>

                            {/* Bottom Actions */}
                            <div className="p-4 border-t border-gray-100 space-y-3 bg-white">
                                <Button
                                    variant="ghost"
                                    className="w-full flex items-center justify-start h-12 text-gray-500 hover:text-gray-900"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false)
                                        router.push('/dashboard')
                                    }}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-medium">Espace Client</span>
                                </Button>
                                <div className="flex items-center space-x-3 px-4 py-3 text-[10px] font-bold text-green-700 bg-green-50 rounded-xl border border-green-100">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>ACCÈS SUPERADMIN SÉCURISÉ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                    {/* Mobile Header */}
                    <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40 transition-all duration-300">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="text-gray-500"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">O</span>
                            </div>
                            <span className="text-lg font-black tracking-tighter text-gray-900 uppercase">Ofika Admin</span>
                        </div>
                        <div className="w-10"></div> {/* Spacer for balance */}
                    </header>

                    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
                        {children}
                    </main>
                </div>
            </div>
            <AdminRealtimeNotifications />
        </AdminGuard>
    )
}
