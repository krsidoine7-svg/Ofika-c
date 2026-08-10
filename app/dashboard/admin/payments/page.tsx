'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Settings, Cpu } from "lucide-react"

// Import des sous-composants
import { PaymentMethodsTab } from '@/components/features/admin/PaymentMethodsTab'
import { SystemSettingsTab } from '@/components/features/admin/SystemSettingsTab'
import { AdvancedConfigTab } from '@/components/features/admin/AdvancedConfigTab'

export default function AdminPaymentsAndSettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Global Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Paiements Système</h1>
                    <p className="text-gray-500 font-medium">Gérez vos passerelles de paiement (GeniusPay, Wave), les tarifs officiels et la configuration globale du système.</p>
                </div>
            </div>

            <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[550px] mb-8 bg-gray-100/50 p-1 rounded-xl">
                    <TabsTrigger value="settings" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Settings className="w-4 h-4 mr-2 text-orange-500" />
                        Configuration & Paiements Système
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Cpu className="w-4 h-4 mr-2 text-purple-500" />
                        Diagnostic & Webhooks
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="settings" className="focus:outline-none space-y-12">
                    <PaymentMethodsTab />
                    <div className="pt-6 border-t border-gray-200/80">
                        <div className="mb-6 space-y-1">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Paramètres Système Plateforme</h2>
                            <p className="text-sm text-gray-500 font-medium">Éditeur avancé des clés de configuration en base de données Supabase.</p>
                        </div>
                        <SystemSettingsTab />
                    </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="focus:outline-none">
                    <AdvancedConfigTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
