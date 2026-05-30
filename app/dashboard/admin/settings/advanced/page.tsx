'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import { 
    Cpu, 
    CreditCard, 
    LayoutTemplate, 
    ShieldAlert, 
    Loader2, 
    Database,
    Zap,
    Lock,
    Save,
    RefreshCw
} from "lucide-react"
import { Button } from "@/components/core/ui/button"
import { Badge } from "@/components/core/ui/badge"
import { toast } from "sonner"

export default function AdvancedConfigPage() {
    const [gateways, setGateways] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [rawConfig, setRawConfig] = useState("")

    const fetchConfig = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/config?key=payment_gateways')
            const json = await res.json()
            if (json.success) {
                setGateways(json.data.value)
                setRawConfig(JSON.stringify(json.data.value, null, 2))
            }
        } catch (err) {
            toast.error("Erreur de récupération des données")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const parsed = JSON.parse(rawConfig)
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'payment_gateways',
                    value: parsed
                })
            })
            const json = await res.json()
            if (json.success) {
                toast.success("Configuration mise à jour")
                setGateways(parsed)
                setIsEditing(false)
            } else {
                toast.error(json.error)
            }
        } catch (err) {
            toast.error("Format JSON invalide")
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        fetchConfig()
    }, [])

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" /></div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Cpu className="w-8 h-8 text-orange-500" />
                        Configuration Avancée
                    </h1>
                    <p className="text-gray-500 font-medium">Accès aux structures techniques normalement invisibles (Paiements, Widgets).</p>
                </div>
                <Button variant="outline" onClick={fetchConfig} className="rounded-xl font-bold text-xs uppercase tracking-widest">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Structure des Paiements */}
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="bg-gray-50/50 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Passerelles de Paiement</CardTitle>
                                    <CardDescription>Configuration brute des processeurs</CardDescription>
                                </div>
                            </div>
                            <Button 
                                variant={isEditing ? "destructive" : "outline"} 
                                size="sm" 
                                className="rounded-xl font-black text-[10px] uppercase"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? "Annuler" : "Modifier"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isEditing ? (
                            <div className="p-6 space-y-4">
                                <textarea 
                                    className="w-full h-80 bg-gray-900 text-green-400 p-4 font-mono text-xs rounded-2xl outline-none focus:ring-2 ring-orange-500"
                                    value={rawConfig}
                                    onChange={(e) => setRawConfig(e.target.value)}
                                />
                                <Button 
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs h-12 rounded-2xl"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Sauvegarder les modifications
                                </Button>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                {gateways && Object.entries(gateways).map(([key, provider]: [string, any]) => (
                                    <div key={key} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-orange-600 text-white border-none font-black text-[10px] uppercase">{key}</Badge>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${provider.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{provider.enabled ? 'Actif' : 'Inactif'}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-gray-400">Mode :</span>
                                                <span className="text-gray-900 font-bold">{provider.mode === 'test' ? '🚧 Sandbox' : '💰 Production'}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-gray-400">Client ID / Public Key :</span>
                                                <code className="bg-white px-2 py-0.5 rounded text-[10px] text-orange-600">
                                                    {provider.public_key || provider.client_id ? `CONFIGURÉ` : 'N/A'}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="bg-gray-900 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-orange-400">
                                <ShieldAlert className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Zone Hautement Sécurisée</span>
                            </div>
                            <Badge variant="outline" className="text-white/40 border-white/20 text-[8px]">SERVICE ROLE REQUIS</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Dashboard Widgets Schema */}
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="bg-gray-50/50 p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <LayoutTemplate className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Structure des Widgets</CardTitle>
                                <CardDescription>Organisation par défaut du dashboard client</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <div className="mt-1"><Zap className="w-4 h-4 text-blue-500" /></div>
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Les widgets sont dynamiques</p>
                                    <p className="text-xs text-blue-700 leading-relaxed mt-1">
                                        Chaque utilisateur peut réorganiser ses graphiques et raccourcis. L'admin définit ici les blocs disponibles par défaut.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <Database className="w-6 h-6 opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Stats Rapides</span>
                                </div>
                                <div className="p-4 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <Database className="w-6 h-6 opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Scan History</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-900">Accès aux Méthodes de Paiement Clients</h3>
                    <p className="text-sm text-gray-500 max-w-lg">
                        Pour des raisons de conformité PCI DSS, les informations de paiement sensibles ne sont jamais stockées en clair. Vous ne pouvez voir que les métadonnées (type de carte, expiration) via l'onglet <strong>Paiements</strong>.
                    </p>
                </div>
                <Button variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-sm">
                    En savoir plus sur la sécurité
                </Button>
            </div>
        </div>
    )
}
