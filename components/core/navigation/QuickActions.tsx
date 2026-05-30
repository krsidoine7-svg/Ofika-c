'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/core/ui/button"
import { Card, CardContent } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"
import { BetaFeatureModal, useBetaFeature } from "@/components/core/ui/beta-feature-modal"
import { 
  Plus, 
  Smartphone, 
  ShoppingCart, 
  QrCode, 
  User,
  ArrowRight
} from "lucide-react"

export function QuickActions() {
  const router = useRouter()
  const { isModalOpen, featureName, showBetaModal, closeModal } = useBetaFeature()

  const actions = [
    {
      title: 'Créer un profil',
      description: 'Ajouter vos informations professionnelles',
      icon: <User className="h-5 w-5" />,
      onClick: () => router.push('/dashboard/profiles/create'),
      color: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      isBeta: false
    },
    {
      title: 'Créer une carte NFC',
      description: 'Générer votre carte numérique',
      icon: <Smartphone className="h-5 w-5" />,
      onClick: () => showBetaModal('Création de cartes NFC'),
      color: 'bg-green-500 hover:bg-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      isBeta: true
    },
    {
      title: 'Commander une carte',
      description: 'Commander votre carte physique',
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => showBetaModal('Commande de cartes physiques'),
      color: 'bg-orange-500 hover:bg-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      isBeta: true
    },
    {
      title: 'Générer un QR Code',
      description: 'Créer un QR code personnalisé',
      icon: <QrCode className="h-5 w-5" />,
      onClick: () => router.push('/dashboard/qr-codes/new'),
      color: 'bg-purple-500 hover:bg-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      isBeta: false
    },
    {
      title: 'Mes commandes',
      description: 'Suivre vos commandes',
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => router.push('/dashboard/orders'),
      color: 'bg-gray-500 hover:bg-gray-600',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      isBeta: false
    }
  ]

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Actions rapides
          </h3>
          <p className="text-sm text-gray-600">
            Accédez rapidement aux fonctionnalités principales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <div key={index} className="relative">
              <Button
                onClick={action.onClick}
                className={`${action.color} text-white h-auto p-4 flex items-start gap-3 text-left w-full`}
              >
                <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <div className={action.iconColor}>
                    {action.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {action.title}
                    {action.isBeta && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                        Bêta
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 opacity-70 flex-shrink-0" />
              </Button>
            </div>
          ))}
        </div>
        
        <BetaFeatureModal
          isOpen={isModalOpen}
          onClose={closeModal}
          featureName={featureName}
        />
      </CardContent>
    </Card>
  )
}
