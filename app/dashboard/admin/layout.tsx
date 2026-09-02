'use client'

import React from 'react'
import { AdminGuard } from '@/components/core/auth/AdminGuard'
import { AdminRealtimeNotifications } from '@/components/features/admin/AdminRealtimeNotifications'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin-sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { OrderNotifications } from '@/components/features/card-ordering/OrderNotifications'
import Link from 'next/link'

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            await signOut()
            toast.success("Déconnexion réussie")
            router.push('/auth/login')
        } catch (error) {
            toast.error("Erreur lors de la déconnexion")
        }
    }

    const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin'
    const initials = displayName.substring(0, 2).toUpperCase()

    return (
        <AdminGuard>
            <SidebarProvider>
                <div className="min-h-screen bg-white relative flex w-full overflow-hidden">
                    {/* Glassmorphism Background Blobs */}
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100/40 blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-50/50 blur-[120px] pointer-events-none" />
                    
                    <div className="relative z-10 flex w-full">
                        <AdminSidebar />

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                            {/* Top bar with sidebar toggle */}
                            <header className="h-14 bg-white/60 backdrop-blur-md border-b border-gray-100/50 flex items-center gap-4 px-4 sticky top-0 z-20 shrink-0">
                                <SidebarTrigger className="text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg p-1.5 transition-colors" />
                            <div className="h-5 w-px bg-gray-200" />
                            <div className="flex items-center gap-2 md:hidden">
                                <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                                    <span className="text-white font-black text-xs">O</span>
                                </div>
                                <span className="text-sm font-black tracking-tighter text-gray-900 uppercase">Ofika Admin</span>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-medium">
                                <span>Panneau d&apos;administration</span>
                            </div>

                            <div className="flex-1" />

                            <OrderNotifications className="mr-1" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-full transition-colors focus:outline-none">
                                        <Avatar className="h-8 w-8 border border-gray-100">
                                            <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-bold">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-gray-900">{displayName}</p>
                                            <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <Link href="/dashboard/admin/profile">
                                        <DropdownMenuItem className="cursor-pointer text-gray-700 focus:text-gray-900 focus:bg-gray-50">
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <span>Accéder au profil</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Déconnexion</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </header>

                        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full relative z-10 overflow-x-hidden">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
            </SidebarProvider>
            <AdminRealtimeNotifications />
        </AdminGuard>
    )
}
