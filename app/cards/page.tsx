"use client"

import { ProtectedRoute } from "@/components/core/auth/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard, QrCode, Settings } from "lucide-react"
import Link from "next/link"
import { BetaFeatureModal, useBetaFeature } from "@/components/ui/beta-feature-modal"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"

export default function CardsPage() {
  const router = useRouter()
  const { isModalOpen, featureName, showBetaModal, closeModal } = useBetaFeature()

  const handleCreateCard = () => {
    router.push('/onboarding/nfc-card')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Logo size="sm" showText />

              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Retour au dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Gestion de vos cartes
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Créez et gérez vos cartes professionnelles NFC et QR
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create New Card */}
              <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Créer une nouvelle carte
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Commencez par créer votre première carte professionnelle
                  </p>
                  <Button onClick={handleCreateCard} className="w-full">
                    Créer ma carte
                  </Button>
                </CardContent>
              </Card>

              {/* Placeholder for existing cards */}
              <Card className="opacity-50">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucune carte créée
                  </h3>
                  <p className="text-gray-600">
                    Vos cartes apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <BetaFeatureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        featureName={featureName}
      />
    </ProtectedRoute>
  )
}
