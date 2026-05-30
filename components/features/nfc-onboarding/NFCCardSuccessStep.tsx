'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { CheckCircle, ExternalLink, ArrowRight, QrCode, Smartphone, ShoppingCart, Download } from 'lucide-react'
import { toast } from 'sonner'
import { BetaFeatureModal, useBetaFeature } from "@/components/core/ui/beta-feature-modal"
import { Badge } from "@/components/core/ui/badge"
import confetti from 'canvas-confetti'

interface NFCCardSuccessStepProps {
  nfcProfile?: {
    id: string
    nfc_link: string
    profile_name: string
    created_at: string
    qr_code_url?: string
  }
  onViewProfiles?: () => void
}

export function NFCCardSuccessStep({ nfcProfile, onViewProfiles }: NFCCardSuccessStepProps) {
  const router = useRouter()
  const { isModalOpen, featureName, showBetaModal, closeModal } = useBetaFeature()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    // 🎉 Effet Confettis "Wow"
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#ec4899', '#3b82f6']
    });

    // Décompte chaque seconde
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Redirection automatique après 10 secondes
    const timer = setTimeout(() => {
      if (onViewProfiles) {
        onViewProfiles()
      } else {
        router.push('/dashboard/profiles')
      }
    }, 10000)

    return () => {
      clearTimeout(timer)
      clearInterval(intervalId)
    }
  }, [onViewProfiles, router])

  const handleViewProfiles = () => {
    if (onViewProfiles) {
      onViewProfiles()
    } else {
      router.push('/dashboard/profiles')
    }
  }

  const handleViewPublicProfile = () => {
    if (nfcProfile?.nfc_link) {
      // Extraire le username de l'URL complète
      const urlParts = nfcProfile.nfc_link.split('/')
      const username = urlParts[urlParts.length - 1]
      const localUrl = `${window.location.origin}/${username}`
      window.open(localUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleOrderCard = () => {
    showBetaModal('Commande de cartes physiques')
  }

  return (
    <div className="space-y-8">
      {/* Animation de succès */}
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <QrCode className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Félicitations ! 🎉
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Votre carte de visite NFC a été créée avec succès
        </p>
        <p className="text-gray-500">
          {nfcProfile?.profile_name || 'Votre carte NFC'} est maintenant prête
        </p>
      </div>

      {/* Informations de la carte créée */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Smartphone className="w-5 h-5" />
              Votre carte NFC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              {nfcProfile?.qr_code_url ? (
                <div className="flex flex-col items-center gap-2 mb-3">
                  <div className="p-2 bg-white rounded-xl border border-green-200 shadow-sm inline-block">
                    <img
                      src={nfcProfile.qr_code_url}
                      alt="QR Code de la carte NFC"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-300 hover:bg-green-100"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = nfcProfile.qr_code_url!
                      link.download = `qrcode-${nfcProfile.profile_name || 'ofika'}.png`
                      link.click()
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le QR
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
              )}
              <p className="text-sm text-green-700">
                Carte physique avec QR code NFC
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Nom du profil :</span>
                <span className="font-medium">{nfcProfile?.profile_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Créé le :</span>
                <span className="font-medium">
                  {nfcProfile?.created_at ? new Date(nfcProfile.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Statut :</span>
                <span className="font-medium text-green-600">Actif</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <ExternalLink className="w-5 h-5" />
              Page publique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="w-16 h-10 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center border-2 border-blue-200">
                <span className="text-blue-600 font-bold text-sm">OFIKA</span>
              </div>
              <p className="text-sm text-blue-700">
                Profil accessible via QR code
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">URL locale :</span>
                <span className="font-medium text-xs truncate">
                  /{nfcProfile?.nfc_link?.split('/').filter(Boolean).pop() || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-blue-700">URL complète :</span>
                <span className="font-medium text-xs break-all text-blue-600">
                  {nfcProfile?.nfc_link || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Visibilité :</span>
                <span className="font-medium text-blue-600">Publique</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Partage :</span>
                <span className="font-medium text-blue-600">Via QR code</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prochaines étapes */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Prochaines étapes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Recevez votre carte physique</p>
                <p className="text-sm text-gray-600">
                  Un email de confirmation avec les détails de livraison vous sera envoyé
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Testez votre carte</p>
                <p className="text-sm text-gray-600">
                  Scannez le QR code pour vérifier que tout fonctionne correctement
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Partagez vos informations</p>
                <p className="text-sm text-gray-600">
                  Utilisez votre carte lors de vos rencontres professionnelles
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redirection automatique simplifiée */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Redirection automatique vers vos profils dans <span className="font-medium text-orange-500">{countdown} seconde{countdown > 1 ? 's' : ''}</span>
        </p>
      </div>

      <BetaFeatureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        featureName={featureName}
      />
    </div>
  )
}
