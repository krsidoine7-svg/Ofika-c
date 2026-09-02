'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNFCCardOnboarding } from '@/lib/hooks/useNFCCardOnboarding'
import { useProfiles, useCreateProfile } from '@/lib/hooks/useProfiles'

import { useNFCCards } from '@/lib/hooks/useNFCCards'
import { useAuth } from '@/lib/hooks/useAuth'
import { NFCCardLayout } from '@/components/features/nfc-onboarding/NFCCardLayout'
import { NFCCardIntroStep } from '@/components/features/nfc-onboarding/NFCCardIntroStep'
import { NFCCardFormStep } from '@/components/features/nfc-onboarding/NFCCardFormStep'
import { NFCCardSignupStep } from '@/components/features/nfc-onboarding/NFCCardSignupStep'
import { NFCCardDesignStepV2 } from '@/components/features/nfc-onboarding/NFCCardDesignStepV2'
import { ProfileSelectionStep } from '@/components/features/nfc-onboarding/ProfileSelectionStep'
import { NFCCardSuccessStep } from '@/components/features/nfc-onboarding/NFCCardSuccessStep'
import { ONBOARDING_STEPS } from '@/lib/types/nfc-card-onboarding'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'


export default function NFCCardOnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
    currentStep,
    totalSteps,
    formData,
    selectedDesign,
    selectedColor,
    isLoading,
    error,
    setStep,
    goToNextStep,
    goToPrevStep,
    updateFormData,
    setDesign,
    setColor,
    setLoading,
    setError,
    reset,
    canGoNext,
    canGoPrev
  } = useNFCCardOnboarding()

  // Hook pour les cartes NFC (doit être au niveau du composant)
  const { createCard } = useNFCCards()
  const { profiles, refetch: refetchProfiles } = useProfiles()
  const { createProfile } = useCreateProfile()

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Récupérer les données après signup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('continue') === 'true' && user) {
      console.log('🔄 useEffect déclenché - user:', user ? 'connecté' : 'non connecté')
      const pendingData = localStorage.getItem('pending_nfc_card_creation')
      console.log('📍 URL params - continue:', params.get('continue'))
      console.log('💾 localStorage pendingData:', pendingData ? 'trouvé' : 'vide')

      if (pendingData) {
        try {
          const savedData = JSON.parse(pendingData)
          console.log('📦 Données récupérées:', savedData)

          // Restaurer les données du formulaire et le design
          updateFormData(savedData.formData)
          if (savedData.selectedDesign) setDesign(savedData.selectedDesign)
          if (savedData.selectedColor) setColor(savedData.selectedColor)

          // ✅ Restaurer l'étape DESIGN (étape 3)
          setStep(ONBOARDING_STEPS.DESIGN)

          // Nettoyer localStorage
          localStorage.removeItem('pending_nfc_card_creation')

          // Nettoyer l'URL
          window.history.replaceState({}, '', '/onboarding/nfc-card')

          console.log('✅ Données restaurées')
          toast.success('Bienvenue ! Vous pouvez finaliser votre carte.')

        } catch (error) {
          console.error('❌ Erreur lors de la restauration des données:', error)
          toast.error('Erreur lors de la restauration de vos données')
        }
      }
    } else {
      if (!user) console.log('⚠️ User pas encore connecté')
      if (params.get('continue') !== 'true') console.log('⚠️ Param continue absent ou incorrect')
    }
  }, [user, updateFormData, setDesign, setColor, setStep])

  // ✅ RÉCUPÉRATION DES DONNÉES DEPUIS LA PRÉVISUALISATION LANDING PAGE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('from_preview') === 'true') {
      const previewData = localStorage.getItem('nfc_card_preview_data')
      if (previewData) {
        try {
          const savedData = JSON.parse(previewData)
          console.log('✨ Données de prévisualisation détectées:', savedData)

          // Appliquer les données
          updateFormData(savedData.formData)
          if (savedData.selectedDesign) setDesign(savedData.selectedDesign)
          if (savedData.selectedColor) setColor(savedData.selectedColor)

          // Aller directement au formulaire (étape 2)
          setStep(ONBOARDING_STEPS.FORM)

          // Nettoyer
          localStorage.removeItem('nfc_card_preview_data')
          window.history.replaceState({}, '', '/onboarding/nfc-card')

          toast.success('Vos informations ont été importées !')
        } catch (error) {
          console.error('❌ Erreur lors de l\'import des données de prévis:', error)
        }
      }
    }
  }, [updateFormData, setDesign, setColor, setStep])

  // ✅ Auto-remplissage des données utilisateur si connecté
  useEffect(() => {
    if (user && !authLoading) {
      const userMeta = user.user_metadata || {}
      console.log('👤 DEBUG USER:', {
        email: user.email,
        phone: user.phone,
        meta: userMeta
      })

      const updates: any = {}

      // Tentative de récupération par plusieurs clés possibles
      const fullName = userMeta.full_name || userMeta.fullName || userMeta.name || userMeta.display_name
      const email = user.email || userMeta.email
      const phone = user.phone || userMeta.phone || userMeta.telephone || userMeta.mobile
      const company = userMeta.company || userMeta.organisation || userMeta.enterprise

      if (!formData.fullName && fullName) updates.fullName = fullName
      if (!formData.email && email) updates.email = email
      if (!formData.phone && phone) updates.phone = phone
      if (!formData.company && company) updates.company = company

      if (Object.keys(updates).length > 0) {
        console.log('📝 Application de l\'auto-remplissage:', updates)
        updateFormData(updates)
      }
    }
  }, [user, authLoading])

  // Navigation entre les étapes
  const handleNext = async () => {
    if (canGoNext()) {
      // Étape 2 (FORM) ➔ aller directement à l'étape 3 (DESIGN)
      if (currentStep === ONBOARDING_STEPS.FORM) {
        setStep(ONBOARDING_STEPS.DESIGN)
        return
      }

      // Étape 3 (DESIGN) ➔ aller à l'étape 4 (PROFILE_SELECTION)
      if (currentStep === ONBOARDING_STEPS.DESIGN) {
        setStep(ONBOARDING_STEPS.PROFILE_SELECTION)
        return
      }

      // Comportement normal pour les autres étapes
      goToNextStep()
    }
  }

  const handlePrev = () => {
    if (canGoPrev()) {
      // Étape 3 (DESIGN) ➔ revenir à l'étape 2 (FORM)
      if (currentStep === ONBOARDING_STEPS.DESIGN) {
        setStep(ONBOARDING_STEPS.FORM)
        return
      }

      // Étape 4 (PROFILE_SELECTION) ➔ revenir à l'étape 3 (DESIGN)
      if (currentStep === ONBOARDING_STEPS.PROFILE_SELECTION) {
        setStep(ONBOARDING_STEPS.DESIGN)
        return
      }

      goToPrevStep()
    }
  }

  // ✅ Exécuter la création après inscription réussie si on est à l'étape SIGNUP (étape 5)
  useEffect(() => {
    if (user && !authLoading && currentStep === ONBOARDING_STEPS.SIGNUP) {
      console.log('✨ Utilisateur connecté lors de la phase finale, activation automatique...')
      
      const savedData = formData.createdCardData
      if (savedData) {
        const option = savedData.selectedOption
        if (option === 'new' && savedData.newProfileData) {
          handleCreateNewProfile(savedData.newProfileData)
        } else if (option === 'none') {
          handleCreateCard(undefined)
        }
      } else {
        // Fallback si pas de données de création sauvegardées
        handleCreateCard(undefined)
      }
    }
  }, [user?.id, authLoading, currentStep])

  // Gestion des données du formulaire
  const handleDataChange = (data: Partial<typeof formData>) => {
    updateFormData(data)
  }

  // Gestion de la sélection de profil existant (Pour association ultérieure si besoin)
  const handleProfileSelected = async (profileId: string) => {
    // Dans le nouveau flux, cette fonction n'est plus appelée directement pour associer,
    // mais on la garde au cas où on voudrait rediriger
    console.log("Profil sélectionné:", profileId)
  }

  // Gestion de la création d'un nouveau profil
  const handleCreateNewProfile = async (profileData: any) => {
    // Si pas connecté, sauvegarder temporairement et rediriger vers l'étape SIGNUP
    if (!user) {
      if (!authLoading) {
        console.log('💾 Profil temporaire : sauvegarde et redirection vers SIGNUP');
        updateFormData({
          createdCardData: {
            selectedOption: 'new',
            newProfileData: profileData
          }
        });
        setStep(ONBOARDING_STEPS.SIGNUP);
      }
      return;
    }

    setLoading(true)
    try {
      console.log("🚀 Création du profil en cours...", profileData)

      const newProfile = await createProfile({
        user_id: user.id,
        name: profileData.name || formData.fullName,
        bio: profileData.bio || formData.bio,
        phone: formData.phone,
        email: formData.email,
        image_url: formData.profilePhotoUrl || formData.logoUrl || null, // Mapping photo/logo vers image_url
        profile_type: profileData.type || 'professional',
        design_choice: profileData.designChoice || 'design1',
        is_public: profileData.isPublic ?? true,
        is_active: true,
        username: profileData.username || formData.username,
        custom_url: profileData.customUrl || formData.customUrl,
        social_links: profileData.social_links || formData.social_links || [],
        custom_links: profileData.custom_links || formData.custom_links || [],
        location: formData.location || '',
      } as any)

      if (newProfile && newProfile.id) {
        console.log("✅ Profil créé avec succès:", newProfile.id)
        // Recharger les profils pour le dashboard
        await refetchProfiles()
        // Finaliser avec l'ID du nouveau profil
        await handleCreateCard(newProfile.id)
      }
    } catch (err: any) {
      console.error("❌ Erreur création profil:", err)
      toast.error(err.message || "Erreur lors de la création du profil")
    } finally {
      setLoading(false)
    }
  }

  // Gestion de la création de la carte (Appelé à la fin de l'onboarding)
  const handleCreateCard = async (finalProfileId?: string) => {
    console.log('🛠️ handleCreateCard appelé - user:', user ? 'connecté' : 'non connecté')

    // ✅ TOUJOURS sauvegarder les données au cas où (sécurité)
    const dataToSave = {
      formData: formData,
      selectedDesign: selectedDesign,
      selectedColor: selectedColor,
      currentStep: currentStep
    }

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      if (!authLoading) {
        console.log('💾 Sauvegarde locale et redirection vers étape SIGNUP');
        updateFormData({
          createdCardData: {
            selectedOption: 'none',
            finalProfileId
          }
        });
        setStep(ONBOARDING_STEPS.SIGNUP);
      }
      return;
    }

    console.log('✅ Utilisateur connecté - création de la carte')
    setLoading(true)

    try {
      // Générer des valeurs par défaut robustes
      const safeProfileName = formData.profileName || formData.fullName || 'Ma Carte NFC';
      console.log('🔍 Données pour URL:', { custom: formData.customUrl, user: formData.username, full: formData.fullName, profile: formData.profileName });

      // Nettoyer le slug pour l'URL - Priorité : Custom URL > Username > Full Name > Profile Name
      let slugBase = formData.customUrl || formData.username || formData.fullName || safeProfileName;

      // ✅ LOGIQUE DE PRIORITÉ ABSOLUE : Si un profil existant est sélectionné, utiliser SON lien ou username
      if (finalProfileId && profiles) {
        const existingProfile = profiles.find(p => p.id === finalProfileId);
        if (existingProfile && (existingProfile.custom_url || existingProfile.username)) {
          // On force l'utilisation du lien du profil
          slugBase = existingProfile.custom_url || existingProfile.username || '';
          console.log('🔗 PROFIL LIÉ DÉTECTÉ - Utilisation du slug existant:', slugBase);
        }
      }

      const safeSlug = slugBase.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || `nfc-${Date.now()}`;

      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci')).replace(/\/$/, '');
      const nfcLink = `${appUrl}/${safeSlug}`;

      // Créer la carte NFC en base de données
      const cardData = {
        profile_name: safeProfileName.substring(0, 255),
        nfc_link: nfcLink,
        design_choice: selectedDesign?.id || 'design1',
        color_theme: selectedColor?.id || 'black',

        // Informations personnelles du formulaire
        fullName: formData.fullName,
        company: formData.company,
        jobTitle: formData.jobTitle,
        bio: formData.bio,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,

        // Réseaux sociaux
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        linkedin: formData.linkedin,
        otherLinks: formData.otherLinks,
        social_links: formData.social_links,
        custom_links: formData.custom_links,

        // Configuration du profil
        username: formData.username,
        customUrl: formData.customUrl,

        logoUrl: formData.logoUrl,
        logoFile: formData.logoFile,
        profilePhotoUrl: formData.profilePhotoUrl,
        profilePhotoFile: formData.profilePhotoFile,

        // ✅ Lier le profil si un ID est fourni
        profile_id: finalProfileId
      }

      console.log("🚀 Envoi des données pour création:", cardData)
      const result = await createCard(cardData)

      if (result.success && result.data) {
        toast.success('Carte NFC créée avec succès !')
        // Stocker les données complètes de la carte créée
        updateFormData({
          createdCardId: result.data.id,
          createdCardNfcLink: result.data.nfc_link,
          createdCardData: result.data
        })

        // ✅ Passer à l'étape SUCCESS car on a fini
        setStep(ONBOARDING_STEPS.SUCCESS)
      } else {
        throw new Error(result.error || 'Échec de la création de la carte')
      }
    } catch (error: any) {
      console.error('Error creating NFC card:', error)

      // ✅ SI ERREUR D'AUTHENTIFICATION → Rediriger vers signup
      const errorMessage = error?.message || error?.toString() || ''
      if (errorMessage.includes('non authentifié') || errorMessage.includes('not authenticated') || errorMessage.includes('JWT')) {
        console.log('🔐 Erreur d\'authentification détectée - redirection vers signup')

        // Sauvegarder les données
        const dataToSave = {
          formData: formData,
          selectedDesign: selectedDesign,
          selectedColor: selectedColor,
          currentStep: currentStep
        }
        localStorage.setItem('pending_nfc_card_creation', JSON.stringify(dataToSave))

        // Rediriger vers signup
        const callbackUrl = `/onboarding/nfc-card?continue=true`
        toast.info('Veuillez vous connecter pour continuer')
        router.push(`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`)
        return
      }

      // Autre erreur
      setError('Erreur lors de la création de la carte')
      toast.error('Erreur lors de la création de la carte')
    } finally {
      setLoading(false)
    }
  }

  // Gestion de la prévisualisation publique avec validation
  const handlePreviewPublic = () => {
    // Valider l'URL de prévisualisation
    const previewUrl = formData.customUrl || 'temp-preview'

    // Vérifier que l'URL ne contient que des caractères sûrs
    const safeUrlRegex = /^[a-zA-Z0-9-_/]+$/
    if (!safeUrlRegex.test(previewUrl)) {
      toast.error('URL de prévisualisation invalide')
      return
    }

    // Ouvrir la page publique dans un nouvel onglet
    const publicUrl = `/preview/${previewUrl}`
    window.open(publicUrl, '_blank', 'noopener,noreferrer')
  }

  // Gestion de la redirection vers les profils
  const handleViewProfiles = () => {
    router.push('/dashboard/profiles')
  }

  // Rendu des étapes
  const renderStep = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.INTRO:
        return (
          <NFCCardIntroStep
            onNext={handleNext}
            onPrev={() => { }}
            formData={formData}
            onDataChange={handleDataChange}
            isLoading={isLoading}
            error={error}
          />
        )

      case ONBOARDING_STEPS.FORM:
        return (
          <NFCCardFormStep
            onNext={handleNext}
            onPrev={handlePrev}
            formData={formData}
            onDataChange={handleDataChange}
            isLoading={isLoading}
            error={error}
          />
        )

      case ONBOARDING_STEPS.SIGNUP:
        return (
          <NFCCardSignupStep
            formData={formData}
            onSuccess={() => {
              console.log("Compte créé avec succès, activation de la carte en cours...")
            }}
            onPrev={handlePrev}
            isLoading={isLoading}
          />
        )

      case ONBOARDING_STEPS.DESIGN:
        return (
          <NFCCardDesignStepV2
            onNext={handleNext}
            onPrev={handlePrev}
            formData={formData}
            onDataChange={handleDataChange}
            selectedDesign={selectedDesign}
            selectedColor={selectedColor}
            onDesignChange={setDesign}
            onColorChange={setColor}
            isLoading={isLoading}
            error={error}
          />
        )

      case ONBOARDING_STEPS.PROFILE_SELECTION:
        return (
          <ProfileSelectionStep
            onProfileSelected={handleProfileSelected}
            onCreateNewProfile={handleCreateNewProfile}
            isLoading={isLoading}
            onFinalize={(pid) => handleCreateCard(pid)}
            onPrev={handlePrev}
            formData={formData}
          />
        )


      case ONBOARDING_STEPS.SUCCESS:
        return (
          <NFCCardSuccessStep
            nfcProfile={{
              id: formData.createdCardId || 'temp-id',
              nfc_link: formData.createdCardNfcLink || `${process.env.NEXT_PUBLIC_APP_URL || ''}/card/${formData.createdCardId}`,
              profile_name: formData.profileName,
              created_at: formData.createdCardData?.created_at || new Date().toISOString(),
              qr_code_url: formData.createdCardData?.preview_data?.qr_code_url || ''
            }}
            onViewProfiles={handleViewProfiles}
          />
        )

      default:
        return null
    }
  }

  return (
    <NFCCardLayout
      currentStep={currentStep}
      totalSteps={6}
      onNext={handleNext}
      onPrev={canGoPrev() ? handlePrev : undefined}
      nextLabel={'Suivant'}
      prevLabel="Précédent"
      showNavigation={currentStep !== ONBOARDING_STEPS.SIGNUP && currentStep < ONBOARDING_STEPS.PROFILE_SELECTION}
      isNextDisabled={!canGoNext()}
      isLoading={isLoading}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </NFCCardLayout>
  )
}
