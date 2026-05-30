'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NFCCardFormData, FormValidation, ValidationError } from '@/lib/types/nfc-card-onboarding'
import { secureNFCCardSchema, validateAndSanitizeNFCCardData, validateNFCCardFile } from '@/lib/security/validation-schemas'
import { generateSecureFileName } from '@/lib/security/input-sanitizer'
import { fileUploadLimiter, urlValidationLimiter } from '@/lib/security/rate-limiter'
import { toast } from 'sonner'

export function useNFCCardForm(initialData?: Partial<NFCCardFormData>) {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    reset,
    trigger
  } = useForm<NFCCardFormData>({
    resolver: zodResolver(secureNFCCardSchema),
    defaultValues: {
      fullName: '',
      company: '',
      jobTitle: '',
      bio: '',
      phone: '',
      email: '',
      instagram: '',
      tiktok: '',
      linkedin: '',
      otherLinks: '',
      location: '',
      profileName: '',
      username: '',
      customUrl: '',
      ...initialData
    },
    mode: 'onChange'
  })

  // Watcher pour les changements en temps réel
  const watchedData = watch()

  // Validation d'un champ spécifique
  const validateField = useCallback(async (field: keyof NFCCardFormData) => {
    return await trigger(field)
  }, [trigger])

  // Validation complète du formulaire
  const validateForm = useCallback(async (): Promise<FormValidation> => {
    const isValid = await trigger()
    const fieldErrors: ValidationError[] = Object.keys(errors).map(field => {
      const error = errors[field as keyof typeof errors]
      const message: string = typeof error?.message === 'string' 
        ? error.message 
        : 'Erreur de validation'
      
      return {
        field,
        message
      }
    })

    return {
      isValid,
      errors: fieldErrors
    }
  }, [trigger, errors])

  // Gestion de l'upload de logo avec validation sécurisée
  const handleLogoUpload = useCallback(async (file: File, userId: string) => {
    // Note: Le rate limiting sera géré au niveau de l'API route
    // Ici on fait juste la validation côté client

    // Validation sécurisée du fichier
    const validation = validateNFCCardFile(file)
    if (!validation.isValid) {
      toast.error(validation.error || 'Fichier invalide')
      return false
    }

    try {
      // Création de l'URL de prévisualisation sécurisée
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)
      setLogoFile(file)
      
      // Mise à jour du formulaire
      setValue('logoFile', file)
      setValue('logoUrl', previewUrl)

      return true
    } catch (error) {
      console.error('Error handling logo upload:', error)
      toast.error('Erreur lors du traitement du fichier')
      return false
    }
  }, [setValue])

  // Suppression du logo
  const removeLogo = useCallback(() => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoPreview(null)
    setLogoFile(null)
    setValue('logoFile', undefined)
    setValue('logoUrl', undefined)
  }, [logoPreview, setValue])

  // Upload vers Supabase Storage avec sécurité
  const uploadLogoToStorage = useCallback(async (file: File, userId: string): Promise<string | null> => {
    setIsUploading(true)
    try {
      // Note: Le rate limiting sera géré au niveau de l'API route

      // Validation du fichier
      const validation = validateNFCCardFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error || 'Fichier invalide')
      }

      // Génération d'un nom de fichier sécurisé
      const secureFileName = generateSecureFileName(file.name)
      
      // Simulation d'upload - à remplacer par l'implémentation Supabase
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Ici, vous implémenterez l'upload vers Supabase Storage
      // const { data, error } = await supabase.storage
      //   .from('nfc-logos')
      //   .upload(`users/${userId}/${secureFileName}`, file, {
      //     cacheControl: '3600',
      //     upsert: false
      //   })
      
      // if (error) throw error
      
      // return data.path
      
      // Pour l'instant, retourner une URL simulée sécurisée
      return `https://secure-storage.ofika.com/logos/users/${userId}/${secureFileName}`
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Erreur lors de l\'upload du logo')
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  // Validation d'URL personnalisée (unicité) avec rate limiting
  const validateCustomUrl = useCallback(async (url: string, userId: string): Promise<boolean> => {
    if (!url) return true
    
    try {
      // Note: Le rate limiting sera géré au niveau de l'API route

      // Simulation de vérification d'unicité - à remplacer par l'API Supabase
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Ici, vous implémenterez la vérification d'unicité
      // const { data, error } = await supabase
      //   .from('digital_nfc_cards')
      //   .select('id')
      //   .eq('custom_url', url)
      //   .neq('user_id', userId) // Exclure les URLs de l'utilisateur actuel
      //   .single()
      
      // return !data // true si l'URL est disponible
      
      // Pour l'instant, simuler que l'URL est disponible
      return true
    } catch (error) {
      console.error('Error validating custom URL:', error)
      return false
    }
  }, [])

  // Validation d'username (unicité) avec rate limiting
  const validateUsername = useCallback(async (username: string, userId: string): Promise<boolean> => {
    if (!username) return true
    
    try {
      // Note: Le rate limiting sera géré au niveau de l'API route

      // Simulation de vérification d'unicité - à remplacer par l'API Supabase
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Ici, vous implémenterez la vérification d'unicité
      // const { data, error } = await supabase
      //   .from('digital_nfc_cards')
      //   .select('id')
      //   .eq('username', username)
      //   .neq('user_id', userId) // Exclure les usernames de l'utilisateur actuel
      //   .single()
      
      // return !data // true si l'username est disponible
      
      // Pour l'instant, simuler que l'username est disponible
      return true
    } catch (error) {
      console.error('Error validating username:', error)
      return false
    }
  }, [])

  // Soumission du formulaire avec validation sécurisée
  const onSubmit = useCallback(async (data: NFCCardFormData, userId: string) => {
    try {
      // Validation et sanitisation complète des données
      const validation = validateAndSanitizeNFCCardData(data)
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast.error(`${error.field}: ${error.message}`)
        })
        return false
      }

      const sanitizedData = validation.data

      if (!sanitizedData) {
        toast.error('Erreur de validation des données')
        return { success: false, error: 'Données invalides' }
      }

      // Validation des URLs personnalisées
      if (sanitizedData.customUrl && typeof sanitizedData.customUrl === 'string') {
        const isUrlAvailable = await validateCustomUrl(sanitizedData.customUrl, userId)
        if (!isUrlAvailable) {
          toast.error('Cette URL personnalisée est déjà utilisée')
          return { success: false, error: 'URL déjà utilisée' }
        }
      }

      if (sanitizedData.username && typeof sanitizedData.username === 'string') {
        const isUsernameAvailable = await validateUsername(sanitizedData.username, userId)
        if (!isUsernameAvailable) {
          toast.error('Ce nom d\'utilisateur est déjà utilisé')
          return { success: false, error: 'Username déjà utilisé' }
        }
      }

      // Upload du logo si présent
      if (logoFile) {
        const logoUrl = await uploadLogoToStorage(logoFile, userId)
        if (logoUrl) {
          sanitizedData.logoUrl = logoUrl
        }
      }

      return { success: true, data: sanitizedData }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Erreur lors de la validation du formulaire')
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    }
  }, [logoFile, validateCustomUrl, validateUsername, uploadLogoToStorage])

  // Reset du formulaire
  const resetForm = useCallback(() => {
    reset()
    removeLogo()
  }, [reset, removeLogo])

  // Données actuelles du formulaire
  const getFormData = useCallback((): NFCCardFormData => {
    return {
      ...watchedData,
      logoFile: logoFile || undefined,
      logoUrl: logoPreview || watchedData.logoUrl
    }
  }, [watchedData, logoFile, logoPreview])

  return {
    // Form methods
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    reset: resetForm,
    trigger,
    
    // Validation
    validateField,
    validateForm,
    validateCustomUrl,
    validateUsername,
    
    // Logo management
    logoFile,
    logoPreview,
    isUploading,
    handleLogoUpload,
    removeLogo,
    uploadLogoToStorage,
    
    // Form submission
    onSubmit,
    
    // Data
    getFormData,
    
    // State
    isFormValid: isValid,
    hasChanges: isDirty
  }
}
