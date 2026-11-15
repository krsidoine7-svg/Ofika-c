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
import { ProtectedRoute } from "@/components/core/auth/ProtectedRoute"
import { usePaymentMethods } from '@/lib/hooks/usePayments'

type OnboardingStep = 'welcome' | 'benefits'

export default function CardOrderOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const { basePrice } = usePaymentMethods()

  const handleBack = () => {
    if (currentStep === 'benefits') {
      setCurrentStep('welcome')
    } else {
      router.back()
    }
  }

  const handleNext = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('benefits')
    } else if (currentStep === 'benefits') {
      router.push('/dashboard/orders/new')
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

      <div className="max-w-2xl mx-auto">
        <Card className="border border-neutral-200 bg-white shadow-xs rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-neutral-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Carte Officielle Ofika
              </span>
              <h3 className="text-2xl font-bold text-neutral-950">Carte Connectée NFC + QR</h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto mt-1">
                Puce sans contact haute portée et QR code permanent gravé au laser à votre nom.
              </p>
            </div>

            <div className="pt-2">
              <Badge variant="secondary" className="text-xl font-bold px-5 py-2.5 bg-neutral-100 text-neutral-900 border border-neutral-200">
                {basePrice.toLocaleString('fr-FR')} XOF
              </Badge>
              <div className="text-xs text-emerald-600 font-semibold mt-2">
                Livraison express gratuite sur tout Abidjan
              </div>
            </div>

            <div className="pt-4 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs text-neutral-700">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Partage instantané sans contact</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Compatible iPhone & Android</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Gravure laser personnalisée</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Profil modifiable à vie</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Processus de fabrication & livraison</h3>
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center">
            <div className="w-7 h-7 bg-neutral-950 text-white rounded-full flex items-center justify-center mr-2 text-xs font-bold">
              1
            </div>
            <span>Commande</span>
          </div>
          <div className="flex-1 h-0.5 bg-neutral-200 mx-2"></div>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-neutral-950 text-white rounded-full flex items-center justify-center mr-2 text-xs font-bold">
              2
            </div>
            <span>Paiement</span>
          </div>
          <div className="flex-1 h-0.5 bg-neutral-200 mx-2"></div>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-neutral-950 text-white rounded-full flex items-center justify-center mr-2 text-xs font-bold">
              3
            </div>
            <span>Gravure</span>
          </div>
          <div className="flex-1 h-0.5 bg-neutral-200 mx-2"></div>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-neutral-950 text-white rounded-full flex items-center justify-center mr-2 text-xs font-bold">
              4
            </div>
            <span>Livraison</span>
          </div>
        </div>
        <p className="text-center text-xs font-semibold text-neutral-700 mt-4 flex items-center justify-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>Délai de livraison : 24h à 48h ouvrés à Abidjan (Livraison Gratuite)</span>
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
            </div>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto">
            {currentStep === 'welcome' && renderWelcomeStep()}
            {currentStep === 'benefits' && renderBenefitsStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-center mt-12">
            <Button
              onClick={handleNext}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              {currentStep === 'welcome' ? 'Découvrir les avantages' : 'Commander ma carte'}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
