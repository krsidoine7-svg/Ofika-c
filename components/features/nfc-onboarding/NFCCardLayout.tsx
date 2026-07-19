'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NFCCardLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
  onNext?: () => void
  onPrev?: () => void
  nextLabel?: string
  prevLabel?: string
  showNavigation?: boolean
  isLoading?: boolean
  isNextDisabled?: boolean
  className?: string
}

export function NFCCardLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  nextLabel = 'Suivant',
  prevLabel = 'Précédent',
  showNavigation = true,
  isLoading = false,
  isNextDisabled = false,
  className
}: NFCCardLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-orange-50 to-pink-50', className)}>
      <div className="container mx-auto px-4 py-8">
        {/* Header avec progression */}
        <div className="mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 px-4">
              Créez votre carte NFC
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Étape {currentStep} sur {totalSteps}
            </p>
          </div>


          {/* Stepper visuel avec cercles - Optimisé mobile */}
          <div className="flex items-center justify-between mb-4 px-2">
            {[
              { num: 1, label: 'Intro' },
              { num: 2, label: 'Infos' },
              { num: 3, label: 'Compte' },
              { num: 4, label: 'Design' },
              { num: 5, label: 'Profil' },
              { num: 6, label: 'Fin' }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${currentStep >= step.num
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                      } ${currentStep === step.num ? 'scale-110 ring-2 ring-orange-300' : ''}`}
                  >
                    {step.num}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium hidden sm:block ${currentStep >= step.num ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                    {step.label}
                  </span>
                </div>
                {index < 5 && (
                  <div className={`h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 rounded transition-all ${currentStep > step.num ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {children}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        {showNavigation && (
          <div className="max-w-4xl mx-auto mt-8 px-2">
            <div className="flex justify-between items-center w-full">
              {/* Précédent à gauche */}
              <div className="w-1/3 flex justify-start">
                {onPrev ? (
                  <Button
                    variant="outline"
                    onClick={onPrev}
                    disabled={isLoading}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{prevLabel}</span>
                  </Button>
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>

              {/* Indicateur d'étape au milieu */}
              <div className="w-1/3 flex justify-center text-sm text-gray-500 font-semibold">
                {currentStep} / {totalSteps}
              </div>

              {/* Suivant à droite */}
              <div className="w-1/3 flex justify-end">
                {onNext ? (
                  <Button
                    onClick={onNext}
                    disabled={isLoading || isNextDisabled}
                    className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:opacity-50 px-3 sm:px-4 text-white"
                  >
                    <span>{nextLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
