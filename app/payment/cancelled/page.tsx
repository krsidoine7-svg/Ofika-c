'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Button } from "@/components/core/ui/button"
import { Alert, AlertDescription } from "@/components/core/ui/alert"
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  Home,
  CreditCard
} from "lucide-react"
import { toast } from "sonner"

function PaymentCancelledContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Récupérer les paramètres de l'URL
  const cardType = searchParams.get('type') || 'nfc_qr'
  const reason = searchParams.get('reason') || ''

  useEffect(() => {
    toast.error('Paiement annulé')
  }, [])

  const getCardTypeLabel = (type: string) => {
    return type === 'nfc_qr' ? 'NFC + QR Code' : 'QR Code uniquement'
  }

  const handleRetryPayment = () => {
    router.push(`/order/create?type=${cardType}`)
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Animation d'annulation */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Paiement annulé
            </h1>
            <p className="text-gray-600 mb-4">
              Votre paiement a été annulé
            </p>
            {reason && (
              <p className="text-sm text-gray-500">
                Raison : {reason}
              </p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-red-600" />
                Détails de la commande annulée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Commande annulée</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Type de carte :</span>
                    <span className="font-medium">{getCardTypeLabel(cardType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant :</span>
                    <span className="font-medium">
                      {parseInt(cardType === 'nfc_qr' ? (process.env.NEXT_PUBLIC_LYGOS_DEFAULT_AMOUNT || '14600') : '10000').toLocaleString('fr-FR')} XOF
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statut :</span>
                    <span className="font-medium text-red-600">Annulé</span>
                  </div>
                </div>
              </div>

              <Alert className="border-orange-200 bg-orange-50">
                <AlertDescription className="text-orange-800">
                  <strong>Pas de souci !</strong><br />
                  Aucun montant n'a été débité de votre compte. Vous pouvez réessayer le paiement à tout moment.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-6">
            <Button
              onClick={handleRetryPayment}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer le paiement
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>

              <Button
                onClick={handleGoHome}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Button>
            </div>
          </div>

          {/* Informations utiles */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Besoin d'aide avec votre paiement ?
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Vérifiez que votre méthode de paiement est valide</p>
              <p>• Assurez-vous d'avoir suffisamment de fonds</p>
              <p>• Contactez le support si le problème persiste</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <PaymentCancelledContent />
    </Suspense>
  )
}
