'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreditCard, Wallet, Smartphone, Globe, Plus, ToggleLeft as Toggle, Settings, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight, Shield } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { Badge } from "@/components/ui/badge"
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
import { AlertTriangle } from "lucide-react"
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
    const supabase = createClient()

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

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newMethod, setNewMethod] = useState({
        id: '',
        name: '',
        provider: 'custom',
        description: '',
        fees: 0,
        currency: 'XOF'
    })

    const openConfirm = (title: string, message: string, action: () => void, variant: 'default' | 'destructive' = 'default') => {
        setConfirmConfig({ title, message, action, variant })
        setIsConfirmOpen(true)
    }

    useEffect(() => {
        fetchPaymentMethods()
        fetchBasePrice()
    }, [])

    const fetchBasePrice = async () => {
        try {
            const res = await fetch('/api/admin/config?key=pricing_config')
            const json = await res.json()
            let price = json?.data?.value?.nfc_card_base_price

            if (!price) {
                // Secours : vérifier dans /api/payments/methods
                const methodsRes = await fetch('/api/payments/methods')
                const methodsJson = await methodsRes.json()
                price = methodsJson?.methods?.[0]?.base_price
            }

            if (price) {
                setDbBasePrice(price)
                setEditingPriceInput(price.toString())
            }
        } catch (e) {
            console.error('Erreur chargement prix de base BD:', e)
        }
    }

    const saveBasePrice = async () => {
        const parsed = parseInt(editingPriceInput, 10)
        if (isNaN(parsed) || parsed <= 0) {
            toast.error('Montant invalide')
            return
        }
        try {
            setIsSavingPrice(true)
            
            // 1. Sauvegarder dans pricing_config via l'API Admin (bypass RLS)
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

            // 2. Synchroniser également dans payment_gateways (geniuspay)
            await fetch('/api/payments/methods', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 'geniuspay', base_price: parsed })
            })

            setDbBasePrice(parsed)
            toast.success(`Prix de base mis à jour dans la BD Supabase : ${parsed.toLocaleString('fr-FR')} FCFA`)
        } catch (err: any) {
            console.error('Erreur sauvegarde prix:', err)
            toast.error(err?.message || 'Erreur lors de la sauvegarde du prix')
        } finally {
            setIsSavingPrice(false)
        }
    }

    const fetchPaymentMethods = React.useCallback(async () => {
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
            toast.error('Impossible de charger les méthodes de paiement')
        } finally {
            setLoading(false)
        }
    }, [])

    const toggleMethodStatus = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/payments/methods', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !currentStatus })
            })
            const data = await response.json()
            if (data.success) {
                setMethods(methods.map(m => m.id === id ? { ...m, is_active: !currentStatus } : m))
                toast.success(`Méthode ${!currentStatus ? 'activée' : 'désactivée'} avec succès`)
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
                setMethods(methods.map(m => m.id === id ? { ...m, ...updates } : m))
                toast.success('Configuration mise à jour')
            } else {
                throw new Error(data.error)
            }
        } catch (err) {
            toast.error('Erreur de configuration')
        }
    }

    const createMethod = React.useCallback(async () => {
        if (!newMethod.id || !newMethod.name) {
            toast.error('ID et Nom requis')
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
                toast.success('Fournisseur ajouté (inactif par défaut)')
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
        } catch (err) {
            toast.error('Erreur lors de l\'ajout')
        }
    }, [newMethod, fetchPaymentMethods])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Carte de Tarification Système (Hiérarchie à 2 Niveaux) */}
            <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-orange-50/60 via-white to-orange-50/30 border border-orange-100/60 overflow-hidden">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-md shadow-orange-200">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Tarification Système (Architecture à 2 Niveaux)</CardTitle>
                                <CardDescription className="text-xs text-gray-500 font-medium mt-0.5">
                                    Le tarif est géré directement depuis la Base de Données Supabase avec une valeur de secours ultime.
                                </CardDescription>
                            </div>
                        </div>

                        {/* Formulaire de modification rapide du Niveau 1 (BD) */}
                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-orange-100 shadow-sm">
                            <Label className="text-xs font-bold text-gray-400 pl-2 uppercase tracking-wider">Prix BD (Niv. 1) :</Label>
                            <Input
                                type="number"
                                value={editingPriceInput}
                                onChange={(e) => setEditingPriceInput(e.target.value)}
                                className="w-28 h-9 text-sm font-black text-orange-600 rounded-xl border-gray-100"
                                placeholder="14600"
                            />
                            <Button
                                size="sm"
                                onClick={saveBasePrice}
                                disabled={isSavingPrice}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 px-4 rounded-xl"
                            >
                                {isSavingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Niveau 1 */}
                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">🥇 Niveau 1 (BD Supabase - Source Principale)</span>
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Prix dynamique lu depuis la table <code className="text-[10px] font-bold bg-gray-100 px-1 py-0.5 rounded">system_config</code> (clé <code className="text-[10px] font-bold bg-gray-100 px-1 py-0.5 rounded">pricing_config</code>).</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100">
                                <span className="text-lg font-black text-gray-900">{dbBasePrice ? `${dbBasePrice.toLocaleString('fr-FR')} FCFA` : 'Non défini (Fall back vers Niv 2)'}</span>
                            </div>
                        </div>

                        {/* Niveau 2 */}
                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">🥈 Niveau 2 (Secours Codé en Dur)</span>
                                    <Shield className="w-4 h-4 text-purple-500" />
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Valeur de sécurité ultime intégrée au code si la base de données est indisponible.</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100">
                                <span className="text-lg font-black text-gray-900">14 600 FCFA</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight uppercase">Passerelles de Paiement Actives</h3>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 sm:h-11 px-4 sm:px-6 rounded-xl shadow-lg shadow-orange-100 flex items-center justify-center text-xs sm:text-sm">
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 shrink-0" />
                            Ajouter un Fournisseur
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Nouvelle Passerelle</DialogTitle>
                            <DialogDescription className="font-medium text-gray-500">
                                Ajoutez un nouveau fournisseur de paiement à votre plateforme.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">ID Unique (Slug)</Label>
                                    <Input 
                                        placeholder="om_sn, stripe, etc" 
                                        value={newMethod.id}
                                        onChange={(e) => setNewMethod({...newMethod, id: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                                        className="rounded-xl border-gray-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Nom Public</Label>
                                    <Input 
                                        placeholder="Orange Money SN" 
                                        value={newMethod.name}
                                        onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                                        className="rounded-xl border-gray-100"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</Label>
                                <Input 
                                    placeholder="Paiement via USSD ou Application" 
                                    value={newMethod.description}
                                    onChange={(e) => setNewMethod({...newMethod, description: e.target.value})}
                                    className="rounded-xl border-gray-100"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Frais (%)</Label>
                                    <Input 
                                        type="number"
                                        value={newMethod.fees}
                                        onChange={(e) => setNewMethod({...newMethod, fees: parseFloat(e.target.value)})}
                                        className="rounded-xl border-gray-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Devise</Label>
                                    <Input 
                                        placeholder="XOF" 
                                        value={newMethod.currency}
                                        onChange={(e) => setNewMethod({...newMethod, currency: e.target.value})}
                                        className="rounded-xl border-gray-100 uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-3">
                            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-8" onClick={createMethod}>
                                Créer le Fournisseur
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {methods.map((method) => (
                    <Dialog key={method.id}>
                        <Card className={cn(
                            "border-none shadow-sm overflow-hidden rounded-2xl transition-all hover:shadow-md",
                            !method.is_active && "opacity-60 bg-gray-50/50"
                        )}>
                            <div className={cn("h-1.5 w-full", method.is_active ? "bg-orange-500" : "bg-gray-300")}></div>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center">
                                    <div className={cn("p-2 rounded-xl mr-3", method.is_active ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-400")}>
                                        {method.provider === 'lygos' ? <Smartphone className="w-6 h-6" /> : 
                                         method.provider === 'wave' ? <Wallet className="w-6 h-6" /> : 
                                         <CreditCard className="w-6 h-6" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">{method.name}</CardTitle>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{method.provider}</span>
                                    </div>
                                </div>
                                <Badge variant={method.is_active ? "default" : "secondary"} className={cn(
                                    "text-[10px] font-black uppercase px-2 py-0.5",
                                    method.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-200 text-gray-500"
                                )}>
                                    {method.is_active ? 'ACTIF' : 'INACTIF'}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-500 font-medium leading-relaxed min-h-[40px]">
                                    {method.description}
                                </p>

                                <div className="flex items-center justify-between py-3 border-y border-gray-50 font-bold text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Frais</span>
                                        <span className="text-gray-900">{method.fees || 0}%</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Devise</span>
                                        <span className="text-gray-900 font-black">{method.currency}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-gray-900 px-0 h-auto font-bold text-xs flex items-center"
                                        >
                                            <Settings className="w-4 h-4 mr-1.5" />
                                            Configurer
                                        </Button>
                                    </DialogTrigger>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xs font-bold text-gray-400">{method.is_active ? 'Désactiver' : 'Activer'}</span>
                                        <div
                                            className={cn(
                                                "w-10 h-5 rounded-full p-1 cursor-pointer transition-colors flex items-center",
                                                method.is_active ? "bg-green-500" : "bg-gray-300"
                                            )}
                                            onClick={() => openConfirm(
                                                method.is_active ? "Désactiver ce paiement ?" : "Activer ce paiement ?",
                                                method.is_active ? `Les utilisateurs ne pourront plus utiliser ${method.name} pour leurs achats.` : `Les utilisateurs pourront payer via ${method.name} sur toute la plateforme.`,
                                                () => toggleMethodStatus(method.id, method.is_active),
                                                method.is_active ? 'destructive' : 'default'
                                            )}
                                        >
                                            <div className={cn(
                                                "w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200",
                                                method.is_active ? "translate-x-5" : "translate-x-0"
                                            )}></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <DialogContent className="max-w-md rounded-2xl p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase tracking-tight">Configuration {method.name}</DialogTitle>
                                <DialogDescription className="font-medium text-gray-500">
                                    Modifiez les paramètres de frais et de devise pour {method.name}.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {method.provider === 'wave' ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Merchant ID Wave</Label>
                                            <Input
                                                defaultValue={method.merchant_id}
                                                onChange={(e) => method.merchant_id = e.target.value}
                                                className="rounded-xl border-gray-100 font-mono"
                                                placeholder="M_ci_..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Code Pays</Label>
                                                <Input
                                                    defaultValue={method.country_code}
                                                    onChange={(e) => method.country_code = e.target.value}
                                                    className="rounded-xl border-gray-100 uppercase"
                                                    placeholder="ci"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Frais (%)</Label>
                                                <Input
                                                    type="number"
                                                    defaultValue={method.fees || 0}
                                                    onChange={(e) => method.fees = parseFloat(e.target.value)}
                                                    className="rounded-xl border-gray-100"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Devise</Label>
                                                <Input
                                                    defaultValue={method.currency}
                                                    onChange={(e) => method.currency = e.target.value}
                                                    className="rounded-xl border-gray-100 uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Frais (%)</Label>
                                            <Input
                                                type="number"
                                                defaultValue={method.fees}
                                                onChange={(e) => method.fees = parseFloat(e.target.value)}
                                                className="rounded-xl border-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Devise</Label>
                                            <Input
                                                defaultValue={method.currency}
                                                onChange={(e) => method.currency = e.target.value}
                                                className="rounded-xl border-gray-100 uppercase"
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <p className="text-[10px] text-orange-700 font-bold leading-tight">
                                        <AlertCircle className="w-3 h-3 inline mr-1 mb-0.5" />
                                        La configuration des clés API se fait via les variables d'environnement pour plus de sécurité.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="sm:justify-between gap-3">
                                <Button variant="ghost" className="rounded-xl font-bold" type="button">Annuler</Button>
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-8" 
                                    onClick={() => updateConfig(method.id, { 
                                        fees: method.fees, 
                                        currency: method.currency,
                                        merchant_id: method.merchant_id,
                                        country_code: method.country_code
                                    })}>
                                    Enregistrer
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>


            {/* Modal de Confirmation Générique */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg",
                            confirmConfig.variant === 'destructive' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                        )}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-black text-gray-900 mb-2">{confirmConfig.title}</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium leading-relaxed">
                            {confirmConfig.message}
                        </DialogDescription>
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
                                "rounded-xl font-black uppercase tracking-widest flex-1 h-12 shadow-md",
                                confirmConfig.variant === 'destructive' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"
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
