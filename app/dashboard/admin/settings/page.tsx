'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Settings,
    Save,
    RefreshCcw,
    Globe,
    Palette,
    ShieldCheck,
    Mail,
    Lock,
    Loader2
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
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

export default function AdminSettingsPage() {
    const [config, setConfig] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const supabase = useMemo(() => createClient(), [])

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
        fetchConfig()
    }, [supabase])

    async function fetchConfig() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('system_config')
                .select('*')
                .neq('key', 'payment_gateways')
                .order('key')

            if (error) throw error
            setConfig(data || [])
        } catch (error) {
            toast.error("Erreur de chargement")
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(key: string, value: any) {
        try {
            setIsSaving(true)
            const { error } = await supabase
                .from('system_config')
                .update({ value, updated_at: new Date().toISOString() })
                .eq('key', key)

            if (error) throw error
            toast.success(`Configuration "${key}" mise à jour`)
        } catch (error) {
            toast.error("Erreur d'enregistrement")
        } finally {
            setIsSaving(false)
            setIsConfirmOpen(false)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" /></div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-orange-500" />
                        Configuration Système
                    </h1>
                    <p className="text-gray-500 font-medium">Gérez les paramètres globaux de la plateforme Ofika.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {config.map((item) => (
                    <Card key={item.key} className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    {item.key === 'platform_settings' ? <Globe className="w-4 h-4 text-blue-500" /> : <Palette className="w-4 h-4 text-purple-500" />}
                                    {item.key.replace('_', ' ').toUpperCase()}
                                </CardTitle>
                                <Button
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-8"
                                    onClick={() => openConfirm(
                                        "Enregistrer les modifications ?",
                                        `Voulez-vous appliquer ces nouveaux paramètres pour "${item.key.replace('_', ' ')}" ? Ces changements affecteront toute la plateforme.`,
                                        () => handleSave(item.key, item.value)
                                    )}
                                    disabled={isSaving}
                                >
                                    <Save className="w-3 h-3 mr-2" />
                                    Enregistrer
                                </Button>
                            </div>
                            <CardDescription className="mt-1">{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Rendu dynamique basé sur la structure JSON */}
                            {Object.entries(item.value).map(([field, val]: [string, any]) => (
                                <div key={field} className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{field.replace('_', ' ')}</label>
                                    {typeof val === 'boolean' ? (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    const newValue = { ...item.value, [field]: !val }
                                                    setConfig(config.map(c => c.key === item.key ? { ...c, value: newValue } : c))
                                                }}
                                                className={cn(
                                                    "w-10 h-5 rounded-full relative transition-colors duration-300",
                                                    val ? "bg-orange-500" : "bg-gray-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                                                    val ? "left-6" : "left-1"
                                                )}></div>
                                            </button>
                                            <span className="text-sm font-medium">{val ? 'Activé' : 'Désactivé'}</span>
                                        </div>
                                    ) : typeof val === 'object' && val !== null ? (
                                        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/60 shadow-inner mt-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {Object.entries(val).map(([subKey, subVal]: [string, any]) => (
                                                    <div key={subKey} className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-orange-100">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{subKey.replace('_', ' ')}</label>
                                                        {typeof subVal === 'boolean' ? (
                                                            <div className="flex items-center gap-2 pt-1">
                                                                <button
                                                                    onClick={() => {
                                                                        const newValue = { ...item.value }
                                                                        newValue[field] = { ...newValue[field], [subKey]: !subVal }
                                                                        setConfig(config.map(c => c.key === item.key ? { ...c, value: newValue } : c))
                                                                    }}
                                                                    className={cn(
                                                                        "w-9 h-5 rounded-full relative transition-colors duration-300",
                                                                        subVal ? "bg-green-500" : "bg-gray-200"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                                                                        subVal ? "left-5" : "left-1"
                                                                    )}></div>
                                                                </button>
                                                                <span className={cn("text-[10px] font-black uppercase tracking-widest", subVal ? "text-green-600" : "text-gray-400")}>{subVal ? 'Activé' : 'Désactivé'}</span>
                                                            </div>
                                                        ) : (
                                                            <Input
                                                                type={typeof subVal === 'number' ? "number" : "text"}
                                                                step={typeof subVal === 'number' ? "0.01" : undefined}
                                                                value={subVal}
                                                                onChange={(e) => {
                                                                    const newValue = { ...item.value }
                                                                    newValue[field] = {
                                                                        ...newValue[field],
                                                                        [subKey]: typeof subVal === 'number' ? Number(e.target.value) : e.target.value
                                                                    }
                                                                    setConfig(config.map(c => c.key === item.key ? { ...c, value: newValue } : c))
                                                                }}
                                                                className="h-8 border-gray-100 bg-gray-50/50 focus:ring-orange-500 focus:bg-white rounded-lg text-xs font-bold text-gray-700"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Input
                                            value={val}
                                            onChange={(e) => {
                                                const newValue = { ...item.value, [field]: e.target.value }
                                                setConfig(config.map(c => c.key === item.key ? { ...c, value: newValue } : c))
                                            }}
                                            className="h-10 border-gray-100 focus:ring-orange-500 rounded-xl text-sm"
                                        />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}

                {/* Sécurité */}
                <Card className="md:col-span-2 border-dashed border-2 border-gray-100 shadow-none">
                    <CardContent className="p-8 text-center space-y-4">
                        <Lock className="w-10 h-10 text-gray-200 mx-auto" />
                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-900">Paramètres de Sécurité Avancés</h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto italic">
                                La modification des clés d'API et des secrets de webhook est actuellement restreinte via ce dashboard pour des raisons de sécurité.
                            </p>
                        </div>
                        <Button variant="secondary" className="font-bold text-xs" disabled>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Gérer les secrets
                        </Button>
                    </CardContent>
                </Card>
            </div>
            {/* Modal de Confirmation Générique */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg bg-orange-100 text-orange-600"
                        )}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{confirmConfig.title}</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            {confirmConfig.message}
                        </p>
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
                                "rounded-xl font-black uppercase tracking-widest flex-1 h-12 shadow-md bg-orange-600 hover:bg-orange-700 text-white"
                            )}
                        >
                            Confirmer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
