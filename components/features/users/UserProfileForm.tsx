"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploadFixed } from '@/components/ui/image-upload-fixed'
import { PhoneInput } from '@/components/ui/phone-input'
import { useUser } from '@/lib/hooks/useUser'
import { Loader2, User, Mail, Phone, Globe, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

// Imports des nouvelles constantes et utilitaires
import {
  SUPPORTED_LANGUAGES,
  PLACEHOLDERS,
  LABELS,
  STYLES,
  DEFAULTS,
  SupportedLanguage
} from '@/lib/constants/user-profile'
import { userProfileSchema, UserProfileFormData } from '@/lib/validations/user-profile'
import { UserProfileData } from '@/lib/types/user-profile'
import { populateFormWithUserData, getLanguageOptions } from '@/lib/utils/user-profile-helpers'

export function UserProfileForm() {
  const { user, getUserData, updateUser, loading } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const pathname = usePathname()
  const isAdminProfile = pathname?.startsWith('/dashboard/admin')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    mode: 'onChange', // Validation en temps réel
  })

  const imageValue = watch('image')
  const languageValue = watch('preferred_language')

  // Vérifier si au moins un champ a une valeur significative
  const hasValidData = () => {
    const watchedValues = watch()
    return Object.values(watchedValues).some(value =>
      value !== undefined && value !== null && value !== '' && value !== DEFAULTS.language
    )
  }


  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔄 Loading user data for:', user?.id)
      const response = await getUserData()
      console.log('📦 User data received:', response)

      if (response) {
        // L'API retourne {success: true, data: {...}}, donc on extrait data.data
        const userData = response.data || response
        setUserData(userData)

        console.log('✅ Setting form data:', {
          name: userData.name,
          email: userData.email || user?.email,
          phone: userData.phone,
          image: userData.image,
          preferred_language: userData.preferred_language
        })
        populateFormWithUserData(userData, user?.email, (field, value) => setValue(field as keyof UserProfileFormData, value))
      } else {
        console.warn('⚠️ No user data returned')
      }
    }

    if (user) {
      loadUserData()
    }
  }, [user, getUserData, setValue])


  const onSubmit = async (data: UserProfileFormData) => {
    setIsSubmitting(true)

    try {
      // Filtrer seulement les champs qui ont des valeurs significatives
      const filteredData: Partial<UserProfileFormData> = {}

      if (data.name && data.name.trim() !== '') {
        filteredData.name = data.name.trim()
      }
      if (data.email && data.email.trim() !== '') {
        filteredData.email = data.email.trim()
      }
      if (!isAdminProfile && data.phone && data.phone.trim() !== '') {
        filteredData.phone = data.phone.trim()
      }
      if (!isAdminProfile && data.city && data.city.trim() !== '') {
        filteredData.city = data.city.trim()
      }
      if (!isAdminProfile && data.address && data.address.trim() !== '') {
        filteredData.address = data.address.trim()
      }
      if (!isAdminProfile && data.image && data.image.trim() !== '') {
        filteredData.image = data.image.trim()
      }
      if (data.preferred_language && data.preferred_language !== DEFAULTS.language) {
        filteredData.preferred_language = data.preferred_language
      }

      const result = await updateUser(filteredData)

      if (result) {
        // Attendre un peu pour que Supabase Auth se mette à jour
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Recharger les données après la mise à jour réussie
        const response = await getUserData(undefined, true)
        let updatedName = '?'

        if (response) {
          const updatedData = response.data || response
          setUserData(updatedData)
          updatedName = updatedData.name || '?'
          // Utiliser les données mises à jour directement, pas user?.email
          populateFormWithUserData(updatedData, updatedData.email || user?.email, (field, value) => setValue(field as keyof UserProfileFormData, value))
        }

        // Notification de succès
        toast.success(`Profil mis à jour (Sauvegardé: ${updatedName})`, {
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 3000,
        })
      } else {
        toast.error('Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      toast.error('Une erreur inattendue s\'est produite')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && !userData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Photo de profil */}
          {!isAdminProfile && (
          <div>
            <ImageUploadFixed
              value={imageValue}
              onChange={(url) => setValue('image', url)}
              disabled={isSubmitting}
            />
          </div>
          )}

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {LABELS.fields.name} *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                {...register('name')}
                placeholder={PLACEHOLDERS.name}
                className={STYLES.input.withIcon}
                disabled={isSubmitting}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              {LABELS.fields.email} *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={PLACEHOLDERS.email}
                className={STYLES.input.withIcon}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {LABELS.messages.emailChangeWarning}
            </p>
          </div>

          {/* Téléphone */}
          {!isAdminProfile && (
          <div className="space-y-2">
            <Label htmlFor="phone">
              {LABELS.fields.phone}
            </Label>
            <PhoneInput
              value={watch('phone')}
              onChange={(value) => setValue('phone', value)}
              disabled={isSubmitting}
              placeholder={PLACEHOLDERS.phone}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
          )}

          {/* Ville */}
          {!isAdminProfile && (
          <div className="space-y-2">
            <Label htmlFor="city">
              {LABELS.fields.city}
            </Label>
            <Input
              id="city"
              {...register('city')}
              placeholder={PLACEHOLDERS.city}
              disabled={isSubmitting}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>
          )}

          {/* Adresse */}
          {!isAdminProfile && (
          <div className="space-y-2">
            <Label htmlFor="address">
              {LABELS.fields.address}
            </Label>
            <Input
              id="address"
              {...register('address')}
              placeholder={PLACEHOLDERS.address}
              disabled={isSubmitting}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>
          )}

          {/* Langue préférée */}
          <div className="space-y-2">
            <Label htmlFor="language">
              {LABELS.fields.language}
            </Label>
            <Select
              value={languageValue}
              onValueChange={(value) => setValue('preferred_language', value as SupportedLanguage)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder={PLACEHOLDERS.language} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bouton de soumission */}
          <Button
            type="submit"
            disabled={isSubmitting || !isValid || !hasValidData()}
            className={STYLES.button.primary}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {LABELS.buttons.submitting}
              </>
            ) : (
              LABELS.buttons.submit
            )}
          </Button>

          {/* Indicateur de statut du formulaire */}

        </form>
    </div>
  )
}
