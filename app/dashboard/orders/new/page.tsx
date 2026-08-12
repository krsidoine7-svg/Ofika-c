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
import { createClient } from '@/lib/supabase/client'
export default function NewOrderPage() {
  const router = useRouter()
  // Un seul produit disponible : NFC + QR Code
  const selectedCardType = 'nfc_qr' as const
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<'lygos' | 'wave' | 'geniuspay'>('geniuspay')
  const [error, setError] = useState<string | null>(null)
  const [productPrice, setProductPrice] = useState<number>(14600)

  const { paymentMethods, basePrice, loading: paymentMethodsLoading } = usePaymentMethods()
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

  // Mettre à jour le prix avec la valeur officielle BD
  useEffect(() => {
    if (basePrice) {
      setProductPrice(basePrice)
    }
  }, [basePrice])

  // Pré-remplir les informations utilisateur et le prix de secours produits
  useEffect(() => {
    const fetchProductPrice = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('products')
          .select('price')
          .eq('type', selectedCardType)
          .single()
        
        if (data && !error && data.price && !basePrice) {
          setProductPrice(data.price)
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du prix:', err)
      }
    }
    fetchProductPrice()

    const loadUserData = async () => {
      if (user) {
        const response = await getUserData()
        if (response) {
          const userData = response.data || response
          setShippingInfo(prev => ({
            ...prev,
            name: userData.name || prev.name,
            email: userData.email || user.email || prev.email,
            phone: userData.phone || prev.phone,
            city: userData.city || prev.city,
            address: userData.address || prev.address
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

      // Gérer la création de paiement selon le fournisseur
      if (selectedProvider === 'geniuspay') {
        const paymentResponse = await fetch('/api/payments/geniuspay/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
          })
        })

        const paymentData = await paymentResponse.json()

        if (!paymentData.success || !paymentData.checkout_url) {
          throw new Error(paymentData.error || 'Erreur lors de la création du paiement GeniusPay')
        }

        // Rediriger vers le checkout GeniusPay
        window.location.href = paymentData.checkout_url
      } else {
        // Ancienne logique (LyGOS ou Wave)
        const paymentResponse = await fetch(`/api/payments/${selectedProvider}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: productPrice,
            order_id: orderId,
            message: `Commande carte Ofika ${selectedCardType}`
          })
        })

        const paymentData = await paymentResponse.json()

        if (!paymentData.success || !paymentData.data) {
          throw new Error(paymentData.error || 'Erreur lors de la création du paiement')
        }

        // Rediriger vers le checkout
        window.location.href = paymentData.data.link
      }

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
    <div className="min-h-screen bg-gray-50/50 py-6 sm:py-12 font-sans">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Finaliser la commande</h1>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-lg">Complétez vos informations pour recevoir votre carte intelligente.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Colonne de Gauche : Formulaire */}
            <div className="lg:col-span-7 space-y-8 sm:space-y-10">
              
              {/* Informations de livraison */}
              <section>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">1</div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Informations de livraison</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-gray-700">Nom complet</Label>
                    <Input
                      id="name"
                      name="name"
                      value={shippingInfo.name}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="h-11 sm:h-12 text-sm bg-white border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-xl transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">Adresse email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      placeholder="jane@example.com"
                      className="h-11 sm:h-12 text-sm bg-white border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-xl transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-gray-700">Numéro de téléphone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      placeholder="+225..."
                      className="h-11 sm:h-12 text-sm bg-white border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-xl transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="city" className="text-xs sm:text-sm font-semibold text-gray-700">Ville</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      placeholder="Abidjan"
                      className="h-11 sm:h-12 text-sm bg-white border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-xl transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-xs sm:text-sm font-semibold text-gray-700">Adresse de livraison détaillée</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      placeholder="Quartier, Rue, Bâtiment..."
                      className="h-11 sm:h-12 text-sm bg-white border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-xl transition-all"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Méthodes de paiement */}
              <section>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">2</div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Moyen de paiement</h2>
                </div>

                {paymentMethodsLoading ? (
                  <div className="flex items-center justify-center py-12 text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    <span className="text-sm">Chargement...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.filter(m => m.is_active).map(method => (
                      <div
                        key={method.id}
                        onClick={() => {
                          setSelectedPaymentMethod(method.id)
                          setSelectedProvider(method.provider as any)
                        }}
                        className={`group relative flex items-center p-3.5 sm:p-5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                          selectedPaymentMethod === method.id
                            ? 'border-gray-900 bg-gray-900/5 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 mr-3 sm:mr-4 transition-colors ${
                          selectedPaymentMethod === method.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          {method.provider === 'wave' ? <Wallet className="h-5 w-5 sm:h-6 sm:w-6" /> : <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-sm sm:text-base truncate ${selectedPaymentMethod === method.id ? 'text-gray-900' : 'text-gray-700'}`}>{method.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{method.description || 'Paiement sécurisé'}</p>
                        </div>
                        {/* Radio Check Indicator */}
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ml-2 ${
                          selectedPaymentMethod === method.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                        }`}>
                          {selectedPaymentMethod === method.id && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    ))}
                    
                    {paymentMethods.filter(m => m.is_active).length === 0 && (
                      <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm text-gray-500">Aucun mode de paiement activé.</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Colonne de Droite : Résumé de la commande */}
            <div className="lg:col-span-5">
              <div className="sticky top-8 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-[2rem] p-5 sm:p-8">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">Résumé</h3>
                
                {/* Produit Item */}
                <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border border-gray-100">
                     <Smartphone className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-tight truncate">Carte NFC + QR Code</h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Édition Standard</p>
                    <p className="font-bold text-sm sm:text-base text-gray-900 mt-1">{productPrice.toLocaleString()} XOF</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-xs sm:text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Sous-total</span>
                    <span className="font-medium text-gray-900">{productPrice.toLocaleString()} XOF</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Livraison (7-14 jours)</span>
                    <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">Offerte</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-6 sm:mb-8 pt-4 sm:pt-6 border-t border-gray-100">
                  <div>
                    <span className="block text-xs sm:text-sm font-medium text-gray-500 mb-0.5">Total</span>
                    <span className="block text-[10px] sm:text-xs text-gray-400">Taxes incluses</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {productPrice.toLocaleString()} <span className="text-lg sm:text-xl text-gray-500 font-normal">XOF</span>
                  </span>
                </div>

                <Button
                  onClick={handleOrder}
                  disabled={!selectedPaymentMethod || isProcessing}
                  className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 ${!selectedPaymentMethod || isProcessing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5'
                  }`}
                >
                  {isProcessing ? (
                     <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    `Payer ${productPrice.toLocaleString()} XOF`
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400 mt-4 sm:mt-6 flex items-center justify-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Paiement 100% sécurisé
                </p>

                {error && (
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5 sm:gap-3">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-red-800 break-words">{error}</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
