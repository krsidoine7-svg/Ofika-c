'use client'

import { NFCCardStepProps } from '@/lib/types/nfc-card-onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Smartphone, QrCode, Users, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { NFCCard3DViewer } from './NFCCard3DViewer'

export function NFCCardIntroStep({ onNext }: NFCCardStepProps) {
  return (
    <div className="text-center space-y-8 max-w-4xl mx-auto py-2">
      {/* Badge Haut de Gamme */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-600 border border-orange-200 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
        <span>Nouvelle Génération de Cartes Connectées</span>
      </div>

      {/* Titre & Sous-titre */}
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Votre carte de visite NFC intelligente
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Une carte physique au design épuré et moderne qui transmet instantanément vos coordonnées et votre profil d'un simple contact.
        </p>
      </div>

      {/* 3D Showcase Card - Auto rotating to show Recto & Verso */}
      <div className="relative py-2 sm:py-4">
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-900/[0.02] to-slate-900/[0.06] border border-slate-200/80 shadow-inner">
          <NFCCard3DViewer
            fullName="Alexandre Dupont"
            jobTitle="Directeur Général"
            company="OFIKA TECHNOLOGIES"
            backgroundColor="black"
            cardDesign="design1"
            qrValue="https://ofika.ci/alexandre"
            autoRotateDefault={true}
            showControls={true}
          />
        </div>
      </div>

      {/* Grille d'avantages haut de gamme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
        <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl hover:border-orange-200 hover:shadow-md transition-all">
          <CardContent className="p-0 space-y-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Transmission Instantanée</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Compatible avec tous les smartphones (iOS & Android) via puce NFC intégrée et QR code haute lisibilité.
            </p>
          </CardContent>
        </Card>

        <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl hover:border-blue-200 hover:shadow-md transition-all">
          <CardContent className="p-0 space-y-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Finition & Matériaux Pro</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Design épuré mat haute résistance avec gravure de précision et aspect premium.
            </p>
          </CardContent>
        </Card>

        <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all">
          <CardContent className="p-0 space-y-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Mise à jour en temps réel</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Modifiez vos informations sur votre compte à tout moment sans jamais réimprimer votre carte.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to action button */}
      <div className="pt-4 flex justify-center">
        <Button
          onClick={onNext}
          className="h-12 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 flex items-center gap-2 transform active:scale-95 transition-all"
        >
          <span>Personnaliser ma carte maintenant</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
