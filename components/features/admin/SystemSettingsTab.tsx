'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Settings,
    Save,
    RefreshCcw,
    Globe,
    Palette,
    Shield,
    Mail,
    Lock,
    Loader2,
    Wallet,
    CreditCard,
    CheckCircle2,
    AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export function SystemSettingsTab() {
    const [config, setConfig] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // État spécifique pour la tarification officielle BD
    const [cardBasePriceInput, setCardBasePriceInput] = useState<string>('14600')

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
    }, [])

    async function fetchConfig() {
        try {
            setLoading(true)
            // Utiliser l'API Admin (Bypass RLS)
            const res = await fetch('/api/admin/config')
            const json = await res.json()

            if (!res.ok || json.error) throw new Error(json.error || 'Erreur chargement')
            const items = json.data || []
            setConfig(items)

            // Extraire le prix de base de la carte si présent
            const pricingItem = items.find((item: any) => item.key === 'pricing_config')
            if (pricingItem?.value?.nfc_card_base_price) {
                setCardBasePriceInput(pricingItem.value.nfc_card_base_price.toString())
            }
        } catch (error) {
            console.error('Erreur chargement config admin:', error)
            toast.error("Erreur de chargement de la configuration système")
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(key: string, value: any) {
        try {
            setIsSaving(true)
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            })
            const json = await res.json()

            if (!res.ok || json.error) throw new Error(json.error || 'Erreur d\'enregistrement')
            
            // Si on sauvegarde pricing_config, synchroniser aussi avec /api/payments/methods
            if (key === 'pricing_config' && value?.nfc_card_base_price) {
                await fetch('/api/payments/methods', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'geniuspay', base_price: value.nfc_card_base_price })
                })
            }

            toast.success(`Configuration "${key.replace('_', ' ')}" mise à jour dans la BD Supabase`)
            fetchConfig()
        } catch (error: any) {
            console.error('Erreur sauvegarde config admin:', error)
            toast.error(error?.message || "Erreur d'enregistrement")
        } finally {
            setIsSaving(false)
            setIsConfirmOpen(false)
        }
    }

    const saveBasePrice = () => {
        const parsed = parseInt(cardBasePriceInput, 10)
        if (isNaN(parsed) || parsed <= 0) {
            toast.error('Montant invalide')
            return
        }
        openConfirm(
            "Mettre à jour le prix de la carte ?",
            `Le nouveau tarif officiel de ${parsed.toLocaleString('fr-FR')} FCFA sera enregistré dans la table BD Supabase et appliqué immédiatement.`,
            () => handleSave('pricing_config', { nfc_card_base_price: parsed })
        )
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[350px]">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Layout 2 Colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLONNE GAUCHE */}
                <div className="space-y-8">
                    {/* Dynamic System Config Keys */}
                    {config.filter(c => c.key !== 'pricing_config').map((item) => (
                        <Card key={item.key} className="border-none shadow-sm overflow-hidden rounded-2xl">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        {item.key === 'platform_settings' ? <Globe className="w-4 h-4 text-blue-500" /> : <Palette className="w-4 h-4 text-purple-500" />}
                                        {item.key.replace('_', ' ').toUpperCase()}
                                    </CardTitle>
                                    <Button
                                        size="sm"
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-8 rounded-lg"
                                        onClick={() => openConfirm(
                                            "Enregistrer les modifications ?",
                                            `Voulez-vous appliquer ces nouveaux paramètres pour "${item.key.replace('_', ' ')}" dans la base de données Supabase ?`,
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
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {Object.entries(val).map(([subKey, subVal]: [string, any]) => (
                                                        <div key={subKey} className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
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
                </div>

                {/* COLONNE DROITE */}
                <div className="space-y-8">
                    {/* CARTE 3 : Information et Statut du Système */}
                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-blue-50/40 border-b border-blue-100/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900">
                                <Settings className="w-5 h-5 text-blue-600" />
                                Statut de la Configuration Serveur
                            </CardTitle>
                            <CardDescription className="text-xs text-blue-600 font-medium">
                                Les configurations ci-dessous utilisent l'API Admin sécurisée avec contournement de RLS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-sm">
                            <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Table Supabase :</span>
                                    <code className="font-bold text-orange-600 bg-white px-2 py-0.5 rounded border border-gray-200">public.system_config</code>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Clés Chargées :</span>
                                    <span className="font-black text-gray-900">{config.length} clés configurées</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Authentification API :</span>
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Service Role Key (Protégée)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CARTE 4 : Sécurité & Secrets d'API */}
                    <Card className="border-dashed border-2 border-gray-200 shadow-none rounded-2xl bg-gray-50/50">
                        <CardContent className="p-8 text-center space-y-4">
                            <Lock className="w-10 h-10 text-gray-300 mx-auto" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-900">Sécurité & Secrets d'API</h3>
                                <p className="text-xs text-gray-500 max-w-md mx-auto italic">
                                    Les secrets d'API (GeniusPay SK, Webhook Secret, VAPID Private Key) sont stockés de manière sécurisée dans les variables d'environnement du serveur et ne sont jamais exposés au client.
                                </p>
                            </div>
                            <Button variant="secondary" className="font-bold text-xs rounded-xl" disabled>
                                <Shield className="w-4 h-4 mr-2" />
                                Clés Protégées
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de Confirmation Générique */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg bg-orange-100 text-orange-600">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{confirmConfig.title}</h3>
                        <p className="text-gray-500 font-medium leading-relaxed text-sm">
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
                            className="rounded-xl font-black uppercase tracking-widest flex-1 h-12 shadow-md bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            Confirmer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
