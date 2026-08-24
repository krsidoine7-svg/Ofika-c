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
    <div className="w-full h-full min-h-0 max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {currentStep === 'identity' && (
          <IdentityStep 
            initialData={formData} 
            onNext={handleNext('contact')} 
            onChange={updateData}
          />
        )}
        
        {currentStep === 'contact' && (
          <ContactStep 
            initialData={formData} 
            onNext={handleNext('links')} 
            onPrev={() => setCurrentStep('identity')}
            onChange={updateData}
          />
        )}

        {currentStep === 'links' && (
          <LinksStep 
            initialData={formData} 
            onNext={handleNext('media')} 
            onPrev={() => setCurrentStep('contact')}
            onSkip={() => handleNext('media')({})} // On skip, just go next without saving new form changes
            onChange={updateData}
          />
        )}

        {currentStep === 'media' && (
          <MediaStep 
            initialData={formData} 
            onNext={handleFinish} 
            onPrev={() => setCurrentStep('links')}
            onSkip={() => handleFinish({})} // On skip, finish immediately
            onChange={updateData}
          />
        )}
      </div>
      
      {/* Progress indicators internal to the form */}
      <div className="mt-4 pt-3 border-t flex justify-center gap-2 flex-shrink-0">
        <div className={`h-1.5 w-10 rounded-full transition-colors ${currentStep === 'identity' ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`h-1.5 w-10 rounded-full transition-colors ${currentStep === 'contact' ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`h-1.5 w-10 rounded-full transition-colors ${currentStep === 'links' ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`h-1.5 w-10 rounded-full transition-colors ${currentStep === 'media' ? 'bg-orange-500' : 'bg-gray-200'}`} />
      </div>
    </div>
  )
}
