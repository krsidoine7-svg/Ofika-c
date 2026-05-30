'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Package, Save, Loader2, CreditCard, Truck, Globe, Sparkles, Plus, Trash2, Edit3, Settings2 } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { toast } from "sonner"
import { motion } from 'framer-motion'

export default function AdminProductsPage() {
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState(false)
    const [config, setConfig] = React.useState<any>(null)
    const supabase = createClient()

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('pricing_config')
                .select('*')
                .eq('id', 'default')
                .maybeSingle()

            if (error) throw error
            
            if (!data) {
                // Créer une config par défaut si elle n'existe pas
                const defaultConfig = {
                    id: 'default',
                    nfc_card_base_price: 14600,
                    premium_supplement: 5000,
                    shipping_uemoa: 2000,
                    shipping_west_africa: 5000,
                    shipping_international: 10000,
                    currency: 'XOF',
                    updated_at: new Date().toISOString()
                }
                
                const { data: inserted, error: insertError } = await supabase
                    .from('pricing_config')
                    .insert([defaultConfig])
                    .select()
                    .single()
                
                if (insertError) {
                    console.error("Erreur d'initialisation:", insertError)
                    throw new Error("Impossible d'initialiser la configuration. Vérifiez que la table 'pricing_config' existe.")
                }
                setConfig(inserted)
            } else {
                setConfig(data)
            }
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Échec du chargement de la configuration")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchConfig()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('pricing_config')
                .update({
                    nfc_card_base_price: config.nfc_card_base_price,
                    premium_supplement: config.premium_supplement,
                    shipping_uemoa: config.shipping_uemoa,
                    shipping_west_africa: config.shipping_west_africa,
                    shipping_international: config.shipping_international,
                    updated_at: new Date().toISOString()
                })
                .eq('id', 'default')

            if (error) throw error
            toast.success("Configuration mise à jour avec succès")
        } catch (err) {
            console.error(err)
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
    if (!config) return <div className="flex h-[400px] items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">Erreur: Configuration introuvable dans la base de données.</div>

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[10px] tracking-widest px-3 py-1">
                                LOGISTIQUE & TARIFS
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Produits & Configuration</h1>
                        <p className="text-gray-500 font-medium max-w-xl">
                            Gérez votre catalogue de cartes NFC, ajustez les prix de base et les frais de livraison internationaux.
                        </p>
                    </div>
                    <Button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gray-900 hover:bg-black text-white rounded-2xl h-14 px-8 font-black text-xs tracking-widest gap-2 shadow-xl hover:scale-105 transition-all"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        ENREGISTRER LES MODIFS
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Pricing Configuration */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Settings2 className="w-5 h-5 text-orange-500" />
                        Configuration des Tarifs
                    </h3>
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Prix de Base (PVC)</label>
                                    <div className="relative">
                                        <Input 
                                            type="number"
                                            value={config.nfc_card_base_price}
                                            onChange={(e) => setConfig({...config, nfc_card_base_price: parseInt(e.target.value)})}
                                            className="h-14 pl-12 rounded-2xl border-gray-100 font-bold bg-gray-50/30"
                                        />
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">XOF</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Supplément Premium</label>
                                    <div className="relative">
                                        <Input 
                                            type="number"
                                            value={config.premium_supplement}
                                            onChange={(e) => setConfig({...config, premium_supplement: parseInt(e.target.value)})}
                                            className="h-14 pl-12 rounded-2xl border-gray-100 font-bold bg-gray-50/30"
                                        />
                                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">XOF</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-50" />

                            <div className="space-y-6">
                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Zones de Livraison</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-gray-900">Zone UEMOA</p>
                                            <p className="text-[10px] font-bold text-gray-400">CI, SN, BJ, BF, TG, NE, ML, GW</p>
                                        </div>
                                        <Input 
                                            type="number"
                                            value={config.shipping_uemoa}
                                            onChange={(e) => setConfig({...config, shipping_uemoa: parseInt(e.target.value)})}
                                            className="w-32 h-10 rounded-lg border-gray-200 text-right font-black"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-gray-900">Afrique de l'Ouest</p>
                                            <p className="text-[10px] font-bold text-gray-400">Hors UEMOA (GH, NG, CM...)</p>
                                        </div>
                                        <Input 
                                            type="number"
                                            value={config.shipping_west_africa}
                                            onChange={(e) => setConfig({...config, shipping_west_africa: parseInt(e.target.value)})}
                                            className="w-32 h-10 rounded-lg border-gray-200 text-right font-black"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-gray-900">International</p>
                                            <p className="text-[10px] font-bold text-gray-400">Reste du monde</p>
                                        </div>
                                        <Input 
                                            type="number"
                                            value={config.shipping_international}
                                            onChange={(e) => setConfig({...config, shipping_international: parseInt(e.target.value)})}
                                            className="w-32 h-10 rounded-lg border-gray-200 text-right font-black"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Products Preview / Management */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Package className="w-5 h-5 text-gray-400" />
                            Catalogue Produits
                        </h3>
                        <Button variant="ghost" className="text-orange-600 font-black text-xs tracking-widest gap-2">
                            <Plus className="w-4 h-4" />
                            AJOUTER
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { id: 1, name: "Ofika Card Classic", material: "PVC Premium", price: config.nfc_card_base_price, badge: "Best Seller" },
                            { id: 2, name: "Ofika Card Wood", material: "Noyer / Bambou", price: config.nfc_card_base_price + config.premium_supplement, badge: "Eco-Friendly" },
                            { id: 3, name: "Ofika Card Metal", material: "Acier Inoxydable", price: config.nfc_card_base_price + config.premium_supplement, badge: "Prestige" }
                        ].map((prod) => (
                            <Card key={prod.id} className="border-none shadow-sm rounded-3xl bg-white p-6 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-28 rounded-xl bg-gray-900 flex items-center justify-center text-white shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full" />
                                        <div className="w-10 h-1 bg-white/20 rounded-full" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-gray-900 uppercase tracking-tight">{prod.name}</h4>
                                            <Badge className="bg-orange-50 text-orange-600 border-none text-[8px] uppercase">{prod.badge}</Badge>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{prod.material}</p>
                                        <p className="text-lg font-black text-orange-600 pt-1">{prod.price.toLocaleString()} XOF</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-gray-900"><Edit3 className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="p-8 bg-orange-50/50 rounded-[2.5rem] border border-dashed border-orange-100 flex flex-col items-center text-center space-y-4">
                         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-orange-500 shadow-sm">
                            <Plus className="w-8 h-8" />
                         </div>
                         <div>
                            <p className="font-black text-gray-900 uppercase tracking-tight">Ajouter un produit</p>
                            <p className="text-xs text-gray-400 font-medium">Coming soon: Gestion complète de l'inventaire physique</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
