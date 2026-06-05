'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import {
  usePaymentMethods,
  PaymentMethod,
  PaymentData,
  PaymentMethodSelector,
  PaymentUtils
} from '@/lib/hooks/usePayments'

function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Récupérer les paramètres de l'URL
  const type = searchParams.get('type') || 'generic'
  const amount = parseFloat(searchParams.get('amount') || '0')
  const currency = searchParams.get('currency') || 'XOF'
  const description = searchParams.get('description') || 'Paiement'
  const orderId = searchParams.get('order_id') || PaymentUtils.generateOrderId()

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | undefined>(undefined)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'methods' | 'info' | 'confirm'>('methods')

  const { paymentMethods, loading: methodsLoading, error: methodsError } = usePaymentMethods()

  // Filtrer les méthodes selon le montant
  const availableMethods = paymentMethods.filter(method => {
    if (!method.is_active) return false
    if (method.min_amount && amount < method.min_amount) return false
    if (method.max_amount && amount > method.max_amount) return false
    return true
  })

  useEffect(() => {
    // Sélectionner automatiquement la première méthode disponible
    if (availableMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(availableMethods[0])
    }
  }, [availableMethods, selectedMethod])

  const handlePayment = async () => {
    if (!selectedMethod || !customerInfo.name || !customerInfo.email) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    setIsProcessing(true)

    try {
      const paymentData: PaymentData = {
        amount,
        currency,
        description,
        order_id: orderId,
        customer_email: customerInfo.email,
        customer_name: customerInfo.name,
        success_url: `${window.location.origin}/payment/success?order_id=${orderId}`,
        cancel_url: `${window.location.origin}/payment/cancelled?order_id=${orderId}`,
        metadata: {
          type,
          phone: customerInfo.phone,
          timestamp: new Date().toISOString()
        }
      }

      const response = await fetch(`/api/payments/${selectedMethod.provider}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la création du paiement')
      }

      if (result.data?.link) {
        // Rediriger vers la page de paiement externe
        window.location.href = result.data.link
      } else {
        toast.success('Paiement créé avec succès !')
        router.push('/payment/success')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      toast.error(errorMessage)
      console.error('Erreur paiement:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const nextStep = () => {
    if (step === 'methods' && selectedMethod) {
      setStep('info')
    } else if (step === 'info' && customerInfo.name && customerInfo.email) {
      setStep('confirm')
    }
  }

  const prevStep = () => {
    if (step === 'confirm') {
      setStep('info')
    } else if (step === 'info') {
      setStep('methods')
    }
  }

  if (methodsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des méthodes de paiement...</p>
        </div>
      </div>
    )
  }

  if (methodsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">
              Impossible de charger les méthodes de paiement. Veuillez réessayer.
            </p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fees = selectedMethod?.fees ? PaymentUtils.calculateFees(amount, selectedMethod.fees / 100) : 0
  const totalAmount = amount + fees

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => step === 'methods' ? router.back() : prevStep()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 'methods' ? 'Retour' : 'Précédent'}
            </Button>

            <div className="text-center">
              <h1 className="text-lg font-semibold">Paiement sécurisé</h1>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-600">SSL 256-bit</span>
              </div>
            </div>

            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Étapes du processus */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'methods' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'methods' ? 'bg-blue-600 text-white' :
                ['info', 'confirm'].includes(step) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="text-sm">Méthode</span>
            </div>

            <div className={`w-8 h-0.5 ${['info', 'confirm'].includes(step) ? 'bg-green-600' : 'bg-gray-200'}`}></div>

            <div className={`flex items-center space-x-2 ${step === 'info' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'info' ? 'bg-blue-600 text-white' :
                step === 'confirm' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm">Informations</span>
            </div>

            <div className={`w-8 h-0.5 ${step === 'confirm' ? 'bg-green-600' : 'bg-gray-200'}`}></div>

            <div className={`flex items-center space-x-2 ${step === 'confirm' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-sm">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Étape 1: Sélection de la méthode de paiement */}
        {step === 'methods' && (
          <Card>
            <CardHeader>
              <CardTitle>Choisissez votre méthode de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodSelector
                paymentMethods={availableMethods}
                selectedMethod={selectedMethod}
                onSelect={setSelectedMethod}
                amount={amount}
                currency={currency}
              />

              {availableMethods.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Aucune méthode de paiement n'est disponible pour ce montant.
                    Montant minimum requis : {PaymentUtils.formatAmount(100, currency)}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Informations client */}
        {step === 'info' && (
          <Card>
            <CardHeader>
              <CardTitle>Vos informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    placeholder="Votre nom complet"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@example.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  placeholder="+225 XX XX XX XX"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Ces informations sont nécessaires pour traiter votre paiement et vous contacter si besoin.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-6">
            {/* Récapitulatif de la commande */}
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif de votre paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Description</span>
                  <span className="font-medium">{description}</span>
                </div>

                <div className="flex justify-between">
                  <span>Montant</span>
                  <span>{PaymentUtils.formatAmount(amount, currency)}</span>
                </div>

                {fees > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Frais de transaction ({selectedMethod?.fees}%)</span>
                    <span>{PaymentUtils.formatAmount(fees, currency)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">{PaymentUtils.formatAmount(totalAmount, currency)}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium mb-2">Informations client</h4>
                    <p className="text-sm text-gray-600">{customerInfo.name}</p>
                    <p className="text-sm text-gray-600">{customerInfo.email}</p>
                    {customerInfo.phone && (
                      <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Méthode de paiement</h4>
                    <p className="text-sm text-gray-600">{selectedMethod?.name}</p>
                    <p className="text-sm text-gray-600">{selectedMethod?.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sécurité et conditions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-1">Paiement sécurisé</p>
                    <p>Vos informations sont chiffrées et ne sont jamais stockées sur nos serveurs.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 'methods' || isProcessing}
          >
            Précédent
          </Button>

          {step !== 'confirm' ? (
            <Button
              onClick={nextStep}
              disabled={
                (step === 'methods' && !selectedMethod) ||
                (step === 'info' && (!customerInfo.name || !customerInfo.email))
              }
            >
              Continuer
            </Button>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payer {PaymentUtils.formatAmount(totalAmount, currency)}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Footer avec informations légales */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>En procédant au paiement, vous acceptez nos conditions générales de vente.</p>
          <p className="mt-1">Paiement sécurisé par {selectedMethod?.name || 'fournisseur externe'}</p>
        </div>
      </div>
    </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du checkout...</p>
                </div>
            </div>
        }>
            <CheckoutForm />
        </Suspense>
    )
}