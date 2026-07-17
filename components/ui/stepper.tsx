'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  id: string
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-300',
                    {
                      'bg-blue-600 border-blue-600 text-white': isCompleted,
                      'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-100': isCurrent,
                      'bg-white border-gray-300 text-gray-400': isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-1 text-center hidden sm:block">
                  <p
                    className={cn('text-[11px] sm:text-xs font-semibold', {
                      'text-blue-600': isCurrent || isCompleted,
                      'text-gray-500': isUpcoming,
                    })}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 sm:mx-2 transition-all duration-300',
                    {
                      'bg-blue-600': stepNumber < currentStep,
                      'bg-gray-300': stepNumber >= currentStep,
                    }
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Step Title */}
      <div className="mt-2 text-center sm:hidden">
        <p className="text-xs font-semibold text-blue-600">
          {steps[currentStep - 1]?.title}
        </p>
        {steps[currentStep - 1]?.description && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {steps[currentStep - 1]?.description}
          </p>
        )}
      </div>
    </div>
  )
}
