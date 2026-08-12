'use client'

import { useState } from 'react'
import { IdentityStep } from './IdentityStep'
import { ContactStep } from './ContactStep'
import { LinksStep } from './LinksStep'
import { MediaStep } from './MediaStep'

type WizardStep = 'identity' | 'contact' | 'links' | 'media'

interface OnboardingWizardProps {
  initialData: any
  onSuccess: (data: any) => void
  onChange?: (data: any) => void
}

export function OnboardingWizard({ initialData, onSuccess, onChange }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('identity')
  const [formData, setFormData] = useState<any>(initialData || {})

  const updateData = (data: Partial<any>) => {
    const updated = { ...formData, ...data }
    setFormData(updated)
    if (onChange) onChange(updated)
    return updated
  }

  const handleNext = (nextStep: WizardStep) => (data?: any) => {
    if (data) updateData(data)
    setCurrentStep(nextStep)
  }

  const handleFinish = (data?: any) => {
    let finalData = formData
    if (data) {
      finalData = updateData(data)
    }
    onSuccess(finalData)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl border shadow-sm">
      {currentStep === 'identity' && (
        <IdentityStep 
          initialData={formData} 
          onNext={handleNext('contact')} 
        />
      )}
      
      {currentStep === 'contact' && (
        <ContactStep 
          initialData={formData} 
          onNext={handleNext('links')} 
          onPrev={() => setCurrentStep('identity')}
        />
      )}

      {currentStep === 'links' && (
        <LinksStep 
          initialData={formData} 
          onNext={handleNext('media')} 
          onPrev={() => setCurrentStep('contact')}
          onSkip={() => handleNext('media')({})} // On skip, just go next without saving new form changes
        />
      )}

      {currentStep === 'media' && (
        <MediaStep 
          initialData={formData} 
          onNext={handleFinish} 
          onPrev={() => setCurrentStep('links')}
          onSkip={() => handleFinish({})} // On skip, finish immediately
        />
      )}
      
      {/* Progress indicators internal to the form */}
      <div className="mt-8 pt-4 border-t flex justify-center gap-2">
        <div className={`h-2 w-12 rounded-full ${currentStep === 'identity' ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-2 w-12 rounded-full ${currentStep === 'contact' ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-2 w-12 rounded-full ${currentStep === 'links' ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-2 w-12 rounded-full ${currentStep === 'media' ? 'bg-primary' : 'bg-gray-200'}`} />
      </div>
    </div>
  )
}
