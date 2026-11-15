'use client'

import { NFCCardStepProps } from '@/lib/types/nfc-card-onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Smartphone, QrCode, Users, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { NFCCard3DViewer } from './NFCCard3DViewer'

export function NFCCardIntroStep({ onNext }: NFCCardStepProps) {
  return (
    <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto py-2">
      {/* Badge Haut de Gamme Statutaire */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/80 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
        <span>Puce Sans Contact & QR Code Permanent</span>
      </div>

      {/* Titre & Sous-titre */}
      <div className="space-y-2.5">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
          Votre carte de visite NFC intelligente
        </h2>
        <p className="text-sm sm:text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          Une carte physique au design épuré qui transmet instantanément vos coordonnées et votre profil d'un simple geste sans contact.
        </p>
      </div>

      {/* Visualiseur 3D Interactif */}
      <div className="relative py-1 sm:py-2">
        <div className="p-4 sm:p-6 rounded-3xl bg-neutral-100/60 border border-neutral-200/90 shadow-xs">
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

      {/* Grille d'avantages Bento (Style Apple / Linear) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <div className="p-5 bg-white border border-neutral-200/80 shadow-xs rounded-2xl space-y-3">
          <div className="w-9 h-9 bg-neutral-950 rounded-xl flex items-center justify-center text-white">
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <h3 className="font-bold text-neutral-950 text-sm sm:text-base">Transmission Instantanée</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Compatible avec 100% des smartphones (iOS & Android) via puce NFC intégrée et QR code de secours.
          </p>
        </div>

        <div className="p-5 bg-white border border-neutral-200/80 shadow-xs rounded-2xl space-y-3">
          <div className="w-9 h-9 bg-neutral-950 rounded-xl flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="font-bold text-neutral-950 text-sm sm:text-base">Gravure Laser & Finition Pro</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Finition noir mat haute résistance, gravure de précision inaltérable et aspect exécutif haut de gamme.
          </p>
        </div>

        <div className="p-5 bg-white border border-neutral-200/80 shadow-xs rounded-2xl space-y-3">
          <div className="w-9 h-9 bg-neutral-950 rounded-xl flex items-center justify-center text-white">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="font-bold text-neutral-950 text-sm sm:text-base">Mise à Jour en Temps Réel</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Modifiez vos numéros, réseaux et liens à tout moment sur votre compte sans jamais réimprimer votre carte.
          </p>
        </div>
      </div>

      {/* Bouton d'action principal */}
      <div className="pt-2 flex justify-center">
        <Button
          onClick={onNext}
          className="h-12 px-8 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
        >
          <span>Personnaliser ma carte maintenant</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
