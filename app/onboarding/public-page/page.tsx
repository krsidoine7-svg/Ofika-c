'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stepper, Step } from '@/components/ui/stepper'
import { ArrowLeft, CheckCircle, Globe, Eye } from 'lucide-react'
import { TemplateSelectionStep } from '@/components/features/profiles/TemplateSelectionStep'
import { ProfileForm } from '@/components/features/profiles/ProfileForm'
import { SignupStep } from '@/components/features/profiles/SignupStep'
import { PreviewStep } from '@/components/features/profiles/PreviewStep'
import { createClient } from '@/lib/supabase/client'
import { createNFCCard } from '@/lib/services/nfc-cards'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LinkInBioDesign1 } from '@/components/features/profiles/LinkInBioDesign1'
import { LinkInBioDesign2 } from '@/components/features/profiles/LinkInBioDesign2'
import { LinkInBioDesign3 } from '@/components/features/profiles/LinkInBioDesign3'
import { LinkInBioDesign4 } from '@/components/features/profiles/LinkInBioDesign4'
import { LinkInBioDesign7 } from '@/components/features/profiles/LinkInBioDesign7'
import { LinkInBioInfluencer } from '@/components/features/profiles/LinkInBioInfluencer'
import { LinkInBioEcommerce } from '@/components/features/profiles/LinkInBioEcommerce'
import { LinkInBioFreelance } from '@/components/features/profiles/LinkInBioFreelance'
import { motion, AnimatePresence } from 'framer-motion'
import { ScaledSmartphonePreview } from '@/components/ui/scaled-smartphone-preview'

type CreationStep = 'form' | 'template' | 'signup' | 'success'

const steps: Step[] = [
  {
    id: 'form',
    title: 'Informations',
    description: 'Vos coordonnées'
  },
  {
    id: 'template',
    title: 'Design',
    description: 'Votre style'
  },
  {
    id: 'signup',
    title: 'Compte',
    description: 'En ligne !'
  }
]

