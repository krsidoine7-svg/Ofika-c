'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Badge } from '@/components/core/ui/badge'
import { Stepper, Step } from '@/components/core/ui/stepper'
import { ArrowLeft, CheckCircle, Globe } from 'lucide-react'
import { TemplateSelectionStep } from '@/components/features/profiles/TemplateSelectionStep'
import { ProfileForm } from '@/components/features/profiles/ProfileForm'
import { SignupStep } from '@/components/features/profiles/SignupStep'
import { PreviewStep } from '@/components/features/profiles/PreviewStep'
import { createClient } from '@/lib/supabase/client'
import { createNFCCard } from '@/lib/services/nfc-cards'
import { toast } from 'sonner'

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
    description: 'Action finale'
  },
  {
    id: 'success',
    title: 'Fin',
    description: 'C\'est en ligne !'
  }
]

export default function PublicPageOnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [currentStep, setCurrentStep] = useState<CreationStep>('form')
  const [loading, setLoading] = useState(false)
  const [createdProfile, setCreatedProfile] = useState<any>(null)
  const [selectedDesign, setSelectedDesign] = useState<string>('design1')
  const supabase = createClient()

  const getCurrentStepNumber = () => {
    const stepMap = { form: 1, template: 2, signup: 3, success: 4 }
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Créer votre page publique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                isEditing={false}
                requireAuth={false}
                hideImages={false}
                initialData={createdProfile}
                onSuccess={handleFormSuccess}
                onCancel={() => router.push('/get-started')}
              />
            </CardContent>
          </Card>
        )

      case 'signup':
        return (
          <SignupStep
            formData={createdProfile}
            onSuccess={handleFinalPublication}
            onPrev={() => setCurrentStep('template')}
            isLoading={loading}
          />
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
          <Card>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header avec bouton retour */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/get-started')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Créez votre page publique
            </h1>
            <p className="text-gray-600">
              Configurez votre présence en ligne en quelques étapes
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <Stepper steps={steps} currentStep={getCurrentStepNumber()} />
          </div>

          {/* Contenu principal */}
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
