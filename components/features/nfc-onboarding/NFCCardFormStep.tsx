'use client'

import { useState, useEffect } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NFCCardStepProps, NFCCardFormData } from '@/lib/types/nfc-card-onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, User, Building, Phone, Mail, MapPin, Link, Image, Globe, MessageCircle, Facebook, Instagram, Twitter, Youtube, Linkedin, Plus, Trash2, Sliders } from 'lucide-react'
import { toast } from 'sonner'
import { ConsentBanner, ConsentData } from '@/components/features/consent/ConsentBanner'
import { useConsent } from '@/lib/hooks/useConsent'

// Schéma de validation
const nfcCardSchema = z.object({
  fullName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().min(1, 'Téléphone requis').regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Format téléphone invalide'),
  email: z.string().min(1, 'Email requis').email('Format email invalide'),
  social_links: z.array(z.object({
    platform: z.string(),
    url: z.string()
  })).optional(),
  custom_links: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.string().optional()
  })).optional()
})

export function NFCCardFormStep({ formData, onDataChange, onNext, onPrev, onValidationChange, isLoading }: NFCCardStepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logoUrl || null)
  const [logoFile, setLogoFile] = useState<File | null>(formData.logoFile || null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)

  const { updateConsent } = useConsent()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<NFCCardFormData>({
    // Le schéma ne valide qu'une partie des champs de NFCCardFormData (comportement identique à Zod 3)
    resolver: zodResolver(nfcCardSchema) as unknown as Resolver<NFCCardFormData>,
    defaultValues: formData,
    mode: 'onChange'
  })

  // Watcher pour les changements en temps réel
  const watchedData = watch()

  // ✅ Synchroniser le formulaire si formData change (ex: auto-remplissage)
  useEffect(() => {
    const currentValues = watch()
    if (formData.fullName && !currentValues.fullName) setValue('fullName', formData.fullName)
    if (formData.email && !currentValues.email) setValue('email', formData.email)
    if (formData.phone && !currentValues.phone) setValue('phone', formData.phone)
    if (formData.company && !currentValues.company) setValue('company', formData.company)
    if (formData.jobTitle && !currentValues.jobTitle) setValue('jobTitle', formData.jobTitle)

    // Si des données sont présentes, on déclenche la validation
    if (formData.fullName || formData.email || formData.phone) {
      trigger()
    }
  }, [formData.fullName, formData.email, formData.phone, formData.company, formData.jobTitle, setValue, trigger])

  // Mise à jour des données parent
  const handleDataChange = (field: keyof NFCCardFormData, value: any) => {
    setValue(field, value)
    onDataChange({ [field]: value })
    // Déclencher la validation après chaque changement
    trigger()
  }

  // Gestion de l'upload de logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validation du fichier
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Format de fichier non supporté (PNG, JPG, SVG uniquement)')
      return
    }

    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux (max 5MB)')
      return
    }

    // Création de l'URL de prévisualisation
    const previewUrl = URL.createObjectURL(file)
    setLogoPreview(previewUrl)
    setLogoFile(file)

    // Mise à jour des données
    handleDataChange('logoFile', file)
    handleDataChange('logoUrl', previewUrl)
  }

  // Suppression du logo
  const handleLogoRemove = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoPreview(null)
    setLogoFile(null)
    handleDataChange('logoFile', undefined)
    handleDataChange('logoUrl', undefined)
  }

  // Gestion de l'upload de photo de profil
  const handleProfilePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validation du fichier
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Format de fichier non supporté (PNG, JPG uniquement)')
      return
    }

    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux (max 5MB)')
      return
    }

    // Création de l'URL de prévisualisation
    const previewUrl = URL.createObjectURL(file)
    setProfilePhotoPreview(previewUrl)
    setProfilePhotoFile(file)
  }

  // Suppression de la photo de profil
  const handleProfilePhotoRemove = () => {
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview)
    }
    setProfilePhotoPreview(null)
    setProfilePhotoFile(null)
  }

  // Soumission du formulaire
  const handleConsentChange = async (newConsent: ConsentData) => {
    // Mettre à jour formData pour la validation globale
    onDataChange({
      consentEssential: newConsent.essential,
      consentDataProcessing: newConsent.dataProcessing,
      consentTerms: newConsent.acceptTerms
    })

    // Mettre à jour les consentements en base si nécessaire
    if (newConsent.essential && newConsent.dataProcessing) {
      await updateConsent(newConsent)
    }
  }

  const onSubmit = (data: NFCCardFormData) => {
    const currentIsValid = !!(isValid && formData.consentTerms)
    if (currentIsValid) {
      onDataChange({
        ...data,
        consentEssential: true,
        consentDataProcessing: true
      })
      onNext()
    } else {
      if (!isValid) {
        toast.error("Veuillez remplir tous les champs obligatoires")
      } else if (!formData.consentTerms) {
        toast.error("Vous devez accepter les conditions générales pour continuer")
      }
    }
  }

  // Vérification de la validité du formulaire
  const isFormValid = !!(isValid && formData.consentTerms)

  // Effet pour surveiller les changements de consentement
  useEffect(() => {
    // Notifier le parent de l'état de validation
    if (onValidationChange) {
      onValidationChange(isFormValid)
    }
  }, [formData.consentTerms, isValid, isFormValid, onValidationChange])

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 tracking-tight">
          Vos coordonnées professionnelles
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500">
          Ces informations seront programmées sur votre puce NFC et gravées avec précision.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations de base */}
        <Card className="overflow-hidden border border-neutral-200/90 shadow-xs rounded-2xl bg-white">
          <CardHeader className="bg-neutral-50/70 border-b border-neutral-100 pb-3.5 pt-4 px-5">
            <CardTitle className="flex items-center gap-2.5 text-neutral-950 text-sm sm:text-base font-bold">
              <div className="w-7 h-7 rounded-lg bg-neutral-950 text-white flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>Informations de base</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-neutral-800">Nom complet *</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    onChange={(e) => handleDataChange('fullName', e.target.value)}
                    placeholder="Jean Dupont"
                    className={errors.fullName ? "border-red-300 focus-visible:ring-red-500 pr-10 rounded-xl" : "focus-visible:ring-neutral-950 pr-10 rounded-xl"}
                  />
                  <div className="absolute right-3 top-2.5 text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-500 italic">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs font-semibold text-neutral-800">Entreprise</Label>
                <div className="relative">
                  <Input
                    id="company"
                    {...register('company')}
                    onChange={(e) => handleDataChange('company', e.target.value)}
                    placeholder="Acme Corp"
                    className={errors.company ? "border-red-300 focus-visible:ring-red-500 pr-10 rounded-xl" : "focus-visible:ring-neutral-950 pr-10 rounded-xl"}
                  />
                  <div className="absolute right-3 top-2.5 text-neutral-400">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
                {errors.company && (
                  <p className="text-[11px] text-red-500 italic">{errors.company.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jobTitle" className="text-xs font-semibold text-neutral-800">Poste / Fonction</Label>
                <div className="relative">
                  <Input
                    id="jobTitle"
                    {...register('jobTitle')}
                    onChange={(e) => handleDataChange('jobTitle', e.target.value)}
                    placeholder="Directeur Général"
                    className={errors.jobTitle ? "border-red-300 focus-visible:ring-red-500 pr-10 rounded-xl" : "focus-visible:ring-neutral-950 pr-10 rounded-xl"}
                  />
                  <div className="absolute right-3 top-2.5 text-neutral-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                </div>
                {errors.jobTitle && (
                  <p className="text-[11px] text-red-500 italic">{errors.jobTitle.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-neutral-800">Téléphone *</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    {...register('phone')}
                    onChange={(e) => handleDataChange('phone', e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className={errors.phone ? "border-red-300 focus-visible:ring-red-500 pr-10 rounded-xl" : "focus-visible:ring-neutral-950 pr-10 rounded-xl"}
                  />
                  <div className="absolute right-3 top-2.5 text-neutral-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-red-500 italic">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="email" className="text-xs font-semibold text-neutral-800">Email professionnel *</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    onChange={(e) => handleDataChange('email', e.target.value)}
                    placeholder="jean@entreprise.ci"
                    className={errors.email ? "border-red-300 focus-visible:ring-red-500 pr-10 rounded-xl" : "focus-visible:ring-neutral-950 pr-10 rounded-xl"}
                  />
                  <div className="absolute right-3 top-2.5 text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-500 italic">{errors.email.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo de l'entreprise */}
        <Card className="overflow-hidden border border-neutral-200/90 shadow-xs rounded-2xl bg-white">
          <CardHeader className="bg-neutral-50/70 border-b border-neutral-100 pb-3.5 pt-4 px-5">
            <CardTitle className="flex items-center gap-2.5 text-neutral-950 text-sm sm:text-base font-bold">
              <div className="w-7 h-7 rounded-lg bg-neutral-950 text-white flex items-center justify-center">
                <Image className="w-3.5 h-3.5" />
              </div>
              <span>Logo de l'entreprise (Optionnel)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-center">
              {logoPreview ? (
                <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-xl border border-dashed border-neutral-200 w-full max-w-sm">
                  <div className="w-16 h-16 bg-white shadow-xs border border-neutral-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900">Logo personnalisé</p>
                    <p className="text-[11px] text-neutral-500 mb-2 truncate">Gravé sur la carte physique</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLogoRemove}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2 text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full max-w-sm border-2 border-dashed border-neutral-200 hover:border-neutral-400 rounded-2xl p-5 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer group"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <div className="w-9 h-9 bg-white rounded-xl shadow-xs border border-neutral-200 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4 text-neutral-700" />
                  </div>
                  <p className="font-semibold text-xs sm:text-sm text-neutral-900 mb-0.5">Importer votre logo</p>
                  <p className="text-[11px] text-neutral-500 mb-3 px-2 leading-relaxed">
                    PNG, JPG ou SVG (max 5MB). Fond transparent recommandé.
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 border-neutral-200 text-neutral-900 hover:bg-neutral-100 text-xs px-3 rounded-lg cursor-pointer"
                  >
                    Choisir un fichier
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consentement RGPD */}
        <div className="pt-2">
          <ConsentBanner
            onConsentChange={handleConsentChange}
            initialConsent={{
              essential: formData.consentEssential ?? true,
              analytics: false,
              marketing: false,
              dataProcessing: true,
              acceptTerms: formData.consentTerms ?? false
            }}
            required={true}
            className="shadow-xs border border-neutral-200/80 rounded-2xl"
          />
        </div>

        {/* Message de validation contextuel */}
        {!isFormValid && (
          <div className="animate-in fade-in duration-200">
            <div className="p-4 bg-neutral-950 text-white rounded-2xl shadow-xs border border-neutral-800">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0 text-orange-400 mt-0.5">
                  <SlidingInfoIcon />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-white text-xs">
                    Champs requis avant de continuer :
                  </p>
                  <ul className="text-neutral-300 space-y-1">
                    {!isValid && (
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        Renseignez votre nom, votre téléphone et votre email.
                      </li>
                    )}
                    {!formData.consentTerms && (
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        Acceptez les conditions d'utilisation ci-dessus.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

function SlidingInfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

