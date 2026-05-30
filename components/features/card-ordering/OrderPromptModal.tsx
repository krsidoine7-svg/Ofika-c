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
import { CreditCard, Sparkles, ArrowRight, ShieldCheck } from "lucide-react"
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
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
                <div className="relative h-48 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center overflow-hidden">
                    {/* Eléments décoratifs en arrière-plan */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="relative z-10 text-center space-y-4">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl inline-block shadow-xl border border-white/30 animate-bounce [animation-duration:3s]">
                            <CreditCard className="w-12 h-12 text-white" />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3].map((i) => (
                                <Sparkles key={i} className={`w-4 h-4 text-orange-200 animate-pulse [animation-delay:${i * 200}ms]`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 text-center space-y-6">
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight leading-tight uppercase">
                            BOOSTEZ VOTRE NETWORKING AVEC VOTRE CARTE NFC
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium leading-relaxed">
                            Vous n'avez pas encore commandé votre carte physique Ofika ? 
                            Partagez votre profil en un seul contact et faites une impression mémorable.
                        </DialogDescription>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left py-2">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="mt-1 bg-green-100 p-1 rounded-full">
                                <ShieldCheck className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">Technologie NFC sans contact</span>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="mt-1 bg-green-100 p-1 rounded-full">
                                <ShieldCheck className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">QR Code dynamique inclus</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button 
                            variant="ghost" 
                            className="flex-1 h-12 rounded-2xl font-bold text-gray-500"
                            onClick={() => setIsOpen(false)}
                        >
                            Plus tard
                        </Button>
                        <Button 
                            className="flex-[2] h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                            onClick={handleOrderNow}
                        >
                            Commander maintenant
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
