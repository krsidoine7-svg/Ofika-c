'use client'

import { useState } from 'react'
import { Button } from "@/components/core/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { CardStepIndicator } from './CardStepIndicator'
import { CardTypeStep } from './CardTypeStep'
import { CustomizationStep } from './CustomizationStep'
import { CardPreview } from './CardPreview'

export interface CardData {
  name: string
  title: string
  company: string
  email: string
  phone: string
}

export interface CardCreatorProps {
  onCardCreate?: (cardData: CardData, cardType: 'nfc_qr' | 'qr_only', cardColor: string) => void
}

export function CardCreator({ onCardCreate }: CardCreatorProps) {
  const [cardStep, setCardStep] = useState(0)
  const [cardType, setCardType] = useState<'nfc_qr' | 'qr_only'>('nfc_qr')
  const [cardColor, setCardColor] = useState('ofika')
  const [cardData, setCardData] = useState<CardData>({
    name: 'Votre Nom',
    title: 'Votre Titre',
    company: 'Votre Entreprise',
    email: 'votre@email.com',
    phone: '+225 00 00 00 00'
  })

  const handleNext = () => {
    if (cardStep < 1) {
      setCardStep(cardStep + 1)
    } else {
      // Créer la carte
      onCardCreate?.(cardData, cardType, cardColor)
    }
  }

  const handlePrevious = () => {
    setCardStep(Math.max(0, cardStep - 1))
  }

  const renderStep = () => {
    switch (cardStep) {
      case 0:
        return (
          <CardTypeStep
            selectedType={cardType}
            onTypeChange={setCardType}
          />
        )
      case 1:
        return (
          <CustomizationStep
            selectedColor={cardColor}
            onColorChange={setCardColor}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Indicateur de progression */}
      <CardStepIndicator currentStep={cardStep} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Interface de création */}
        <div className="space-y-8">
          {renderStep()}

          {/* Navigation des étapes */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={cardStep === 0}
              className="px-8"
            >
              Précédent
            </Button>
            
            <Button
              onClick={handleNext}
              className="px-8 bg-ofika-orange hover:bg-ofika-orange/90"
            >
              {cardStep < 1 ? (
                'Suivant'
              ) : (
                <>
                  Créer ma carte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Prévisualisation de carte */}
        <div className="flex justify-center lg:justify-end">
          <CardPreview
            data={cardData}
            type={cardType}
            color={cardColor}
          />
        </div>
      </div>
    </div>
  )
}
