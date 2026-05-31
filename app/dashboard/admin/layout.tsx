'use client'

import React from 'react'
import { AdminGuard } from '@/components/core/auth/AdminGuard'
import { AdminRealtimeNotifications } from '@/components/features/admin/AdminRealtimeNotifications'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin-sidebar'

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <AdminGuard>
            <SidebarProvider>
                <div className="min-h-screen bg-gray-50 flex w-full">
                    <AdminSidebar />

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                        {/* Top bar with sidebar toggle */}
                        <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-4 px-4 sticky top-0 z-20 shrink-0 shadow-sm">
                            <SidebarTrigger className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-1.5 transition-colors" />
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
                        </header>

                        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                            {children}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
            <AdminRealtimeNotifications />
        </AdminGuard>
    )
}
