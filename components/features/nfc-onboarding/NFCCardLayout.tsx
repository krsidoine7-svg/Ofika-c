'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
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

const STEP_LABELS = [
  { num: 1, label: 'Découverte' },
  { num: 2, label: 'Coordonnées' },
  { num: 3, label: 'Design & Finition' },
  { num: 4, label: 'Page Web' },
  { num: 5, label: 'Compte' },
  { num: 6, label: 'Prête' }
]

export function NFCCardLayout({
  children,
  currentStep,
  totalSteps = 6,
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
    <div className={cn('min-h-screen bg-neutral-50/70 text-neutral-900', className)}>
      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-10">
        
        {/* Header avec progression */}
        <div className="mb-6 sm:mb-8 max-w-3xl mx-auto">
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold mb-2">
              <span>Configuration Carte NFC</span>
              <span>•</span>
              <span className="font-mono">Étape {currentStep} sur {totalSteps}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-950 tracking-tight">
              Personnalisation de votre carte connectée
            </h1>
          </div>

          {/* Stepper visuel épuré (Style Apple / Linear) */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-3 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between">
              {STEP_LABELS.slice(0, totalSteps).map((step, index) => {
                const isPassed = currentStep > step.num
                const isCurrent = currentStep === step.num
                const isUpcoming = currentStep < step.num

                return (
                  <div key={step.num} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div
                        className={cn(
                          'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0',
                          isPassed && 'bg-emerald-600 text-white',
                          isCurrent && 'bg-neutral-950 text-white ring-4 ring-neutral-900/10 scale-105',
                          isUpcoming && 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                        )}
                      >
                        {isPassed ? <Check className="w-3.5 h-3.5" /> : step.num}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] sm:text-[11px] mt-1.5 font-medium truncate hidden sm:block max-w-[85px] text-center',
                          isCurrent ? 'text-neutral-950 font-bold' : isPassed ? 'text-emerald-700 font-medium' : 'text-neutral-400'
                        )}
                      >
                        {step.label}
                      </span>
                    </div>

                    {index < totalSteps - 1 && (
                      <div
                        className={cn(
                          'h-0.5 flex-1 mx-1.5 sm:mx-2 rounded-full transition-colors',
                          isPassed ? 'bg-emerald-500' : 'bg-neutral-200'
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Contenu principal de l'étape */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border border-neutral-200/90 shadow-xs rounded-3xl overflow-hidden">
            <CardContent className="p-4 sm:p-7 md:p-8">
              {children}
            </CardContent>
          </Card>
        </div>

        {/* Barre de navigation inférieure */}
        {showNavigation && (
          <div className="max-w-4xl mx-auto mt-6 px-1">
            <div className="flex justify-between items-center w-full gap-4">
              {/* Précédent */}
              <div>
                {onPrev ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onPrev}
                    disabled={isLoading}
                    className="h-11 px-4 sm:px-5 rounded-xl border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs sm:text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{prevLabel}</span>
                  </Button>
                ) : (
                  <div className="w-1" />
                )}
              </div>

              {/* Indicateur d'étape */}
              <div className="text-xs text-neutral-400 font-mono hidden sm:block">
                Étape {currentStep} / {totalSteps}
              </div>

              {/* Suivant */}
              <div>
                {onNext && (
                  <Button
                    type="button"
                    onClick={onNext}
                    disabled={isLoading || isNextDisabled}
                    className="h-11 px-5 sm:px-6 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{nextLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
