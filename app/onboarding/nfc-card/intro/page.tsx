'use client'

import { NFCCardLayout } from '@/components/features/nfc-onboarding/NFCCardLayout'
import { NFCCardIntroStep } from '@/components/features/nfc-onboarding/NFCCardIntroStep'
import { useRouter } from 'next/navigation'
import { getDefaultNFCCardFormData } from '@/lib/utils/nfc-card-defaults'

export default function NFCCardIntroPage() {
  const router = useRouter()

  const handleNext = () => {
    router.push('/onboarding/nfc-card/form')
  }

  return (
    <NFCCardLayout
      currentStep={1}
      totalSteps={5}
      onNext={handleNext}
      nextLabel="Commencer"
      showNavigation={false}
    >
      <NFCCardIntroStep
        onNext={handleNext}
        onPrev={() => {}}
        formData={getDefaultNFCCardFormData()}
        onDataChange={() => {}}
        isLoading={false}
        error={null}
      />
    </NFCCardLayout>
  )
}
