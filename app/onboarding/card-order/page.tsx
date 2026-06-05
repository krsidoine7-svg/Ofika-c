'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Smartphone,
  QrCode,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  Star,
  Users,
  Zap,
  Shield
} from "lucide-react"
import { CardOrderingFlow } from '@/components/features/card-ordering/CardOrderingFlow'
import { ProtectedRoute } from "@/components/core/auth/ProtectedRoute"

type OnboardingStep = 'welcome' | 'benefits' | 'order'

export default function CardOrderOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')

  const handleBack = () => {
    if (currentStep === 'benefits') {
      setCurrentStep('welcome')
    } else if (currentStep === 'order') {
      setCurrentStep('benefits')
    } else {
      router.back()
    }
  }

  const handleNext = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('benefits')
    } else if (currentStep === 'benefits') {
      setCurrentStep('order')
    }
  }

  const handleOrderComplete = (orderData: any) => {
    // Rediriger vers la page de paiement ou de confirmation
    router.push('/dashboard/orders')
  }

  const renderWelcomeStep = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <CreditCard className="h-10 w-10 text-orange-600" />
        </div>



        <h1 className="text-3xl font-bold text-gray-900">
          Commandez votre carte physique
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transformez votre profil numérique en une carte physique élégante.
          Partagez vos informations professionnelles d'un simple geste.
        </p>


      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Carte NFC + QR</h3>
            <p className="text-gray-600 mb-4">
              Technologie NFC pour un partage instantané + QR Code de secours
            </p>
            <Badge variant="secondary" className="text-lg font-bold px-4 py-2">
              {parseInt(process.env.NEXT_PUBLIC_LYGOS_DEFAULT_AMOUNT || '14600').toLocaleString('fr-FR')} XOF
            </Badge>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Partage instantané par contact
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Compatible tous smartphones
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Design premium personnalisé
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Carte QR Code</h3>
            <p className="text-gray-600 mb-4">
              QR Code haute qualité pour un partage simple et efficace
            </p>
            <Badge variant="secondary" className="text-lg font-bold px-4 py-2">
              8,000 XOF
            </Badge>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Scan rapide et fiable
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Prix abordable
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Design élégant
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-gray-900 mb-3">Processus de commande</h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-2">
              1
            </div>
            <span>Commande</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-2">
              2
            </div>
            <span>Paiement</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-2">
              3
            </div>
            <span>Production</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-2">
              4
            </div>
            <span>Livraison</span>
          </div>
        </div>
        <p className="text-center text-gray-600 mt-4">
          Délai de livraison : 7-14 jours ouvrés
        </p>
      </div>
    </div>
  )

  const renderBenefitsStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Pourquoi choisir une carte physique ?
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Découvrez tous les avantages d'avoir votre profil professionnel sur une carte physique
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Partage instantané</h3>
            <p className="text-gray-600">
              Un simple contact ou scan pour partager toutes vos informations professionnelles
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Impression professionnelle</h3>
            <p className="text-gray-600">
              Marquez les esprits avec une approche moderne et innovante du networking
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Toujours à jour</h3>
            <p className="text-gray-600">
              Vos informations sont automatiquement mises à jour, plus besoin de réimprimer
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Design personnalisé</h3>
            <p className="text-gray-600">
              Carte élégante avec votre photo, logo et couleurs de marque
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Écologique</h3>
            <p className="text-gray-600">
              Fini le gaspillage de cartes papier, une seule carte pour toute votre carrière
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Livraison rapide</h3>
            <p className="text-gray-600">
              Recevez votre carte en 7-14 jours ouvrés directement chez vous
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Témoignages clients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium">Amadou Diallo</p>
                  <p className="text-sm text-gray-600">Consultant IT</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Ma carte NFC m'a permis de doubler mes contacts professionnels en 3 mois.
                L'effet 'wow' est garanti !"
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium">Fatou Sow</p>
                  <p className="text-sm text-gray-600">Directrice Marketing</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Fini les cartes de visite perdues ! Mes contacts ont toujours mes informations
                à jour dans leur téléphone."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>

            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentStep === 'welcome' ? 'bg-orange-500' : 'bg-gray-300'
                }`} />
              <div className={`w-3 h-3 rounded-full ${currentStep === 'benefits' ? 'bg-orange-500' : 'bg-gray-300'
                }`} />
              <div className={`w-3 h-3 rounded-full ${currentStep === 'order' ? 'bg-orange-500' : 'bg-gray-300'
                }`} />
            </div>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto">
            {currentStep === 'welcome' && renderWelcomeStep()}
            {currentStep === 'benefits' && renderBenefitsStep()}
            {currentStep === 'order' && (
              <CardOrderingFlow
                onComplete={handleOrderComplete}
                className="max-w-4xl mx-auto"
              />
            )}
          </div>

          {/* Navigation */}
          {currentStep !== 'order' && (
            <div className="flex justify-center mt-12">
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              >
                {currentStep === 'welcome' ? 'Découvrir les avantages' : 'Commander ma carte'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
