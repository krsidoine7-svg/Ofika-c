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
                    'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300',
                    {
                      'bg-blue-600 border-blue-600 text-white': isCompleted,
                      'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100': isCurrent,
                      'bg-white border-gray-300 text-gray-400': isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <span className="text-sm sm:text-base font-semibold">{stepNumber}</span>
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-2 text-center hidden sm:block">
                  <p
                    className={cn('text-sm font-medium', {
                      'text-blue-600': isCurrent || isCompleted,
                      'text-gray-500': isUpcoming,
                    })}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-300',
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
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm font-medium text-blue-600">
          {steps[currentStep - 1]?.title}
        </p>
        {steps[currentStep - 1]?.description && (
          <p className="text-xs text-gray-500 mt-1">
            {steps[currentStep - 1]?.description}
          </p>
        )}
      </div>
    </div>
  )
}
