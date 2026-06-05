'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ValidatedInput, PhoneInput } from "@/components/ui/validated-input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Smartphone,
  QrCode,
  CreditCard,
  ArrowRight,
  Check,
  Package,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Wallet
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CARD_PRICING, CARD_TYPE_LABELS } from '@/lib/types/payments'
import { useOrderProcess, usePaymentMethods } from '@/lib/hooks/usePayments'
import { useProfiles } from '@/lib/hooks/useProfiles'
import { useNFCCards } from '@/lib/hooks/useNFCCards'
import {
  validateCustomerDetails,
  validateName,
  validateEmail,
  validateAddress,
  validateCity,
  validatePostalCode,
  formatNameInput,
  formatCityInput,
  type CustomerDetails
} from '@/lib/validations/order-form'

interface CardOrderingFlowProps {
  onComplete?: (orderData: any) => void
  className?: string
}

type Step = 'card_selection' | 'details' | 'confirmation'

export function CardOrderingFlow({ onComplete, className }: CardOrderingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('card_selection')
  const [selectedNFCCard, setSelectedNFCCard] = useState<any>(null)
  const [selectedCardType, setSelectedCardType] = useState<'nfc_qr' | 'qr_only'>('nfc_qr')
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('wave')
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({})
  const [isFormValid, setIsFormValid] = useState(false)

  const { profiles } = useProfiles()
  const { cards: nfcCards, loading: nfcLoading } = useNFCCards()
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods()
  const { processOrder, isProcessing, currentStep: orderStep, error: orderError, paymentUrl } = useOrderProcess()

  // Auto-select first active payment method
  useEffect(() => {
    if (!paymentMethodsLoading && paymentMethods.length > 0) {
      const active = paymentMethods.filter(m => m.is_active)
      if (active.length > 0 && !active.some(m => m.id === selectedPaymentMethod)) {
        setSelectedPaymentMethod(active[0].id)
      }
    }
  }, [paymentMethods, paymentMethodsLoading])

  const steps = [
    { id: 'card_selection', title: 'Sélection carte', icon: QrCode },
    { id: 'details', title: 'Informations', icon: User },
    { id: 'confirmation', title: 'Confirmation', icon: Check }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep === 'card_selection') {
      if (!nfcCards || nfcCards.length === 0) {
        toast.error('Vous devez d\'abord créer une carte NFC avant de commander une version physique')
        router.push('/onboarding/nfc-card')
        return
      }

      if (!selectedNFCCard) {
        toast.error('Veuillez sélectionner une carte à reproduire')
        return
      }
      setCurrentStep('details')
    } else if (currentStep === 'details') {
      // Valider le formulaire avant de passer à l'étape suivante
      const validation = validateCustomerDetails(customerDetails)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        toast.error('Veuillez corriger les erreurs dans le formulaire')
        return
      }
      setValidationErrors({})
      setCurrentStep('confirmation')
    } else if (currentStep === 'confirmation') {
      handleOrder()
    }
  }

  const handleBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('card_selection')
    } else if (currentStep === 'confirmation') {
      setCurrentStep('details')
    }
  }

  const handleOrder = async () => {
    if (!profiles || profiles.length === 0) {
      toast.error('Vous devez d\'abord créer un profil avant de commander une carte')
      router.push('/dashboard/profiles/new')
      return
    }

    // Utiliser la carte NFC sélectionnée
    if (!selectedNFCCard) {
      toast.error('Veuillez sélectionner une carte NFC à reproduire')
      return
    }

    if (!selectedNFCCard.profile_id) {
      toast.error('Erreur: La carte sélectionnée n\'a pas de profil associé')
      return
    }
    const orderData = {
      profile_id: selectedNFCCard.profile_id, // Ajout du profile_id requis
      card_type: selectedCardType,
      quantity: 1,
      payment_method: selectedPaymentMethod,
      shipping_address: {
        name: customerDetails.name,
        email: customerDetails.email || 'user@example.com', // Ajout de l'email requis
        phone: customerDetails.phone,
        address: customerDetails.address,
        city: customerDetails.city,
        postalCode: customerDetails.postalCode
      }
    }

    try {
      const result = await processOrder(orderData)

      if (result.success && result.order) {
        toast.success('Commande créée avec succès ! Redirection vers le paiement...')

        // Rediriger directement vers Lygos si le lien est disponible
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
        } else {
          // Fallback: rediriger vers la page de redirection
          router.push(`/payment/redirect/${result.order.id}`)
        }
      } else {
        toast.error(result.error || 'Erreur lors de la création de la commande')
      }
    } catch (error) {
      console.error('Error processing order:', error)
      toast.error('Erreur lors du traitement de la commande')
    }
  }

  // 🎯 NOUVELLE ÉTAPE : SÉLECTION DE LA CARTE NUMÉRIQUE À REPRODUIRE
  const renderCardSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sélectionnez votre carte à reproduire</h2>
        <p className="text-gray-600">Choisissez quelle carte numérique transformer en carte physique</p>
      </div>

      {nfcLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : !nfcCards || nfcCards.length === 0 ? (
        <div className="text-center py-8">
          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune carte numérique trouvée</h3>
          <p className="text-gray-600 mb-4">Vous devez d'abord créer votre carte numérique</p>
          <Button onClick={() => router.push('/onboarding/nfc-card')}>
            Créer ma carte numérique
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nfcCards.map((card) => (
            <div
              key={card.id}
              className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedNFCCard?.id === card.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
                }`}
              onClick={() => setSelectedNFCCard(card)}
            >
              {selectedNFCCard?.id === card.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color_theme === 'blue' ? 'bg-blue-100' :
                    card.color_theme === 'green' ? 'bg-green-100' :
                      card.color_theme === 'purple' ? 'bg-purple-100' :
                        'bg-orange-100'
                  }`}>
                  <QrCode className={`w-6 h-6 ${card.color_theme === 'blue' ? 'text-blue-600' :
                      card.color_theme === 'green' ? 'text-green-600' :
                        card.color_theme === 'purple' ? 'text-purple-600' :
                          'text-orange-600'
                    }`} />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{card.profile_name}</h3>
                  <p className="text-sm text-gray-600">
                    Design {card.design_choice} • Thème {card.color_theme}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Créée le {new Date(card.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderStepSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre carte</h2>
        <p className="text-gray-600">Sélectionnez le type de carte qui vous convient</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className={`cursor-pointer transition-all duration-200 ${selectedCardType === 'nfc_qr'
              ? 'ring-2 ring-orange-500 bg-orange-50 shadow-lg'
              : 'hover:shadow-md'
            }`}
          onClick={() => setSelectedCardType('nfc_qr')}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">NFC + QR Code</h3>
              <p className="text-gray-600 mb-4">
                Carte premium avec technologie NFC et QR Code pour un partage instantané
              </p>
              <Badge variant="secondary" className="text-lg font-bold px-4 py-2">
                {CARD_PRICING.nfc_qr.toLocaleString()} XOF
              </Badge>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Technologie NFC
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  QR Code intégré
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Design premium
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 ${selectedCardType === 'qr_only'
              ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg'
              : 'hover:shadow-md'
            }`}
          onClick={() => setSelectedCardType('qr_only')}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">QR Code uniquement</h3>
              <p className="text-gray-600 mb-4">
                Carte économique avec QR Code pour un partage simple et efficace
              </p>
              <Badge variant="secondary" className="text-lg font-bold px-4 py-2">
                {CARD_PRICING.qr_only.toLocaleString()} XOF
              </Badge>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  QR Code haute qualité
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Design élégant
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Prix abordable
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Fonctions de validation
  const validateField = (field: keyof CustomerDetails, value: string) => {
    const errors = { ...validationErrors }

    switch (field) {
      case 'name':
        const nameValidation = validateName(value)
        if (!nameValidation.isValid) {
          errors.name = nameValidation.error || ''
        } else {
          delete errors.name
        }
        break
      case 'email':
        const emailValidation = validateEmail(value)
        if (!emailValidation.isValid) {
          errors.email = emailValidation.error || ''
        } else {
          delete errors.email
        }
        break
      case 'address':
        const addressValidation = validateAddress(value)
        if (!addressValidation.isValid) {
          errors.address = addressValidation.error || ''
        } else {
          delete errors.address
        }
        break
      case 'city':
        const cityValidation = validateCity(value)
        if (!cityValidation.isValid) {
          errors.city = cityValidation.error || ''
        } else {
          delete errors.city
        }
        break
      case 'postalCode':
        const postalValidation = validatePostalCode(value)
        if (!postalValidation.isValid) {
          errors.postalCode = postalValidation.error || ''
        } else {
          delete errors.postalCode
        }
        break
    }

    setValidationErrors(errors)

    // Vérifier si le formulaire est valide
    const validation = validateCustomerDetails({ ...customerDetails, [field]: value })
    setIsFormValid(validation.isValid)
  }

  const renderStepDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos informations</h2>
        <p className="text-gray-600">Renseignez vos coordonnées pour la livraison</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ValidatedInput
            label="Nom complet"
            value={customerDetails.name}
            onChange={(value) => {
              const formattedValue = formatNameInput(value)
              setCustomerDetails(prev => ({ ...prev, name: formattedValue }))
              validateField('name', formattedValue)
            }}
            validator={validateName}
            required={true}
            placeholder="Votre nom complet"
          />

          <ValidatedInput
            label="Email"
            value={customerDetails.email}
            onChange={(value) => {
              setCustomerDetails(prev => ({ ...prev, email: value.toLowerCase() }))
              validateField('email', value.toLowerCase())
            }}
            validator={validateEmail}
            required={true}
            type="email"
            placeholder="votre@email.com"
          />

          <PhoneInput
            label="Téléphone"
            value={customerDetails.phone}
            onChange={(value) => {
              setCustomerDetails(prev => ({ ...prev, phone: value }))
              validateField('phone', value)
            }}
            required={false}
          />
        </div>

        <div className="space-y-4">
          <ValidatedInput
            label="Adresse"
            value={customerDetails.address}
            onChange={(value) => {
              setCustomerDetails(prev => ({ ...prev, address: value }))
              validateField('address', value)
            }}
            validator={validateAddress}
            required={true}
            placeholder="Votre adresse complète"
          />

          <ValidatedInput
            label="Ville"
            value={customerDetails.city}
            onChange={(value) => {
              const formattedValue = formatCityInput(value)
              setCustomerDetails(prev => ({ ...prev, city: formattedValue }))
              validateField('city', formattedValue)
            }}
            validator={validateCity}
            required={true}
            placeholder="Votre ville"
          />

          <ValidatedInput
            label="Code postal"
            value={customerDetails.postalCode}
            onChange={(value) => {
              setCustomerDetails(prev => ({ ...prev, postalCode: value }))
              validateField('postalCode', value)
            }}
            validator={validatePostalCode}
            required={false}
            placeholder="Code postal"
          />
        </div>
      </div>
    </div>
  )

  const renderStepConfirmation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation de commande</h2>
        <p className="text-gray-600">Vérifiez vos informations avant de procéder au paiement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Votre carte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Type :</span>
                <span className="font-medium">{CARD_TYPE_LABELS[selectedCardType]}</span>
              </div>
              <div className="flex justify-between">
                <span>Prix :</span>
                <span className="font-bold text-orange-600">
                  {CARD_PRICING[selectedCardType].toLocaleString()} XOF
                </span>
              </div>
              <div className="flex justify-between">
                <span>Livraison :</span>
                <span className="font-medium">7-14 jours</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informations de livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>{customerDetails.name}</strong></div>
              <div>{customerDetails.email}</div>
              {customerDetails.phone && <div>{customerDetails.phone}</div>}
              {customerDetails.address && <div>{customerDetails.address}</div>}
              {customerDetails.city && <div>{customerDetails.city}</div>}
              {customerDetails.postalCode && <div>{customerDetails.postalCode}</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-orange-900">Mode de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMethods.filter(m => m.is_active).map(method => (
                <div 
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={cn(
                    "cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between bg-white",
                    selectedPaymentMethod === method.id 
                      ? "border-orange-500 ring-2 ring-orange-200" 
                      : "border-gray-100 hover:border-gray-200 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedPaymentMethod === method.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                    )}>
                      {method.provider === 'wave' ? <Wallet className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{method.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium leading-none">
                        {method.description || (method.provider === 'wave' ? 'Wave Direct' : 'Mobile Money')}
                      </p>
                    </div>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index <= currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive
                    ? isCurrent
                      ? 'bg-orange-500 text-white'
                      : 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                  }`}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            )
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {currentStep === 'card_selection' && renderCardSelection()}
          {currentStep === 'details' && renderStepDetails()}
          {currentStep === 'confirmation' && renderStepConfirmation()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 'card_selection'}
        >
          Précédent
        </Button>

        <Button
          onClick={handleNext}
          className="bg-orange-500 hover:bg-orange-600 text-white"
          disabled={isProcessing}
        >
          {currentStep === 'confirmation' ? (
            isProcessing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Traitement en cours...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Procéder au paiement
              </>
            )
          ) : (
            <>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