const createPreviewProfile = (formData: any, designChoice: string) => {
  return {
    id: 'preview',
    user_id: 'preview-user',
    profile_type: formData?.profile_type || 'professional',
    name: formData?.name || 'Votre Nom',
    bio: formData?.bio || 'Votre biographie apparaîtra ici...',
    image_url: formData?.image_url || null,
    cover_image_url: formData?.cover_image_url || null,
    custom_url: formData?.custom_url || formData?.username || 'votre-url',
    username: formData?.username || formData?.custom_url || 'votre-url',
    email: formData?.email || null,
    phone: formData?.phone || null,
    location: formData?.location || null,
    whatsapp: formData?.whatsapp || null,
    facebook: formData?.facebook || null,
    instagram: formData?.instagram || null,
    twitter: formData?.twitter || null,
    youtube: formData?.youtube || null,
    tiktok: formData?.tiktok || null,
    website: formData?.website || null,
    design_choice: designChoice,
    color_theme: 'default',
    is_active: true,
    social_links: formData?.social_links || [],
    custom_links: formData?.custom_links || [],
    is_public: formData?.is_public !== false,
    display_reviews: formData?.display_reviews || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    links: (formData?.custom_links || []).map((link: any, index: number) => ({
      id: `preview-${index}`,
      profile_id: 'preview',
      title: link.title,
      url: link.url,
      position: index,
      click_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  }
}

export default function PublicPageOnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [currentStep, setCurrentStep] = useState<CreationStep>('form')
  const [loading, setLoading] = useState(false)
  const [createdProfile, setCreatedProfile] = useState<any>(null)
  const [selectedDesign, setSelectedDesign] = useState<string>('design1')
  const supabase = createClient()

  const handleProfileFormChange = useCallback((data: any) => {
    setCreatedProfile((prev: any) => {
      const next = { ...prev, ...data }
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev
      return next
    })
  }, [])

  const renderPreview = (designId: string) => {
    const profile = createPreviewProfile(createdProfile, designId)

    switch (designId) {
      case 'design1': return <LinkInBioDesign1 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design2': return <LinkInBioDesign2 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design3': return <LinkInBioDesign3 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design4': return <LinkInBioDesign4 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'influencer': return <LinkInBioInfluencer profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'ecommerce': return <LinkInBioEcommerce profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design7': return <LinkInBioDesign7 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'freelance': return <LinkInBioFreelance profile={profile as any} showAddToContacts={true} isPreview={true} />
      default: return <LinkInBioDesign1 profile={profile as any} showAddToContacts={true} isPreview={true} />
    }
  }

  const getCurrentStepNumber = () => {
    const stepMap = { form: 1, template: 2, signup: 3, success: 3 }
    return stepMap[currentStep]
  }

  const handleFormSuccess = async (profileData: any) => {
    setCreatedProfile(profileData)
    setCurrentStep('template')
  }

  const handleTemplateSelection = (templateChoice: string) => {
    setSelectedDesign(templateChoice)
    
    if (user) {
      handleFinalPublication()
    } else {
      // Sauvegarder les données pour pouvoir les récupérer après inscription
      if (createdProfile) {
        localStorage.setItem('pending_profile_creation', JSON.stringify({
          ...createdProfile,
          design_choice: templateChoice
        }))
      }
      setCurrentStep('signup')
    }
  }



  const handleFinalPublication = async () => {
    if (!createdProfile) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Vous devez être connecté pour finaliser')
        setCurrentStep('signup')
        return
      }

      // Logic from handleTemplateSelection moved here
      let username = createdProfile.username || createdProfile.custom_url
      if (!username) {
        const baseName = createdProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        username = `${baseName}-${Date.now().toString().slice(-6)}`
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (existingProfile) {
        let counter = 1
        let uniqueUsername = `${username}-${counter}`
        while (true) {
          const { data: checkProfile } = await supabase.from('profiles').select('username').eq('username', uniqueUsername).single()
          if (!checkProfile) break
          counter++
          uniqueUsername = `${username}-${counter}`
        }
        username = uniqueUsername
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          ...createdProfile,
          user_id: user.id,
          username: username,
          design_choice: selectedDesign,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      setCreatedProfile(profile)

      // NFC creation
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        const profileSlug = profile.custom_url || profile.username
        const nfcLink = `${appUrl}/${profileSlug}`

        const { data: nfcCard, error: nfcError } = await createNFCCard({
            profile_name: profile.name || 'Ma carte',
            nfc_link: nfcLink,
            design_choice: selectedDesign,
            color_theme: 'black',
            // Informations détaillées pour le service
            fullName: profile.name,
            email: profile.email,
            phone: profile.phone,
            company: profile.company || '',
            jobTitle: profile.job_title || '',
            bio: profile.bio || '',
            location: profile.location || '',
            profile_photo_url: profile.image_url || '',
            logo_url: profile.image_url || '',
            custom_url: profileSlug,
            profile_id: profile.id
          } as any)

        if (nfcError) {
          console.error('Erreur creation digital_nfc_cards via service:', nfcError)
        }

        if (!nfcError && nfcCard) {
          console.log('✅ Carte NFC créée et synchronisée avec le profil')
        }
      } catch (nfcErr) {
        console.error('Erreur globale NFC:', nfcErr)
      }

      setCurrentStep('success')
      toast.success('Félicitations ! Votre page est en ligne.')
    } catch (e) {
      toast.error('Erreur lors de la publication')
    } finally {
      setLoading(false)
    }
  }

  // Récupérer les données après signup
  useEffect(() => {
    console.log('🔄 useEffect déclenché - user:', user ? 'connecté' : 'non connecté')
    const params = new URLSearchParams(window.location.search)
    const continueParam = params.get('continue')
    console.log('📍 URL params - continue:', continueParam)

    if (continueParam === 'true' && user) {
      console.log('✅ Conditions remplies - Récupération des données')
      const pendingData = localStorage.getItem('pending_profile_creation')
      console.log('💾 localStorage pendingData:', pendingData ? 'trouvé' : 'vide')

      if (pendingData) {
        const profileData = JSON.parse(pendingData)
        console.log('📦 Données récupérées:', profileData)
        setCreatedProfile(profileData)
        if (profileData.design_choice) {
          setSelectedDesign(profileData.design_choice)
          handleFinalPublication()
        } else {
          setCurrentStep('template')
        }
        localStorage.removeItem('pending_profile_creation')
        // Nettoyer l'URL
        window.history.replaceState({}, '', '/onboarding/public-page')
        console.log('✅ Étape de récupération activée')
      } else {
        console.log('⚠️ Pas de données dans localStorage')
      }
    } else {
      if (!user) console.log('⚠️ User pas encore connecté')
      if (continueParam !== 'true') console.log('⚠️ Param continue absent ou incorrect')
    }
  }, [user])

  // ✅ Sauter l'étape SIGNUP si l'utilisateur se connecte pendant l'onboarding
  useEffect(() => {
    if (user && !authLoading && currentStep === 'signup') {
      console.log('✨ Utilisateur détecté pendant SIGNUP, passage à TEMPLATE')
      setCurrentStep('template')
    }
  }, [user?.id, authLoading, currentStep])

  // ✅ Redirection automatique vers le dashboard après 2 secondes sur la page de succès
  useEffect(() => {
    if (currentStep === 'success') {
      const timer = setTimeout(() => {
        router.push('/dashboard/profiles')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, router])

  const handleGoToDashboard = () => {
    router.push('/dashboard/profiles')
  }

  const handleViewProfile = () => {
    if (createdProfile) {
      const url = createdProfile.custom_url || createdProfile.username
      window.open(`/${url}`, '_blank')
    }
  }

  // Handler pour mettre à jour les données locales
  const renderStep = () => {
    switch (currentStep) {
      case 'form':
        return (
          <Card className="lg:h-full flex flex-col lg:overflow-hidden border-none shadow-none lg:border lg:shadow-sm bg-white">
            <CardContent className="pt-6 flex-1 lg:min-h-0 flex flex-col lg:overflow-hidden">
              <ProfileForm
                isEditing={false}
                requireAuth={false}
                hideImages={false}
                initialData={createdProfile}
                onSuccess={handleFormSuccess}
                onCancel={() => router.push('/get-started')}
                onChange={handleProfileFormChange}
              />
            </CardContent>
          </Card>
        )

      case 'signup':
        return (
          <Card className="lg:h-full flex flex-col lg:overflow-hidden border-none shadow-none lg:border lg:shadow-sm bg-white">
            <CardContent className="pt-6 flex-1 lg:min-h-0 lg:overflow-y-auto custom-scrollbar">
              <SignupStep
                formData={createdProfile}
                onSuccess={handleFinalPublication}
                onPrev={() => setCurrentStep('template')}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        )

      case 'template':
        return (
          <TemplateSelectionStep
            onNext={handleTemplateSelection}
            onPrev={() => setCurrentStep('form')}
            formData={createdProfile}
            isLoading={loading}
          />
        )

      case 'success':
        return (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                Page publique créée avec succès !
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Votre page est maintenant en ligne !
                  </h3>
                  <p className="text-gray-600">
                    Votre page publique est accessible via l'URL personnalisée
                  </p>
                </div>

                {createdProfile && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Informations de la page</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom :</span>
                        <span className="font-medium">{createdProfile.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL :</span>
                        <span className="font-medium">/{createdProfile.custom_url || createdProfile.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Design :</span>
                        <Badge className="bg-blue-500 text-white">
                          {selectedDesign === 'design1' ? 'Classique' :
                            selectedDesign === 'design2' ? 'Design' :
                              selectedDesign === 'design3' ? 'Créatif' :
                                selectedDesign === 'design4' ? 'Nature' :
                                  selectedDesign === 'influencer' ? 'Influenceur' :
                                    selectedDesign === 'ecommerce' ? 'E-commerce' :
                                      selectedDesign === 'design7' ? 'Dark Elegant' :
                                        selectedDesign === 'freelance' ? 'Freelance' : 'Classique'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={handleViewProfile} className="flex-1">
                    Voir ma page
                  </Button>
                  <Button variant="outline" onClick={handleGoToDashboard} className="flex-1">
                    Aller au dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const isSplitScreen = currentStep === 'form' || currentStep === 'signup'

  return (
    <div className="min-h-screen lg:h-[100dvh] w-full lg:overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto lg:overflow-hidden">
        <div className={`mx-auto w-full flex-1 lg:min-h-0 flex flex-col ${
          isSplitScreen ? "max-w-6xl" : currentStep === 'template' ? "max-w-5xl" : "max-w-3xl"
        }`}>
          {/* Header avec bouton retour */}
          <div className="flex-shrink-0 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/get-started')}
              className="mb-2 h-8 px-2 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Retour
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              Créez votre page publique
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Configurez votre présence en ligne en quelques étapes
            </p>
          </div>

          {/* Stepper */}
          <div className="flex-shrink-0 mb-4 sm:mb-6">
            <Stepper steps={steps} currentStep={getCurrentStepNumber()} />
          </div>

          {/* Contenu principal */}
          <div className="flex-1 lg:min-h-0 w-full">
            {isSplitScreen ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch lg:h-full lg:min-h-0">
                {/* Colonne gauche : Formulaire */}
                <div className="col-span-12 lg:col-span-7 flex flex-col lg:min-h-0 lg:h-full">
                  {renderStep()}
                </div>

                {/* Colonne droite : Smartphone Mockup */}
                <div className="col-span-12 lg:col-span-5 hidden lg:flex flex-col items-center justify-center min-h-0 h-full">
                  <div className="flex flex-col items-center justify-center h-full w-full max-h-full">
                    <h3 className="font-semibold text-center text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-center gap-2 flex-shrink-0">
                      <Eye className="w-3.5 h-3.5" />
                      Aperçu en temps réel
                    </h3>

                    <div className="w-[360px] h-[720px] max-h-[90vh] rounded-[2rem] overflow-y-auto overflow-x-hidden custom-scrollbar bg-white shadow-2xl border border-gray-100 flex flex-col relative min-h-0">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedDesign}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.3 }}
                          className="min-h-full animate-in fade-in zoom-in duration-300"
                        >
                          {renderPreview(selectedDesign)}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Légende */}
                    <div className="mt-3 flex-shrink-0">
                      <p className="text-[10px] text-gray-400 italic text-center max-w-[220px]">
                        Aperçu interactif : modifiez le formulaire pour voir le rendu en direct.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto custom-scrollbar">
                {renderStep()}
              </div>
            )}
          </div>

          {/* Bouton d'aperçu flottant pour mobile */}
          {isSplitScreen && (
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold gap-2 text-white px-5 py-6">
                    <Eye className="w-5 h-5" />
                    Aperçu
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-[2rem] p-0 overflow-hidden bg-gray-900 border-gray-800">
                  <SheetHeader className="p-4 border-b border-gray-800 bg-gray-900 flex-row items-center justify-between text-white">
                    <SheetTitle className="text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-orange-500" />
                      Aperçu en direct
                    </SheetTitle>
                  </SheetHeader>
                    <div className="w-[360px] h-[90%] max-h-none rounded-[2rem] overflow-y-auto overflow-x-hidden custom-scrollbar bg-white shadow-2xl border border-gray-100 flex flex-col relative min-h-0">
                      {renderPreview(selectedDesign)}
                    </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
