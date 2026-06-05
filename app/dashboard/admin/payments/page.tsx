'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreditCard, Wallet, Smartphone, Globe, Plus, ToggleLeft as Toggle, Settings, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react"
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

export default function AdminPaymentsPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
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
    }, [])

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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Méthodes de Paiement</h1>
                    <p className="text-gray-500 font-medium">Configurez et gérez les options de paiement pour vos utilisateurs.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-orange-100 flex items-center">
                            <Plus className="w-5 h-5 mr-3" />
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

            {/* External Payment Providers Banner */}
            <Card className="border-none shadow-sm bg-gray-900 text-white overflow-hidden rounded-2xl p-8 relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center">
                            <Globe className="w-6 h-6 mr-3 text-orange-500" />
                            Intégrations Futures
                        </h2>
                        <p className="text-gray-400 font-medium">
                            Préparez l'expansion de votre plateforme en configurant vos passerelles de paiement. Les intégrations techniques sont prêtes pour vos clés API réelles.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-gray-800 text-green-400 border-none font-bold">LYGOS WEBHOOKS</Badge>
                        </div>
                    </div>
                    <Button className="bg-white text-gray-900 hover:bg-orange-50 border-none font-black h-12 px-8 rounded-xl shadow-xl flex items-center transition-all hover:-translate-y-1">
                        Accéder à la Doc API
                        <ArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                </div>
            </Card>
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
