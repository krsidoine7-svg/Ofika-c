'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/core/ui/card"
import { Loader2, CreditCard, AlertCircle, Wallet } from "lucide-react"
import { Button } from "@/components/core/ui/button"
import { toast } from "sonner"

function WaveRedirectContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(true)

    // Récupérer les paramètres
    const cardType = searchParams.get('type') || 'nfc_qr'
    const amount = searchParams.get('amount') || '14600'
    const orderId = searchParams.get('order_id')

    useEffect(() => {
        const createPaymentAndRedirect = async () => {
            try {
                setIsProcessing(true)

                if (!orderId) {
                    throw new Error('ID de commande manquant')
                }

                console.log('🚀 Génération du lien Wave Direct...', { orderId, amount })

                // Appeler l'API pour créer le paiement Wave
                const response = await fetch('/api/payments/wave/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: parseInt(amount),
                        order_id: orderId
                    }),
                })

                const data = await response.json()

                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Erreur lors de la génération du lien Wave')
                }

                console.log('✅ Lien Wave généré:', data.data.link)

                // Rediriger vers le lien Wave Merchant
                if (data.data?.link) {
                    toast.success('Redirection vers Wave...')
                    window.location.href = data.data.link
                } else {
                    throw new Error('Lien de paiement manquant')
                }

            } catch (err) {
                console.error('❌ Erreur:', err)
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
                setError(errorMessage)
                toast.error(errorMessage)
                setIsProcessing(false)
            }
        }

        createPaymentAndRedirect()
    }, [orderId, amount])

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de paiement</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <div className="space-y-3">
                                <Button onClick={() => router.push('/dashboard/profiles')} className="w-full bg-orange-500 hover:bg-orange-600">
                                    Retour au dashboard
                                </Button>
                                <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                                    Réessayer
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardContent className="p-8">
                    <div className="text-center">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Wallet className="h-10 w-10 text-white" />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Redirection Wave</h2>
                        <p className="text-gray-600 mb-4">Préparation de votre lien Wave Merchant...</p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Montant :</span>
                                    <span className="font-semibold text-blue-600">
                                        {parseInt(amount).toLocaleString('fr-FR')} XOF
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-6">🔒 Paiement sécurisé via Wave Direct</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export const dynamic = 'force-dynamic'

export default function WaveRedirectPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        }>
            <WaveRedirectContent />
        </Suspense>
    )
}
