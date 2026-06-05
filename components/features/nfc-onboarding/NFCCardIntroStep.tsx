'use client'

import { NFCCardStepProps } from '@/lib/types/nfc-card-onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Smartphone, QrCode, Users } from 'lucide-react'

export function NFCCardIntroStep({ onNext }: NFCCardStepProps) {
  return (
    <div className="text-center space-y-8">
      {/* Illustration */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-32 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg shadow-lg flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <QrCode className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Titre et description */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Créez votre carte de visite NFC
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Une carte physique unique qui redirige vers votre profil OFIKA. 
          Partagez vos informations en un simple scan !
        </p>
      </div>

      {/* Avantages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <Card className="text-center p-6 border-0 shadow-md">
          <CardContent className="p-0">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Physique & Moderne</h3>
            <p className="text-sm text-gray-600">
              Carte tactile professionnelle avec technologie NFC/QR
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6 border-0 shadow-md">
          <CardContent className="p-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Scan Instantané</h3>
            <p className="text-sm text-gray-600">
              Accès immédiat à votre profil avec un simple scan
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6 border-0 shadow-md">
          <CardContent className="p-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Networking Pro</h3>
            <p className="text-sm text-gray-600">
              Outil professionnel pour vos rencontres et événements
            </p>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}
