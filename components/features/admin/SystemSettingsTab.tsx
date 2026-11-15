'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Settings,
    Save,
    Globe,
    Palette,
    Shield,
    Lock,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"

export function SystemSettingsTab() {
    const [config, setConfig] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Dialogue de confirmation minimaliste
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string
        message: string
        action: () => Promise<void> | void
        variant: 'default' | 'destructive'
    }>({
        title: '',
        message: '',
        action: () => {},
        variant: 'default'
    })

    const openConfirm = (
        title: string,
        message: string,
        action: () => Promise<void> | void,
        variant: 'default' | 'destructive' = 'default'
    ) => {
        setConfirmConfig({ title, message, action, variant })
        setIsConfirmOpen(true)
    }

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/config')
            const json = await res.json()

            if (!res.ok || json.error) throw new Error(json.error || 'Erreur lors du chargement')
            const items = json.data || []
            setConfig(items)
        } catch (error) {
            console.error('Erreur chargement config admin:', error)
            toast.error("Erreur de chargement des paramètres système")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchConfig()
    }, [fetchConfig])

    async function handleSave(key: string, value: any) {
        try {
            setIsSaving(true)
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            })
            const json = await res.json()

            if (!res.ok || json.error) throw new Error(json.error || "Erreur d'enregistrement")

            if (key === 'pricing_config' && value?.nfc_card_base_price) {
                await fetch('/api/payments/methods', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'geniuspay', base_price: value.nfc_card_base_price })
                })
            }

            toast.success(`Clé de configuration "${key}" mise à jour`)
            fetchConfig()
        } catch (error: any) {
            console.error('Erreur sauvegarde config admin:', error)
            toast.error(error?.message || "Erreur d'enregistrement")
        } finally {
            setIsSaving(false)
            setIsConfirmOpen(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <p className="text-xs text-gray-400 font-medium">Chargement des paramètres...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne Gauche : Clés dynamiques */}
                <div className="space-y-6">
                    {config.filter(c => c.key !== 'pricing_config').map((item) => (
                        <Card key={item.key} className="border border-gray-100 shadow-none rounded-xl bg-white overflow-hidden p-5 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {item.key === 'platform_settings' ? (
                                            <Globe className="w-4 h-4 text-gray-500" />
                                        ) : (
                                            <Palette className="w-4 h-4 text-gray-500" />
                                        )}
                                        <h3 className="text-xs font-bold font-mono text-gray-950 uppercase tracking-wider">
                                            {item.key}
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {item.description || 'Paramètres stockés dans public.system_config.'}
                                    </p>
                                </div>

                                <Button
                                    size="sm"
                                    className="bg-gray-950 hover:bg-black text-white text-xs font-medium h-7 px-3 rounded-md shadow-xs gap-1.5"
                                    onClick={() => openConfirm(
                                        "Enregistrer les modifications ?",
                                        `Mettre à jour la clé "${item.key}" dans la base de données Supabase ?`,
                                        () => handleSave(item.key, item.value)
                                    )}
                                    disabled={isSaving}
                                >
                                    <Save className="w-3 h-3" />
                                    <span>Enregistrer</span>
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(item.value || {}).map(([field, val]: [string, any]) => (
                                    <div key={field} className="space-y-1">
                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                            {field.replace(/_/g, ' ')}
                                        </label>

                                        {typeof val === 'boolean' ? (
                                            <div className="flex items-center gap-2.5 pt-0.5">
                                                <button
                                                    onClick={() => {
                                                        const newValue = { ...item.value, [field]: !val }
                                                        setConfig(config.map(c => c.key === item.key ? { ...c, value: newValue } : c))
                                                    }}
                                                    className={cn(
                                                        "w-9 h-5 rounded-full transition-colors relative focus:outline-none",
                                                        val ? "bg-emerald-600" : "bg-gray-300"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform shadow-xs",
                                                        val ? "left-4.5" : "left-1"
                                                    )} />
                                                </button>
                                                <span className="text-xs font-medium text-gray-700">
                                                    {val ? 'Activé' : 'Désactivé'}
                                                </span>
                                            </div>
                                        ) : typeof val === 'object' && val !== null ? (
                                            <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100 space-y-2 mt-1">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {Object.entries(val).map(([subKey, subVal]: [string, any]) => (
                                                        <div key={subKey} className="space-y-1 bg-white p-2.5 rounded-md border border-gray-100">
                                                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                                                {subKey.replace(/_/g, ' ')}
                                                            </label>
                                                            {typeof subVal === 'boolean' ? (
                                                                <div className="flex items-center gap-2 pt-0.5">
                                                                    <button
                                                                        onClick={() => {
                                                                            const newValue = { ...item.value }
                                                                            newValue[field] = { ...newValue[field], [subKey]: !subVal }
                                                                            setConfig(config.map(c => c.key === item.key ? { ...c, value: newValue } : c))
                                                                        }}
                                                                        className={cn(
                                                                            "w-8 h-4.5 rounded-full transition-colors relative focus:outline-none",
                                                                            subVal ? "bg-emerald-600" : "bg-gray-300"
                                                                        )}
                                                                    >
                                                                        <span className={cn(
                                                                            "w-3 h-3 bg-white rounded-full absolute top-0.75 transition-transform shadow-xs",
                                                                            subVal ? "left-4" : "left-1"
                                                                        )} />
                                                                    </button>
                                                                    <span className="text-[11px] font-medium text-gray-700">
                                                                        {subVal ? 'Oui' : 'Non'}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <Input
                                                                    type={typeof subVal === 'number' ? "number" : "text"}
                                                                    value={subVal}
                                                                    onChange={(e) => {
                                                                        const newValue = { ...item.value }
                                                                        newValue[field] = {
                                                                            ...newValue[field],
                                                                            [subKey]: typeof subVal === 'number' ? Number(e.target.value) : e.target.value
                                                                        }
                                                                        setConfig(config.map(c => c.key === item.key ? { ...c, value: newValue } : c))
                                                                    }}
                                                                    className="h-7 text-xs font-mono rounded border-gray-200"
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
                                                className="h-8 text-xs font-mono rounded-lg border-gray-200"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Colonne Droite : Architecture & Statut */}
                <div className="space-y-6">
                    <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <Database className="w-4 h-4 text-gray-500" />
                            <div>
                                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider">
                                    Statut Stockage Supabase
                                </h3>
                                <p className="text-[11px] text-gray-400">
                                    Accès sécurisé géré par API serveur autorisée.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-gray-50/70 rounded-lg border border-gray-100 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Table cible :</span>
                                <code className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800">
                                    public.system_config
                                </code>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Clés actives :</span>
                                <span className="font-mono font-bold text-gray-950">{config.length} clés chargées</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Contrôle d'accès :</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Service Role Protégé
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-gray-100 shadow-none rounded-xl bg-gray-50/50 p-5 text-center space-y-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center mx-auto text-gray-500 shadow-2xs">
                            <Lock className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-950">Sécurité des Secrets Financiers</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed max-w-sm mx-auto">
                                Les clés d'API sensibles (GeniusPay Secret Key, Webhook Tokens, Clés privées VAPID) restent confinées dans les variables d'environnement serveur.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Dialogue de confirmation minimaliste */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl border border-gray-200 bg-white shadow-xl p-5">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-100 text-gray-900">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-sm font-bold text-gray-950">
                                {confirmConfig.title || 'Confirmation requise'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500 leading-relaxed">
                                {confirmConfig.message || 'Veuillez confirmer cette opération.'}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsConfirmOpen(false)}
                            className="h-8 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg"
                        >
                            Annuler
                        </Button>
                        <Button
                            size="sm"
                            onClick={confirmConfig.action}
                            className="h-8 text-xs font-medium rounded-lg px-3 bg-gray-950 hover:bg-black text-white shadow-xs"
                        >
                            Confirmer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
