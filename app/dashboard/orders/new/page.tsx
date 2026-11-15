'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Smartphone,
  CreditCard,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Check,
  RotateCcw,
  ShieldCheck
} from "lucide-react"
import { toast } from "sonner"
import { usePaymentMethods } from '@/lib/hooks/usePayments'
import { useUser } from '@/lib/hooks/useUser'
import { useProfiles } from '@/lib/hooks/useProfiles'
import { API_ENDPOINTS } from '@/lib/config/urls'
import { CardVisual } from '@/components/features/card-creator/CardVisual'
import { cn } from '@/lib/utils'

export default function NewOrderPage() {
  const router = useRouter()
  const selectedCardType = 'nfc_qr' as const

  // Hooks de données
  const { paymentMethods, basePrice, loading: paymentMethodsLoading } = usePaymentMethods()
  const { user, getUserData } = useUser()
  const { profiles, loading: profilesLoading } = useProfiles()

  // État du prix
  const [productPrice, setProductPrice] = useState<number>(14600)

  // État du Stepper Mobile (1: Personnalisation, 2: Livraison, 3: Paiement)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  // Module 1 : Personnalisation de la carte
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [cardColor, setCardColor] = useState<'black' | 'white'>('black')
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardData, setCardData] = useState({
    fullName: '',
    company: '',
    jobTitle: '',
    qrValue: 'https://ofika.ci'
  })

  // Module 2 : Livraison
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Abidjan',
    postalCode: ''
  })

  // Module 3 : Paiement
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('geniuspay')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Synchronisation du prix
  useEffect(() => {
    if (basePrice) {
      setProductPrice(basePrice)
    }
  }, [basePrice])

  // 2. Sélection automatique du profil et pré-remplissage
  useEffect(() => {
    if (profiles && profiles.length > 0 && !selectedProfileId) {
      const firstProfile = profiles[0]
      setSelectedProfileId(firstProfile.id)
      
      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci'
      const slug = firstProfile.custom_url || firstProfile.username || firstProfile.id
      
      setCardData({
        fullName: firstProfile.name || '',
        company: firstProfile.company || '',
        jobTitle: firstProfile.job_title || '',
        qrValue: `${appUrl}/${slug}`
      })
    }
  }, [profiles, selectedProfileId])

  // 3. Pré-remplissage des informations de livraison depuis le compte utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const response = await getUserData()
        if (response) {
          const userData = response.data || response
          setShippingInfo(prev => ({
            ...prev,
            name: userData.name || prev.name || (userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : ''),
            email: userData.email || user.email || prev.email,
            phone: userData.phone || prev.phone,
            city: userData.city || prev.city || 'Abidjan',
            address: userData.address || prev.address
          }))

          // Si aucun profil n'a été créé, pré-remplir la gravure avec le nom du compte
          if (!cardData.fullName) {
            setCardData(prev => ({
              ...prev,
              fullName: userData.name || (userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : '') || 'Votre Nom'
            }))
          }
        }
      }
    }
    loadUserData()
  }, [user, getUserData])

  // 4. Gestion du changement de profil sélectionné
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId)
    const found = profiles.find(p => p.id === profileId)
    if (found) {
      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci'
      const slug = found.custom_url || found.username || found.id

      setCardData({
        fullName: found.name || '',
        company: found.company || '',
        jobTitle: found.job_title || '',
        qrValue: `${appUrl}/${slug}`
      })
    }
  }

  // Passerelles de paiement actives selon la configuration admin
  const activePaymentMethods = useMemo(() => {
    return (paymentMethods || []).filter(m => m.is_active)
  }, [paymentMethods])

  // 5. Sélection automatique de la méthode de paiement parmi celles actives
  useEffect(() => {
    if (!paymentMethodsLoading && activePaymentMethods.length > 0) {
      const isCurrentActive = activePaymentMethods.some(m => m.id === selectedPaymentMethod)
      if (!isCurrentActive) {
        setSelectedPaymentMethod(activePaymentMethods[0].id)
      }
    }
  }, [activePaymentMethods, paymentMethodsLoading, selectedPaymentMethod])

  // Gestion des champs de livraison
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingInfo(prev => ({ ...prev, [name]: value }))
  }

  // Validation du formulaire
  const validateForm = () => {
    if (!shippingInfo.name || shippingInfo.name.trim().length < 2) {
      return 'Veuillez renseigner le nom complet du destinataire'
    }
    if (!shippingInfo.phone || shippingInfo.phone.trim().length < 8) {
      return 'Veuillez saisir un numéro de téléphone valide pour la livraison (min 8 chiffres)'
    }
    if (!shippingInfo.city || shippingInfo.city.trim().length < 2) {
      return 'Veuillez indiquer la ville ou commune de livraison'
    }
    if (!shippingInfo.address || shippingInfo.address.trim().length < 2) {
      return 'Veuillez préciser l\'adresse de livraison (quartier, repère)'
    }
    return null
  }

  // Navigation du Stepper Mobile avec validation pas-à-pas
  const handleNextFromStep1 = () => {
    if (!cardData.fullName || cardData.fullName.trim().length < 2) {
      toast.error('Veuillez renseigner le nom à graver sur la carte')
      return
    }
    setCurrentStep(2)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNextFromStep2 = () => {
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }
    setCurrentStep(3)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Lancement du paiement
  const handleOrder = async () => {
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      setError(validationError)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // 1. Création de la commande
      const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: selectedProfileId || undefined,
          card_type: selectedCardType,
          quantity: 1,
          payment_method: 'geniuspay',
          shipping_address: shippingInfo,
          metadata: {
            card_finish: cardColor,
            engraved_name: cardData.fullName,
            engraved_company: cardData.company,
            engraved_job_title: cardData.jobTitle,
          }
        })
      })

      const data = await response.json()

      if (!data.success || !data.order) {
        if (data.code === 'VALIDATION_ERROR' && data.details) {
          const details = data.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
          throw new Error(`Erreur de validation: ${details}`)
        }
        throw new Error(data.error || 'Erreur lors de la création de la commande')
      }

      const orderId = data.order.id

      // 2. Déclenchement de la passerelle officielle GeniusPay (Wave, Orange, MTN, Moov, CB)
      const paymentResponse = await fetch('/api/payments/geniuspay/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId })
      })

      const paymentData = await paymentResponse.json()

      if (!paymentData.success || !paymentData.checkout_url) {
        throw new Error(paymentData.error || 'Erreur lors de la redirection vers GeniusPay')
      }

      // Redirection résiliente
      window.location.assign(paymentData.checkout_url)
      setTimeout(() => { setIsProcessing(false) }, 8000)
    } catch (err: any) {
      console.error('Erreur lors de la commande:', err)
      const message = err instanceof Error ? err.message : 'Une erreur inattendue est survenue'
      setError(message)
      toast.error('Échec de la commande', { description: message })
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-32 lg:pb-20 pt-4 sm:pt-8 font-sans">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">

        {/* Fil d'Ariane & Titre */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-3">
            <Link
              href="/dashboard"
              className="hover:text-slate-900 transition-colors"
            >
              Tableau de bord
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-1 font-medium hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour aux commandes
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Commander votre Carte NFC
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">
                Recevez votre carte physique connectée, prête à être partagée en 1 seconde.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Livraison gratuite à Abidjan
              </span>
            </div>
          </div>
        </div>

        {/* Stepper Progress Bar (Mobile uniquement) */}
        <div className="block lg:hidden mb-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1)
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={cn(
                "flex-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1",
                currentStep === 1
                  ? "bg-slate-900 text-white shadow-xs"
                  : currentStep > 1
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-400 hover:text-slate-700"
              )}
            >
              {currentStep > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className={cn("w-4 h-4 rounded-full text-[10px] inline-flex items-center justify-center", currentStep === 1 ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500")}>1</span>}
              <span>Carte</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentStep > 2) {
                  setCurrentStep(2)
                  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
                } else if (currentStep === 1) {
                  handleNextFromStep1()
                }
              }}
              className={cn(
                "flex-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1",
                currentStep === 2
                  ? "bg-slate-900 text-white shadow-xs"
                  : currentStep > 2
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-400 hover:text-slate-700"
              )}
            >
              {currentStep > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className={cn("w-4 h-4 rounded-full text-[10px] inline-flex items-center justify-center", currentStep === 2 ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500")}>2</span>}
              <span>Livraison</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentStep === 2) handleNextFromStep2()
              }}
              className={cn(
                "flex-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1",
                currentStep === 3
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              )}
            >
              <span className={cn("w-4 h-4 rounded-full text-[10px] inline-flex items-center justify-center", currentStep === 3 ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500")}>3</span>
              <span>Paiement</span>
            </button>
          </div>
        </div>

        {/* Aperçu Mobile Réductible (affiché au-dessus sur smartphone UNIQUEMENT à l'étape 1) */}
        <div className={cn("mb-6", currentStep === 1 ? "block lg:hidden" : "hidden")}>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Aperçu en direct</span>
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                {isFlipped ? 'Voir le Recto' : 'Voir le Verso'}
              </button>
            </div>
            <div className="w-full max-w-[280px] mx-auto aspect-[1.586/1] drop-shadow-md">
              <CardVisual
                design="design1"
                color={cardColor}
                isFlipped={isFlipped}
                data={{
                  fullName: cardData.fullName || 'Votre Nom',
                  company: cardData.company || '',
                  jobTitle: cardData.jobTitle || '',
                  qrValue: cardData.qrValue
                }}
              />
            </div>
          </div>
        </div>

        {/* Grille Principale 2 Colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ======================================================== */}
          {/* COLONNE GAUCHE : FORMULAIRE MODULAIRE (lg:col-span-7)     */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">

            {/* SECTION 1 : Personnalisation & Profil [M01] */}
            <div className={cn(
              "bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs",
              currentStep !== 1 && "hidden lg:block"
            )}>
              <div className="mb-5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Personnalisation de la carte
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Choisissez le profil à associer et les informations à graver.
                </p>
              </div>

              <div className="space-y-4">
                {/* Sélecteur de profil existant */}
                {profiles && profiles.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-semibold text-slate-700">
                      Profil Ofika associé à la carte
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {profiles.map(prof => (
                        <div
                          key={prof.id}
                          onClick={() => handleProfileChange(prof.id)}
                          className={cn(
                            "cursor-pointer p-3 rounded-xl border text-left transition-all flex items-center gap-3",
                            selectedProfileId === prof.id
                              ? "border-orange-500 bg-orange-50/30 ring-2 ring-orange-500/20"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          )}
                        >
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 overflow-hidden">
                            {prof.image_url ? (
                              <img src={prof.image_url} alt={prof.name} className="w-full h-full object-cover" />
                            ) : (
                              (prof.name || 'P')[0]?.toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{prof.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">ofika.ci/{prof.custom_url || prof.username}</p>
                          </div>
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                            selectedProfileId === prof.id ? "border-orange-500 bg-orange-500" : "border-slate-300"
                          )}>
                            {selectedProfileId === prof.id && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Choix de la finition physique (Segmented Control Épuré) */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Finition de la carte
                  </Label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setCardColor('black')}
                      className={cn(
                        "h-11 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2",
                        cardColor === 'black'
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-black border border-white/30 shrink-0" />
                      <span>Noir Mat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCardColor('white')}
                      className={cn(
                        "h-11 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2",
                        cardColor === 'white'
                          ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 shadow-2xs shrink-0" />
                      <span>Blanc Épuré</span>
                    </button>
                  </div>
                </div>

                {/* Champs de gravure en direct */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="engraved_name" className="text-xs font-semibold text-slate-700">
                      Nom gravé sur la carte
                    </Label>
                    <Input
                      id="engraved_name"
                      value={cardData.fullName}
                      onChange={(e) => setCardData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Ex: Jean Kouassi"
                      className="h-11 text-sm bg-white border-slate-200 rounded-xl focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="engraved_company" className="text-xs font-semibold text-slate-700">
                      Entreprise / Titre professionnel
                    </Label>
                    <Input
                      id="engraved_company"
                      value={cardData.company}
                      onChange={(e) => setCardData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Ex: Architecte d'intérieur"
                      className="h-11 text-sm bg-white border-slate-200 rounded-xl focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2 : Adresse de Livraison [M02] */}
            <div className={cn(
              "bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs",
              currentStep !== 2 && "hidden lg:block"
            )}>
              <div className="mb-5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Adresse et contact de livraison
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Le livreur vous contacte par téléphone avant son passage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                    Nom complet du destinataire
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={shippingInfo.name}
                    onChange={handleShippingChange}
                    placeholder="Ex: Jean Kouassi"
                    className="h-11 text-sm bg-white border-slate-200 rounded-xl focus:border-slate-900 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                    Numéro de téléphone (pour le livreur)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                    placeholder="+225 07 00 00 00 00"
                    className="h-11 text-sm bg-white border-slate-200 rounded-xl focus:border-slate-900 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    Adresse email (pour le reçu)
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    placeholder="jean@example.com"
                    className="h-11 text-sm bg-white border-slate-200 rounded-xl focus:border-slate-900 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
                    Ville ou Commune
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    placeholder="Ex: Cocody, Abidjan"
                    className="h-11 text-sm bg-white border-slate-200 rounded-xl focus:border-slate-900 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address" className="text-xs font-semibold text-slate-700">
                    Adresse détaillée / Quartier / Repère
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    placeholder="Ex: Angré 8ème tranche, pharmacie des grâces, Villa 42"
                    className="h-11 text-sm bg-white border-slate-200 rounded-xl focus:border-slate-900 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3 : Moyen de Paiement [M03] */}
            <div className={cn(
              "bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs",
              currentStep !== 3 && "hidden lg:block"
            )}>
              <div className="mb-5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Mode de paiement sécurisé
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Règlement instantané en Francs CFA (XOF) sans frais cachés.
                </p>
              </div>

              {paymentMethodsLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Chargement des modes de paiement...
                </div>
              ) : activePaymentMethods.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  Aucun mode de paiement n'est actif actuellement. Veuillez contacter l'administrateur.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Option GeniusPay : Mobile Money (Wave, Orange, MTN, Moov) & Cartes */}
                  <div className="p-4 sm:p-5 rounded-2xl border-2 border-orange-500 bg-orange-50/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-slate-900">
                            Mobile Money & Carte Bancaire
                          </h4>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Instantané
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Wave, Orange Money, MTN, Moov, Carte Visa & Mastercard
                        </p>

                        {/* Badges des opérateurs africains */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1DA1F2] text-white">
                            Wave
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF7900] text-white">
                            Orange
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFCC00] text-slate-950">
                            MTN
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0055A5] text-white">
                            Moov
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white">
                            Visa / CB
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-orange-500 flex items-center justify-center shrink-0 self-end sm:self-center">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Récapitulatif Tarifaire Mobile (Étape 3) */}
              <div className="block lg:hidden pt-4 mt-4 border-t border-slate-100 space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>1× Carte NFC Physique personnalisée</span>
                    <span className="font-semibold text-slate-900">{productPrice.toLocaleString('fr-FR')} XOF</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Packaging protecteur Ofika</span>
                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Offert</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Livraison à Abidjan</span>
                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">Gratuite</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Total à régler</span>
                      <span className="text-[10px] text-slate-400">TTC</span>
                    </div>
                    <span className="text-xl font-extrabold text-slate-950">{productPrice.toLocaleString('fr-FR')} XOF</span>
                  </div>
                </div>

                {/* Badges de Réassurance Mobile */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Paiement chiffré SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Garantie matérielle</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* COLONNE DROITE : MOCKUP CARTE & RÉSUMÉ STICKY (PC/Mac)   */}
          {/* ======================================================== */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-6 space-y-5">

              {/* Mockup de la Carte Physique [M04] */}
              <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Rendu de votre Carte
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {isFlipped ? 'Voir le Recto' : 'Voir le Verso'}
                  </button>
                </div>

                {/* Conteneur de la carte proportionnelle exacte */}
                <div className="w-full max-w-[320px] mx-auto aspect-[1.586/1] drop-shadow-xl transition-transform duration-300 hover:scale-[1.02]">
                  <CardVisual
                    design="design1"
                    color={cardColor}
                    isFlipped={isFlipped}
                    data={{
                      fullName: cardData.fullName || 'Votre Nom',
                      company: cardData.company || '',
                      jobTitle: cardData.jobTitle || '',
                      qrValue: cardData.qrValue
                    }}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Puce NFC NTAG216 haute sensibilité et QR code gravé</span>
                </div>
              </div>

              {/* Résumé de Facturation */}
              <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
                  Détail de la commande
                </h3>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>1× Carte NFC Physique personnalisée</span>
                    <span className="font-semibold text-slate-900">{productPrice.toLocaleString('fr-FR')} XOF</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Packaging protecteur Ofika</span>
                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">Offert</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Livraison sécurisée</span>
                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">Gratuite</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Total à régler</span>
                    <span className="text-[10px] text-slate-400">Toutes taxes comprises</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                      {productPrice.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 ml-1">XOF</span>
                  </div>
                </div>

                {/* Bouton d'action principal CTA */}
                <Button
                  onClick={handleOrder}
                  disabled={isProcessing}
                  className={cn(
                    "w-full h-12 sm:h-13 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-lg transition-all duration-300",
                    "bg-orange-500 hover:bg-orange-600 text-white hover:shadow-orange-500/25 hover:-translate-y-0.5"
                  )}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sécurisation du paiement...
                    </span>
                  ) : (
                    <span>Commander ma carte ({productPrice.toLocaleString('fr-FR')} XOF)</span>
                  )}
                </Button>

                {/* Message d'erreur éventuel */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Badges de Réassurance */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Paiement chiffré SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Garantie matérielle</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* BARRE DE NAVIGATION MOBILE FIXÉE SOUS LE POUCE (lg:hidden) */}
        {/* ======================================================== */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 sm:p-4 shadow-xl lg:hidden">
          <div className="container max-w-lg mx-auto">
            {currentStep === 1 && (
              <Button
                type="button"
                onClick={handleNextFromStep1}
                className="w-full h-12 rounded-xl text-sm font-bold bg-slate-900 hover:bg-black text-white shadow-md flex items-center justify-center gap-2"
              >
                <span>Continuer vers la livraison</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {currentStep === 2 && (
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(1)
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="h-12 px-4 rounded-xl text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="flex-1 h-12 rounded-xl text-sm font-bold bg-slate-900 hover:bg-black text-white shadow-md flex items-center justify-center gap-2"
                >
                  <span>Passer au paiement</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(2)
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="h-12 px-4 rounded-xl text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleOrder}
                  disabled={isProcessing}
                  className="flex-1 h-12 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Paiement en cours...
                    </span>
                  ) : (
                    <span>Payer {productPrice.toLocaleString('fr-FR')} XOF</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
