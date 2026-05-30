'use client'

import { NFCCardLayout } from '@/components/features/nfc-onboarding/NFCCardLayout'
import { NFCCardFormStep } from '@/components/features/nfc-onboarding/NFCCardFormStep'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { NFCCardFormData } from '@/lib/types/nfc-card-onboarding'
import { getDefaultNFCCardFormData } from '@/lib/utils/nfc-card-defaults'

export default function NFCCardFormPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<NFCCardFormData>(getDefaultNFCCardFormData())
  const [isFormValid, setIsFormValid] = useState(false)

  const handleNext = () => {
    router.push('/onboarding/nfc-card/design')
  }

  const handlePrev = () => {
    router.push('/onboarding/nfc-card/intro')
  }

  const handleDataChange = (data: Partial<NFCCardFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleFormValidationChange = (valid: boolean) => {
    setIsFormValid(valid)
  }

  return (
    <NFCCardLayout
      currentStep={2}
      totalSteps={5}
      onNext={undefined}
      onPrev={handlePrev}
      nextLabel="Continuer"
      prevLabel="Précédent"
      showNavigation={true}
      isNextDisabled={true}
    >
      <NFCCardFormStep
        onNext={handleNext}
        onPrev={handlePrev}
        formData={formData}
        onDataChange={handleDataChange}
        onValidationChange={handleFormValidationChange}
        isLoading={false}
        error={null}
      />
    </NFCCardLayout>
  )
}

