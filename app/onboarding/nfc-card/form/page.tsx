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
    localStorage.setItem('pending_nfc_card_creation', JSON.stringify({ formData }))
    router.push('/onboarding/nfc-card?continue=true')
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
      onNext={handleNext}
      onPrev={handlePrev}
      nextLabel="Continuer"
      prevLabel="Précédent"
      showNavigation={true}
      isNextDisabled={!isFormValid}
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

