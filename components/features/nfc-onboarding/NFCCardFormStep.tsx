'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
  company: z.string().min(2, 'Entreprise requise'),
  jobTitle: z.string().min(2, 'Poste requis'),
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
    resolver: zodResolver(nfcCardSchema),
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
      consentDataProcessing: newConsent.dataProcessing
    })

    // Mettre à jour les consentements en base si nécessaire
    if (newConsent.essential && newConsent.dataProcessing) {
      await updateConsent(newConsent)
    }
  }

  const onSubmit = (data: NFCCardFormData) => {
    const currentIsValid = !!(isValid && formData.consentEssential && formData.consentDataProcessing)
    if (currentIsValid) {
      onDataChange(data)
      onNext()
    } else {
      if (!isValid) {
        toast.error("Veuillez remplir tous les champs obligatoires")
      } else if (!formData.consentDataProcessing) {
        toast.error("Vous devez accepter le traitement des données pour créer votre carte NFC")
      }
    }
  }

  // Vérification de la validité du formulaire
  const isFormValid = !!(isValid && formData.consentEssential && formData.consentDataProcessing)

  // Effet pour surveiller les changements de consentement
  useEffect(() => {
    // Notifier le parent de l'état de validation
    if (onValidationChange) {
      onValidationChange(isFormValid)
    }
  }, [formData.consentEssential, formData.consentDataProcessing, isValid, isFormValid, onValidationChange])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Créez votre carte NFC
        </h2>
        <p className="text-gray-600">
          Configurez l'apparence et les informations visibles sur votre carte physique
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations de base */}
        <Card className="overflow-hidden border-orange-100 shadow-sm">
          <CardHeader className="bg-orange-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <User className="w-5 h-5" />
              Informations de base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold">Nom complet *</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    onChange={(e) => handleDataChange('fullName', e.target.value)}
                    placeholder="Jean Dupont"
                    className={errors.fullName ? "border-red-300 focus-visible:ring-red-500 pr-10" : "focus-visible:ring-orange-500 pr-10"}
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 italic">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-semibold">Entreprise *</Label>
                <div className="relative">
                  <Input
                    id="company"
                    {...register('company')}
                    onChange={(e) => handleDataChange('company', e.target.value)}
                    placeholder="Acme Corp"
                    className={errors.company ? "border-red-300 focus-visible:ring-red-500 pr-10" : "focus-visible:ring-orange-500 pr-10"}
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
                {errors.company && (
                  <p className="text-xs text-red-500 italic">{errors.company.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-sm font-semibold">Poste/Titre *</Label>
                <div className="relative">
                  <Input
                    id="jobTitle"
                    {...register('jobTitle')}
                    onChange={(e) => handleDataChange('jobTitle', e.target.value)}
                    placeholder="CEO"
                    className={errors.jobTitle ? "border-red-300 focus-visible:ring-red-500 pr-10" : "focus-visible:ring-orange-500 pr-10"}
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                </div>
                {errors.jobTitle && (
                  <p className="text-xs text-red-500 italic">{errors.jobTitle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Téléphone *</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    {...register('phone')}
                    onChange={(e) => handleDataChange('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className={errors.phone ? "border-red-300 focus-visible:ring-red-500 pr-10" : "focus-visible:ring-orange-500 pr-10"}
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 italic">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    onChange={(e) => handleDataChange('email', e.target.value)}
                    placeholder="jean@acme.com"
                    className={errors.email ? "border-red-300 focus-visible:ring-red-500 pr-10" : "focus-visible:ring-orange-500 pr-10"}
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 italic">{errors.email.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo de l'entreprise */}
        <Card className="overflow-hidden border-orange-100 shadow-sm">
          <CardHeader className="bg-orange-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Image className="w-5 h-5" />
              Logo de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              {logoPreview ? (
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Logo sélectionné</p>
                    <p className="text-xs text-gray-500 mb-2">Votre logo s'affichera sur la carte</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLogoRemove}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Changer de logo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md border-2 border-dashed border-orange-100 rounded-xl p-8 text-center bg-orange-50/30 hover:bg-orange-50/50 transition-colors cursor-pointer group"
                  onClick={() => document.getElementById('logo-upload')?.click()}>
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Dénicher votre logo</p>
                  <p className="text-xs text-gray-500 mb-4 px-4">
                    PNG, JPG ou SVG (max 5MB). Pour un rendu optimal, utilisez un fond transparent.
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
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    Choisir un fichier
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consentement RGPD */}
        <div className="pt-4">
          <ConsentBanner
            onConsentChange={handleConsentChange}
            initialConsent={{
              essential: formData.consentEssential ?? true,
              analytics: false,
              marketing: false,
              dataProcessing: formData.consentDataProcessing ?? false
            }}
            required={true}
            className="shadow-sm border-orange-100"
          />
        </div>

        {/* Message de validation contextuel */}
        {!isFormValid && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <SlidingInfoIcon />
                </div>
                <div>
                  <p className="text-sm text-orange-900 font-bold mb-1">
                    Finalisons votre configuration
                  </p>
                  <ul className="text-xs text-orange-700/80 space-y-1.5">
                    {!isValid && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        Complétez les champs marqués d'une * pour vos coordonnées professionnelles.
                      </li>
                    )}
                    {!formData.consentDataProcessing && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        Cochez l'accord de traitement pour activer votre carte physique.
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

