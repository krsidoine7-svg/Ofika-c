'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
    Cpu, 
    CreditCard, 
    ShieldAlert, 
    Loader2, 
    Database,
    Zap,
    Lock,
    Save,
    RotateCw,
    Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function AdvancedConfigTab() {
    const [gateways, setGateways] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [rawConfig, setRawConfig] = useState("")

    const fetchConfig = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/config?key=payment_gateways')
            const json = await res.json()
            if (json.success) {
                setGateways(json.data.value)
                setRawConfig(JSON.stringify(json.data.value, null, 2))
            }
        } catch (err) {
            toast.error("Erreur lors de la récupération des passerelles")
        } finally {
            setLoading(false)
        }
    }, [])

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
                toast.success("Configuration brute mise à jour")
                setGateways(parsed)
                setIsEditing(false)
            } else {
                toast.error(json.error || "Erreur lors de l'enregistrement")
            }
        } catch (err) {
            toast.error("Format JSON invalide. Vérifiez la syntaxe.")
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        fetchConfig()
    }, [fetchConfig])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <p className="text-xs text-gray-400 font-medium">Chargement des données de configuration...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-950 tracking-tight">
                        Diagnostic Passerelles & Schéma JSON
                    </h2>
                    <p className="text-xs text-gray-500">
                        Visualisation et modification avancée de la clé Supabase <code className="font-mono text-[11px] bg-gray-100 px-1 py-0.5 rounded text-gray-800">payment_gateways</code>.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchConfig}
                    className="h-8 text-xs font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg gap-1.5"
                >
                    <RotateCw className="w-3.5 h-3.5 text-gray-400" />
                    <span>Actualiser</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Structure brute JSON */}
                <Card className="border border-gray-100 shadow-none rounded-xl bg-white overflow-hidden p-5 flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-500" />
                                <h3 className="text-xs font-bold font-mono text-gray-950 uppercase tracking-wider">
                                    Processeurs de Paiement (JSON)
                                </h3>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                                className="h-7 text-xs font-medium border-gray-200 rounded-md"
                            >
                                {isEditing ? "Annuler" : "Modifier le JSON"}
                            </Button>
                        </div>

                        {isEditing ? (
                            <div className="space-y-3 pt-3">
                                <textarea
                                    className="w-full h-72 bg-gray-950 text-gray-100 p-3.5 font-mono text-xs rounded-lg border border-gray-800 outline-none focus:ring-1 focus:ring-gray-700 leading-relaxed"
                                    value={rawConfig}
                                    onChange={(e) => setRawConfig(e.target.value)}
                                    spellCheck={false}
                                />
                                <Button
                                    size="sm"
                                    className="w-full bg-gray-950 hover:bg-black text-white text-xs font-medium h-8 rounded-lg shadow-xs gap-1.5"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>Enregistrer la configuration</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3 pt-3">
                                {gateways && Object.entries(gateways).map(([key, provider]: [string, any]) => (
                                    <div key={key} className="p-3.5 bg-gray-50/70 rounded-lg border border-gray-100 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-bold text-gray-950 uppercase">
                                                {key}
                                            </span>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border",
                                                provider.enabled
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                                    : "bg-gray-50 text-gray-500 border-gray-200/60"
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    provider.enabled ? "bg-emerald-500" : "bg-gray-400"
                                                )} />
                                                {provider.enabled ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-200/60">
                                            <div>
                                                <span className="text-[10px] text-gray-400 block font-semibold uppercase">Mode</span>
                                                <span className="font-medium text-gray-800">
                                                    {provider.mode === 'test' ? 'Sandbox' : 'Production'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 block font-semibold uppercase">Clé Publique</span>
                                                <span className="font-mono text-[11px] text-gray-600">
                                                    {provider.public_key || provider.client_id ? 'Configurée' : 'Non renseignée'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-gray-500" />
                            Accès restreint aux administrateurs
                        </span>
                        <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            SERVICE ROLE API
                        </span>
                    </div>
                </Card>

                {/* Sécurité et conformité */}
                <div className="space-y-6">
                    <Card className="border border-gray-100 shadow-none rounded-xl bg-white p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <Lock className="w-4 h-4 text-gray-500" />
                            <div>
                                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider">
                                    Conformité Financière & PCI DSS
                                </h3>
                                <p className="text-[11px] text-gray-400">
                                    Protection des données de paiement utilisateur.
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">
                            Pour des raisons strictes de conformité, aucun numéro de carte ou code secret bancaire n'est enregistré dans les bases de données locales. Les passerelles Wave et GeniusPay gèrent l'authentification des clients sur leurs canaux certifiés.
                        </p>
                    </Card>

                    <Card className="border border-gray-100 shadow-none rounded-xl bg-gray-50/50 p-5 space-y-2.5">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-gray-500" />
                            <h4 className="text-xs font-bold text-gray-950">Statut des Webhooks</h4>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Les notifications IPN (Instant Payment Notification) de Wave et GeniusPay sont traitées via les routes dédiées <code className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-800">/api/webhooks/...</code> avec validation de signature cryptographique.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
