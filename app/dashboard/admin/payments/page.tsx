'use client'

import React, { useState } from 'react'
import { CreditCard, Settings, Cpu, ShieldCheck } from "lucide-react"
import { PaymentMethodsTab } from '@/components/features/admin/PaymentMethodsTab'
import { SystemSettingsTab } from '@/components/features/admin/SystemSettingsTab'
import { AdvancedConfigTab } from '@/components/features/admin/AdvancedConfigTab'
import { cn } from "@/lib/utils"

type PaymentTab = 'gateways' | 'system' | 'diagnostic'

export default function AdminPaymentsAndSettingsPage() {
    const [activeTab, setActiveTab] = useState<PaymentTab>('gateways')

    return (
        <div className="space-y-6 bg-white pb-16">
            {/* 1. Header Exécutif */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
                            Passerelles & Flux Financiers
                        </h1>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Opérationnel
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Gestion des processeurs de paiement (Wave, GeniusPay), du tarif officiel de la carte NFC et des clés de configuration Supabase.
                    </p>
                </div>
            </div>

            {/* 2. Navigation par Onglets Segmentés (Linear Style) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gray-100 max-w-full">
                {[
                    { id: 'gateways' as PaymentTab, label: 'Passerelles & Tarifs', icon: CreditCard },
                    { id: 'system' as PaymentTab, label: 'Paramètres Plateforme', icon: Settings },
                    { id: 'diagnostic' as PaymentTab, label: 'Diagnostic & Webhooks', icon: Cpu },
                ].map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap",
                                isActive
                                    ? "bg-gray-950 text-white shadow-xs"
                                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-100/70"
                            )}
                        >
                            <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-gray-400")} />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* 3. Contenu de l'onglet actif */}
            <div className="pt-2">
                {activeTab === 'gateways' && <PaymentMethodsTab />}
                {activeTab === 'system' && <SystemSettingsTab />}
                {activeTab === 'diagnostic' && <AdvancedConfigTab />}
            </div>
        </div>
    )
}
