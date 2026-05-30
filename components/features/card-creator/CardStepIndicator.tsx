import { CreditCard, Palette, CheckCircle } from "lucide-react"

interface CardStepIndicatorProps {
  currentStep: number
}

const steps = [
  {
    title: "Type de carte",
    description: "Choisissez NFC+QR ou QR seulement",
    icon: <CreditCard className="w-6 h-6" />
  },
  {
    title: "Personnalisation",
    description: "Couleurs et design final",
    icon: <Palette className="w-6 h-6" />
  }
]

export function CardStepIndicator({ currentStep }: CardStepIndicatorProps) {
  return (
    <div className="flex justify-center mb-12">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              currentStep >= index 
                ? 'bg-ofika-orange text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > index ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                step.icon
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                currentStep > index ? 'bg-ofika-orange' : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
