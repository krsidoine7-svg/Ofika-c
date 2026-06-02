'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/core/ui/dialog"
import { Button } from "@/components/core/ui/button"
import { CreditCard, Sparkles, ArrowRight, ShieldCheck, Wifi, QrCode } from "lucide-react"
import { useRouter } from "next/navigation"

interface OrderPromptModalProps {
    hasOrders: boolean
    isLoading: boolean
}

export function OrderPromptModal({ hasOrders, isLoading }: OrderPromptModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Afficher la modale après un court délai si l'utilisateur n'a pas de commande
        if (!isLoading && !hasOrders) {
            const hasSeenPrompt = sessionStorage.getItem('hasSeenOrderPrompt')
            if (!hasSeenPrompt) {
                const timer = setTimeout(() => {
                    setIsOpen(true)
                    sessionStorage.setItem('hasSeenOrderPrompt', 'true')
                }, 2000)
                return () => clearTimeout(timer)
            }
        }
    }, [hasOrders, isLoading])

    const handleOrderNow = () => {
        setIsOpen(false)
        router.push('/dashboard/orders/new')
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border border-neutral-100 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] bg-white">
                {/* Injection de styles personnalisés pour les animations haute-fidélité */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-8px) rotate(1deg); }
                    }
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                `}} />

                {/* En-tête : Rendu Studio Premium de la Carte NFC */}
                <div className="relative h-56 bg-gradient-to-b from-[#0a0d14] via-[#121620] to-[#090b10] flex items-center justify-center overflow-hidden border-b border-neutral-900">
                    {/* Source lumineuse d'ambiance */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-orange-600/25 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Grille géométrique moderne en arrière-plan */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                    
                    {/* Carte NFC de Luxe interactive */}
                    <div className="relative z-10" style={{ animation: 'float 5s ease-in-out infinite' }}>
                        <div className="relative w-60 h-36 rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-neutral-700/50 flex flex-col justify-between overflow-hidden group select-none transition-all duration-500 hover:shadow-[0_20px_40px_rgba(249,115,22,0.2)] hover:border-orange-500/30 transform hover:-translate-y-1">
                            {/* Reflet de brillance brillante lors du survol */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                            
                            {/* Vagues métalliques de fond */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none rounded-full" />
                            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-600/10 via-transparent to-transparent pointer-events-none rounded-full" />

                            {/* Haut de la carte : Puce & NFC */}
                            <div className="flex justify-between items-start">
                                {/* Puce Dorée Réaliste */}
                                <div className="w-9 h-7 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 p-[1px] shadow-sm relative overflow-hidden flex items-center justify-center">
                                    <div className="w-full h-full border border-amber-900/15 rounded-[4px] relative flex flex-col justify-between p-1">
                                        <div className="h-[1px] w-full bg-amber-950/20" />
                                        <div className="h-full w-[1px] bg-amber-950/20 absolute left-1/2 top-0" />
                                        <div className="h-[1px] w-full bg-amber-950/20" />
                                    </div>
                                </div>
                                {/* Symbole de transmission NFC */}
                                <div className="flex flex-col items-center">
                                    <Wifi className="w-5 h-5 text-neutral-450 transform rotate-90" />
                                </div>
                            </div>

                            {/* Bas de la carte : Branding */}
                            <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                    <div className="text-[8px] uppercase tracking-widest text-neutral-500 font-semibold">Ofika Card</div>
                                    <div className="text-[10px] font-mono tracking-wider text-neutral-300">★★★★ PREMIUM</div>
                                </div>
                                {/* Logo Ofika or brillant */}
                                <div className="text-xs font-bold tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                                    OFIKA
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corps de la modale */}
                <div className="p-8 text-center space-y-6">
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                            Révolutionnez votre <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Networking</span>
                        </DialogTitle>
                        <DialogDescription className="text-neutral-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                            Partagez votre profil professionnel et vos réseaux en un seul geste grâce à la technologie NFC Ofika.
                        </DialogDescription>
                    </div>

                    {/* Caractéristiques de la carte sous forme de badges haut de gamme */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left py-1">
                        <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-100 rounded-2xl transition-all duration-300 group/item hover:shadow-sm">
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 group-hover/item:scale-110 transition-transform duration-300">
                                <Wifi className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-neutral-800">Technologie NFC</span>
                                <span className="text-[10px] text-neutral-400 font-medium">Sans contact instantané</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-100 rounded-2xl transition-all duration-300 group/item hover:shadow-sm">
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover/item:scale-110 transition-transform duration-300">
                                <QrCode className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-neutral-800">QR Code Dynamique</span>
                                <span className="text-[10px] text-neutral-400 font-medium">Toujours à jour</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button 
                            variant="ghost" 
                            className="flex-1 h-12 rounded-2xl font-semibold text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-all duration-300"
                            onClick={() => setIsOpen(false)}
                        >
                            Plus tard
                        </Button>
                        <Button 
                            className="relative overflow-hidden flex-[2] h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold tracking-wide shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group/btn"
                            onClick={handleOrderNow}
                        >
                            {/* Effet brillant de survol par shimmer */}
                            <div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                                style={{
                                    animation: 'shimmer 3s infinite',
                                }}
                            />
                            <span className="relative z-10 flex items-center gap-2">
                                Commander ma carte
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
