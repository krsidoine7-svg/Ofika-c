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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User as UserIcon, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { OrderNotifications } from '@/components/features/card-ordering/OrderNotifications'
import Link from 'next/link'

interface AdminClientLayoutProps {
    children: React.ReactNode
}

export function AdminClientLayout({ children }: AdminClientLayoutProps) {
    const { user, signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            await signOut()
            toast.success("Déconnexion réussie")
            router.push('/login')
        } catch (error) {
            toast.error("Erreur lors de la déconnexion")
        }
    }

    const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin'
    const initials = displayName.substring(0, 2).toUpperCase()

    return (
        <AdminGuard>
            <SidebarProvider>
                <div className="min-h-screen bg-white flex w-full">
                    <AdminSidebar />

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-white">
                        {/* Top bar with sidebar toggle */}
                        <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-4 px-4 sm:px-6 sticky top-0 z-20 shrink-0">
                            <SidebarTrigger className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg p-1.5 transition-colors" />
                            <div className="h-5 w-px bg-gray-200" />
                            <div className="flex items-center gap-2 md:hidden">
                                <div className="w-7 h-7 bg-white border border-gray-200 rounded-lg p-1 flex items-center justify-center shadow-xs">
                                    <svg className="w-full h-full" viewBox="0 0 344.19 347" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="#f97316" d="m171.53,210.3c18.45-.4,33.06,14.47,35.37,35.99,3.63,33.84,6.13,36.76,39.2,43.6,15.85,3.28,28.36,10.81,27.96,28.65-.34,15.3-8.3,27.53-25,28.39-17.96.93-27.86-8.99-31.68-27.08-6.7-31.7-14.18-37.22-45.56-37.28-30.74-.07-38.03,5.7-45.29,37.21-4.01,17.42-13.7,28.27-31.97,27.06-15.25-1.01-23.5-11.31-24.12-26.41-.8-19.2,10.84-29.18,28.17-30.37,26.21-1.8,35.43-16.65,37.79-40.93,2.5-25.76,15.17-38.4,35.16-38.84Z"/>
                                        <path fill="#f97316" d="m315.27,69.66c15.82,2.09,27.1,9.65,28.49,25.92,1.49,17.46-9.59,27.39-24.91,31.78-35.39,10.15-48.44,35.46-35.83,71.17,4.3,12.18,12.92,19.25,25.7,20.01,9.58.57,18.08,2.92,25.28,9.61,8.71,8.1,12.57,17.79,8.66,29.33-3.8,11.22-12.19,18.02-23.77,19.44-11.82,1.45-21.11-3.89-26.82-14.31-2.53-4.62-3.78-10.1-4.88-15.35-6.44-30.91-11.39-35.54-42.24-38.73-22.53-2.33-35.85-15.15-35.99-34.64-.15-20.49,13.82-34.73,37.22-35.34,23.89-.63,37.54-11.29,40.16-35.56,1.96-18.1,9.89-30.76,28.92-33.34Z"/>
                                        <path fill="#f97316" d="m0,246.93c2.03-17.01,13.36-25.17,30.31-28.05,25.82-4.39,34.21-15.98,33.97-45.71-.24-29.84-8.12-40.03-34.88-44.91C12.57,125.18.2,117.06.4,98.14c.17-16.18,9.49-26.71,25.48-27.61,18.39-1.04,29.02,10.48,30.66,27.98,2.71,28.91,17.83,39.85,45.7,40.36,19.9.36,33.61,17.14,32.38,35.3-1.4,20.65-12.49,32.33-33.42,34.53-34.79,3.67-36.73,5.46-44.63,40.82-3.87,17.34-13.15,28.74-31.49,27.2-15.96-1.34-23.95-12.35-25.07-29.79Z"/>
                                        <path fill="#f97316" d="m175.22,136.35c-21.57.7-36.87-12.44-38.89-36.85-2.23-27.02-13.33-40.92-40.98-43.03-16.37-1.25-26.33-12.68-24.86-30.58,1.24-15.12,9.77-24.94,24.97-25.59,17.05-.74,26.62,9.31,30.72,25.72,9.04,36.12,37.33,49.61,71.39,35.03,16.41-7.03,17.63-21.67,20.72-36.25C221.54,9.51,231.31.15,247.42,0c14.59-.14,22.45,9.06,25.82,22.28,3.91,15.31-2.86,29.54-16.61,31.1-36.6,4.14-51.52,22.87-52.85,59.25-.52,14.14-14.94,22.72-28.56,23.72Z"/>
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold tracking-tight text-gray-900">Ofika Admin</span>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-medium">
                                <span>Panneau d&apos;administration</span>
                            </div>

                            <div className="flex-1" />

                            <Link
                                href="/"
                                target="_blank"
                                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-950 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200/70 mr-1"
                            >
                                <span>Voir le site</span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                            </Link>

                            <OrderNotifications className="mr-1" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-full transition-colors focus:outline-none">
                                        <Avatar className="h-8 w-8 border border-gray-200">
                                            <AvatarFallback className="bg-neutral-900 text-white text-xs font-semibold">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-gray-900">{displayName}</p>
                                            <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <Link href="/dashboard/admin/profile">
                                        <DropdownMenuItem className="cursor-pointer text-gray-700 focus:text-gray-900 focus:bg-gray-50">
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <span>Accéder au profil</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator className="bg-gray-100" />
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

                        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden bg-white">
                            {children}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
            <AdminRealtimeNotifications />
        </AdminGuard>
    )
}
