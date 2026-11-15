'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    CreditCard,
    Wallet,
    Smartphone,
    Plus,
    Settings,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Shield,
    Check,
    Coins,
    Sparkles,
    AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PaymentMethod {
    id: string
    name: string
    provider: string
    is_active: boolean
    description: string
    fees?: number
    currency: string
    merchant_id?: string
    country_code?: string
}

export function PaymentMethodsTab() {
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [dbBasePrice, setDbBasePrice] = useState<number | null>(null)
    const [isSavingPrice, setIsSavingPrice] = useState(false)
    const [editingPriceInput, setEditingPriceInput] = useState<string>('')

    // États pour le dialogue de confirmation minimaliste
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string
        message: string
        action: () => Promise<void> | void
        variant: 'default' | 'destructive'
        confirmLabel?: string
    }>({
        title: '',
        message: '',
        action: () => {},
        variant: 'default',
        confirmLabel: 'Confirmer'
    })

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newMethod, setNewMethod] = useState({
        id: '',
        name: '',
        provider: 'custom',
        description: '',
        fees: 0,
        currency: 'XOF'
    })

    const openConfirm = (
        title: string,
        message: string,
        action: () => Promise<void> | void,
        variant: 'default' | 'destructive' = 'default',
        confirmLabel = 'Confirmer'
    ) => {
        setConfirmConfig({ title, message, action, variant, confirmLabel })
        setIsConfirmOpen(true)
    }

    const fetchBasePrice = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/config?key=pricing_config')
            const json = await res.json()
            let price = json?.data?.value?.nfc_card_base_price

            if (!price) {
                const methodsRes = await fetch('/api/payments/methods')
                const methodsJson = await methodsRes.json()
                price = methodsJson?.methods?.[0]?.base_price
            }

            if (price) {
                setDbBasePrice(price)
                setEditingPriceInput(price.toString())
            }
        } catch (e) {
            console.error('Erreur chargement prix de base:', e)
        }
    }, [])

    const fetchPaymentMethods = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/payments/methods')
            const data = await response.json()

            if (data.success) {
                setMethods(data.methods)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            console.error('Erreur fetch methods:', error)
            toast.error('Impossible de charger les passerelles de paiement')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPaymentMethods()
        fetchBasePrice()
    }, [fetchPaymentMethods, fetchBasePrice])

    const saveBasePrice = async () => {
        const parsed = parseInt(editingPriceInput, 10)
        if (isNaN(parsed) || parsed <= 0) {
            toast.error('Montant invalide')
            return
        }
        try {
            setIsSavingPrice(true)
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'pricing_config',
                    value: { nfc_card_base_price: parsed }
                })
            })
            const json = await res.json()
            if (!res.ok || json.error) throw new Error(json.error || 'Erreur sauvegarde')

            await fetch('/api/payments/methods', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 'geniuspay', base_price: parsed })
            })

            setDbBasePrice(parsed)
            toast.success(`Tarif officiel mis à jour : ${parsed.toLocaleString('fr-FR')} FCFA`)
        } catch (err: any) {
            console.error('Erreur sauvegarde prix:', err)
            toast.error(err?.message || 'Erreur lors de la sauvegarde du tarif')
        } finally {
            setIsSavingPrice(false)
        }
    }

    const toggleMethodStatus = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/payments/methods', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !currentStatus })
            })
            const data = await response.json()
            if (data.success) {
                setMethods(prev => prev.map(m => m.id === id ? { ...m, is_active: !currentStatus } : m))
                toast.success(`Passerelle ${!currentStatus ? 'activée' : 'désactivée'}`)
            } else {
                throw new Error(data.error)
            }
        } catch (err) {
            toast.error('Erreur lors de la mise à jour')
        } finally {
            setIsConfirmOpen(false)
        }
    }

    const updateConfig = async (id: string, updates: any) => {
        try {
            const response = await fetch('/api/payments/methods', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            })
            const data = await response.json()
            if (data.success) {
                setMethods(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
                toast.success('Configuration de la passerelle enregistrée')
            } else {
                throw new Error(data.error)
            }
        } catch (err) {
            toast.error('Erreur de configuration')
        }
    }

    const createMethod = async () => {
        if (!newMethod.id || !newMethod.name) {
            toast.error('Identifiant (slug) et Nom requis')
            return
        }
        try {
            const response = await fetch('/api/payments/methods', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newMethod, is_active: false })
            })
            const data = await response.json()
            if (data.success) {
                toast.success('Nouvelle passerelle ajoutée (inactive par défaut)')
                setIsAddOpen(false)
                fetchPaymentMethods()
                setNewMethod({
                    id: '',
                    name: '',
                    provider: 'custom',
                    description: '',
                    fees: 0,
                    currency: 'XOF'
                })
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            toast.error('Erreur lors de la création')
        }
    }

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'geniuspay':
                return <Smartphone className="w-4 h-4 text-emerald-600" />
            default:
                return <CreditCard className="w-4 h-4 text-gray-700" />
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <p className="text-xs text-gray-400 font-medium">Chargement des passerelles...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Carte de Tarification Système (Linear Bbox) */}
            <Card className="border border-gray-100 shadow-none rounded-xl bg-white overflow-hidden p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                Tarif Officiel Carte NFC
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Synchronisé Base Supabase
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Ce montant est la source de vérité pour tous les checkouts et le simulateur 3D. Clé : <code className="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">pricing_config.nfc_card_base_price</code>.
                        </p>
                    </div>

                    {/* Bloc d'édition rapide du prix */}
                    <div className="flex items-center gap-2.5 bg-gray-50/70 p-1.5 rounded-lg border border-gray-100 shrink-0">
                        <div className="flex items-center pl-2 gap-1.5">
                            <span className="text-[11px] font-semibold text-gray-400 uppercase">Tarif :</span>
                            <Input
                                type="number"
                                value={editingPriceInput}
                                onChange={(e) => setEditingPriceInput(e.target.value)}
                                className="w-28 h-8 text-xs font-mono font-bold text-gray-950 rounded-md border-gray-200 bg-white"
                                placeholder="14600"
                            />
                            <span className="text-xs font-semibold text-gray-500 pr-1">FCFA</span>
                        </div>
                        <Button
                            size="sm"
                            onClick={saveBasePrice}
                            disabled={isSavingPrice}
                            className="bg-gray-950 hover:bg-black text-white text-xs font-medium h-8 px-3 rounded-md shadow-xs gap-1.5"
                        >
                            {isSavingPrice ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Enregistrer</span>
                        </Button>
                    </div>
                </div>

                {/* Détails architecture à 2 niveaux */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="p-3 rounded-lg bg-gray-50/50 border border-gray-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Niveau 1 : Base de données
                            </span>
                            <span className="text-sm font-bold font-mono text-gray-950 tabular-nums">
                                {dbBasePrice ? `${dbBasePrice.toLocaleString('fr-FR')} FCFA` : 'Non configuré'}
                            </span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50/50 border border-gray-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Niveau 2 : Secours d'urgence (Code)
                            </span>
                            <span className="text-sm font-bold font-mono text-gray-600 tabular-nums">
                                14 600 FCFA
                            </span>
                        </div>
                        <Shield className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </Card>

            {/* 2. Liste des Passerelles de Paiement */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-bold text-gray-950 tracking-tight">
                            Passerelles de Paiement Actives
                        </h2>
                        <p className="text-xs text-gray-500">
                            Canaux de collecte configurés pour les achats de cartes et abonnements.
                        </p>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="bg-gray-950 hover:bg-black text-white text-xs font-medium h-8 px-3 rounded-lg shadow-xs gap-1.5 self-start sm:self-auto"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Ajouter une passerelle</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[420px] rounded-2xl border border-gray-200 bg-white p-5">
                            <DialogHeader>
                                <DialogTitle className="text-sm font-bold text-gray-950">
                                    Nouvelle Passerelle de Paiement
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-500">
                                    Définissez les informations de base du nouveau fournisseur.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3.5 py-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-semibold text-gray-600">ID (Slug unique)</Label>
                                        <Input
                                            placeholder="ex: orange_money"
                                            value={newMethod.id}
                                            onChange={(e) => setNewMethod({ ...newMethod, id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                            className="h-8 text-xs font-mono rounded-lg border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-semibold text-gray-600">Nom Public</Label>
                                        <Input
                                            placeholder="ex: Orange Money"
                                            value={newMethod.name}
                                            onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                                            className="h-8 text-xs rounded-lg border-gray-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-gray-600">Description</Label>
                                    <Input
                                        placeholder="Paiement mobile instantané sécurisé"
                                        value={newMethod.description}
                                        onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                                        className="h-8 text-xs rounded-lg border-gray-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-semibold text-gray-600">Frais (%)</Label>
                                        <Input
                                            type="number"
                                            value={newMethod.fees}
                                            onChange={(e) => setNewMethod({ ...newMethod, fees: parseFloat(e.target.value) || 0 })}
                                            className="h-8 text-xs font-mono rounded-lg border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-semibold text-gray-600">Devise</Label>
                                        <Input
                                            placeholder="XOF"
                                            value={newMethod.currency}
                                            onChange={(e) => setNewMethod({ ...newMethod, currency: e.target.value.toUpperCase() })}
                                            className="h-8 text-xs font-mono uppercase rounded-lg border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:justify-end pt-2 border-t border-gray-100">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAddOpen(false)}
                                    className="h-8 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={createMethod}
                                    className="bg-gray-950 hover:bg-black text-white text-xs font-medium h-8 px-4 rounded-lg shadow-xs"
                                >
                                    Créer la passerelle
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Bento Grid des passerelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {methods.map((method) => (
                        <Dialog key={method.id}>
                            <Card className={cn(
                                "border border-gray-100 shadow-none rounded-xl bg-white transition-colors hover:border-gray-200 p-4 flex flex-col justify-between",
                                !method.is_active && "bg-gray-50/40 opacity-75"
                            )}>
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                                {getProviderIcon(method.provider)}
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-950 leading-tight">
                                                    {method.name}
                                                </h3>
                                                <span className="text-[10px] font-mono text-gray-400">
                                                    {method.provider}
                                                </span>
                                            </div>
                                        </div>

                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border",
                                            method.is_active
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                                : "bg-gray-50 text-gray-500 border-gray-200/60"
                                        )}>
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                method.is_active ? "bg-emerald-500" : "bg-gray-400"
                                            )} />
                                            {method.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>

                                    <p className="text-[11px] text-gray-500 mt-3 line-clamp-2 leading-relaxed min-h-[32px]">
                                        {method.description || 'Aucune description disponible.'}
                                    </p>

                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
                                        <div>
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Frais</span>
                                            <span className="font-mono font-medium text-gray-900">{method.fees || 0}%</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Devise</span>
                                            <span className="font-mono font-bold text-gray-950">{method.currency}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 mt-2">
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs font-medium text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-md px-2 gap-1.5"
                                        >
                                            <Settings className="w-3.5 h-3.5 text-gray-400" />
                                            <span>Paramètres</span>
                                        </Button>
                                    </DialogTrigger>

                                    <button
                                        onClick={() => openConfirm(
                                            method.is_active ? "Désactiver ce paiement ?" : "Activer ce paiement ?",
                                            method.is_active
                                                ? `Les clients ne pourront plus choisir ${method.name} lors du règlement de leurs commandes.`
                                                : `La passerelle ${method.name} deviendra immédiatement disponible pour tous les règlements.`,
                                            () => toggleMethodStatus(method.id, method.is_active),
                                            method.is_active ? 'destructive' : 'default',
                                            method.is_active ? 'Désactiver' : 'Activer'
                                        )}
                                        className={cn(
                                            "w-9 h-5 rounded-full transition-colors relative focus:outline-none",
                                            method.is_active ? "bg-emerald-600" : "bg-gray-300"
                                        )}
                                        title={method.is_active ? "Désactiver" : "Activer"}
                                    >
                                        <span className={cn(
                                            "w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform shadow-xs",
                                            method.is_active ? "left-4.5" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </Card>

                            {/* Modal de configuration passerelle */}
                            <DialogContent className="sm:max-w-[420px] rounded-2xl border border-gray-200 bg-white p-5">
                                <DialogHeader>
                                    <DialogTitle className="text-sm font-bold text-gray-950">
                                        Configuration : {method.name}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-gray-500">
                                        Ajustez les paramètres opérationnels de cette méthode de paiement.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-3.5 py-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-gray-600">Frais prélevés (%)</Label>
                                            <Input
                                                type="number"
                                                defaultValue={method.fees || 0}
                                                onChange={(e) => { method.fees = parseFloat(e.target.value) || 0 }}
                                                className="h-8 text-xs font-mono rounded-lg border-gray-200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-semibold text-gray-600">Devise</Label>
                                            <Input
                                                defaultValue={method.currency}
                                                onChange={(e) => { method.currency = e.target.value.toUpperCase() }}
                                                className="h-8 text-xs font-mono uppercase rounded-lg border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-2">
                                        <Shield className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                        <p className="text-[11px] text-gray-500 leading-relaxed">
                                            Les clés d'API secrètes (API Key, Webhook Secret) sont chiffrées dans l'environnement serveur et ne transitent jamais sur le navigateur.
                                        </p>
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:justify-end pt-2 border-t border-gray-100">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => updateConfig(method.id, {
                                            fees: method.fees,
                                            currency: method.currency,
                                            merchant_id: method.merchant_id,
                                            country_code: method.country_code
                                        })}
                                        className="bg-gray-950 hover:bg-black text-white text-xs font-medium h-8 px-4 rounded-lg shadow-xs"
                                    >
                                        Enregistrer
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            </div>

            {/* 3. Dialogue de confirmation minimaliste */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl border border-gray-200 bg-white shadow-xl p-5">
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                            confirmConfig.variant === 'destructive' ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-900"
                        )}>
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
                            className={cn(
                                "h-8 text-xs font-medium rounded-lg px-3 text-white shadow-xs",
                                confirmConfig.variant === 'destructive'
                                    ? "bg-rose-600 hover:bg-rose-700"
                                    : "bg-gray-950 hover:bg-black"
                            )}
                        >
                            {confirmConfig.confirmLabel || 'Confirmer'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
