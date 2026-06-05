'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Smartphone,
  CreditCard,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Info,
  MapPin,
  User,
  Mail,
  Phone,
  Wallet
} from "lucide-react"
import { toast } from "sonner"
import { usePaymentMethods } from '@/lib/hooks/usePayments'
import { useUser } from '@/lib/hooks/useUser'
import { CARD_PRICING } from '@/lib/types/payments'
import { API_ENDPOINTS } from '@/lib/config/urls'

export default function NewOrderPage() {
  const router = useRouter()
  // Un seul produit disponible : NFC + QR Code
  const selectedCardType = 'nfc_qr' as const
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<'lygos' | 'wave'>('lygos')
  const [error, setError] = useState<string | null>(null)

  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods()
  const { user, getUserData } = useUser()

  const [isProcessing, setIsProcessing] = useState(false)

  // État pour les informations de livraison
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  })

  // Pré-remplir les informations utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const userData = await getUserData()
        if (userData) {
          setShippingInfo(prev => ({
            ...prev,
            name: userData.name || prev.name,
            email: userData.email || user.email || prev.email,
            phone: userData.phone || prev.phone
          }))
        }
      }
    }
    loadUserData()
  }, [user, getUserData])

  // Sélectionner automatiquement le premier mode de paiement actif
  useEffect(() => {
    if (!paymentMethodsLoading && paymentMethods.length > 0) {
      const firstActive = paymentMethods.find(m => m.is_active)
      if (firstActive && !selectedPaymentMethod) {
        setSelectedPaymentMethod(firstActive.id)
        setSelectedProvider(firstActive.provider as any)
      }
    }
  }, [paymentMethods, paymentMethodsLoading, selectedPaymentMethod])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!shippingInfo.name || shippingInfo.name.length < 2) return 'Le nom est requis (min 2 caractères)'
    if (!shippingInfo.email) return 'L\'email est requis'
    if (!shippingInfo.phone || shippingInfo.phone.length < 8) return 'Le téléphone est requis (min 8 caractères)'
    if (!shippingInfo.address || shippingInfo.address.length < 2) return 'L\'adresse est requise (min 2 caractères)'
    if (!shippingInfo.city || shippingInfo.city.length < 2) return 'La ville est requise (min 2 caractères)'
    return null
  }

  const handleOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Veuillez sélectionner une méthode de paiement')
      return
    }

    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      setError(validationError)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Créer la commande d'abord
      const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_type: selectedCardType,
          quantity: 1,
          payment_method: selectedPaymentMethod,
          shipping_address: shippingInfo
        })
      })

      const data = await response.json()

      if (!data.success || !data.order) {
        // Gérer les erreurs de validation détaillées
        if (data.code === 'VALIDATION_ERROR' && data.details) {
          const details = data.details.map((d: any) => `${d.field}: ${d.message}`).join('\n')
          throw new Error(`Erreur de validation:\n${details}`)
        }
        throw new Error(data.error || 'Erreur lors de la création de la commande')
      }

      const orderId = data.order.id

      // Créer le paiement (LyGOS ou Wave)
      const paymentResponse = await fetch(`/api/payments/${selectedProvider}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: CARD_PRICING[selectedCardType],
          order_id: orderId,
          message: `Commande carte Ofika ${selectedCardType}`
        })
      })

      const paymentData = await paymentResponse.json()

      if (!paymentData.success || !paymentData.data) {
        throw new Error(paymentData.error || 'Erreur lors de la création du paiement')
      }

      // Rediriger vers le checkout LyGOS
      window.location.href = paymentData.data.link

    } catch (err) {
      console.error('Erreur lors de la commande:', err)
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(message)
      toast.error('Erreur lors de la création de la commande', {
        description: message
      })
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    router.back()
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <h1 className="text-3xl font-bold text-gray-900">Commander votre carte NFC</h1>
            <p className="text-gray-600 mt-2">
              Carte complète avec technologie NFC et QR Code - {CARD_PRICING.nfc_qr.toLocaleString()} XOF
            </p>
          </div>

          <div className="grid gap-6">
            {/* Produit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Votre produit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-orange-500 bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">Carte NFC + QR Code</h3>
                      <p className="text-gray-700 mb-3">
                        Carte complète avec technologie NFC et QR Code
                      </p>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-orange-600 text-white text-lg font-bold px-4 py-1">
                          {CARD_PRICING.nfc_qr.toLocaleString()} XOF
                        </Badge>
                        <span className="text-sm text-gray-600">• Livraison 7-14 jours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de livraison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleInputChange}
                        placeholder="Votre nom"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        placeholder="votre@email.com"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="+225..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      placeholder="Abidjan"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresse de livraison *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      placeholder="Quartier, Rue, Appartement..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code Postal (Optionnel)</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      placeholder="BP..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Méthodes de paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <Label className="text-lg font-bold text-blue-900">Choisissez votre méthode de paiement *</Label>

                  {paymentMethodsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des méthodes de paiement...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dynamically list active payment methods */}
                      {paymentMethods.filter(m => m.is_active).map(method => (
                        <Card
                          key={method.id}
                          className={`cursor-pointer transition-all duration-200 border-2 ${selectedPaymentMethod === method.id
                            ? 'ring-4 ring-orange-500 bg-orange-50 border-orange-500 shadow-lg scale-105'
                            : 'border-gray-300 hover:border-orange-300 hover:shadow-md'
                            }`}
                          onClick={() => {
                            setSelectedPaymentMethod(method.id)
                            setSelectedProvider(method.provider as any)
                          }}
                        >
                          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${selectedPaymentMethod === method.id
                              ? 'bg-orange-500'
                              : 'bg-gray-100'
                              }`}>
                              {method.provider === 'wave' ? (
                                <Wallet className={`h-6 w-6 ${selectedPaymentMethod === method.id ? 'text-white' : 'text-gray-600'}`} />
                              ) : (
                                <Smartphone className={`h-6 w-6 ${selectedPaymentMethod === method.id ? 'text-white' : 'text-gray-600'}`} />
                              )}
                            </div>
                            <span className="font-semibold text-base block mb-1">{method.name}</span>
                            <span className="text-sm text-gray-600 block">{method.description || 'Paiement sécurisé'}</span>
                            {selectedPaymentMethod === method.id && (
                              <div className="mt-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}

                      {/* Fallback if none found */}
                      {paymentMethods.filter(m => m.is_active).length === 0 && (
                        <div className="col-span-1 md:col-span-2 text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Aucun mode de paiement activé.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Résumé de la commande */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border-2 border-orange-200">
                  <h4 className="font-bold text-lg mb-4 text-orange-900">Résumé de la commande</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Produit :</span>
                      <span className="font-semibold">Carte NFC + QR Code</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Quantité :</span>
                      <span className="font-semibold">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Livraison :</span>
                      <span className="font-semibold text-green-600">Gratuite</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Délai estimé :</span>
                      <span className="font-semibold">7-14 jours ouvrés</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold border-t-2 border-orange-300 pt-3 mt-3">
                      <span className="text-gray-900">Total à payer :</span>
                      <span className="text-orange-600">
                        {CARD_PRICING.nfc_qr.toLocaleString()} XOF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bouton commander */}
                <Button
                  onClick={handleOrder}
                  disabled={!selectedPaymentMethod || isProcessing}
                  className={`w-full py-6 text-lg font-semibold shadow-lg transition-all ${!selectedPaymentMethod || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                    }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payer {CARD_PRICING.nfc_qr.toLocaleString()} XOF 💳
                    </>
                  )}
                </Button>

                {/* Messages d'erreur */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
