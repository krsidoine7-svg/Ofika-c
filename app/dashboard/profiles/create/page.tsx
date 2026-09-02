'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stepper, Step } from "@/components/ui/stepper"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { TemplateSelectionStep } from '@/components/features/profiles/TemplateSelectionStep'
import { ProfileForm } from '@/components/features/profiles/ProfileForm'
import { ProtectedRoute } from '@/components/core/auth/ProtectedRoute'
import { createClient } from "@/lib/supabase/client"
import { createNFCCard } from '@/lib/services/nfc-cards'
import { toast } from "sonner"

type CreationStep = 'form' | 'template' | 'success'

const steps: Step[] = [
  {
    id: 'form',
    title: 'Informations',
    description: 'Remplissez vos informations'
  },
  {
    id: 'template',
    title: 'Design',
    description: 'Choisissez votre template'
  },
  {
    id: 'success',
    title: 'Confirmation',
    description: 'Profil créé avec succès'
  }
]

export default function CreateProfilePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<CreationStep>('form')
  const [loading, setLoading] = useState(false)
  const [createdProfile, setCreatedProfile] = useState<any>(null)
  const [selectedDesign, setSelectedDesign] = useState<string>('design1')
  const supabase = createClient()

  const getCurrentStepNumber = () => {
    const stepMap = { form: 1, template: 2, success: 3 }
    return stepMap[currentStep]
  }

  const handleFormSuccess = (profileData: any) => {
    // Stocker les données du formulaire pour les étapes suivantes
    setCreatedProfile(profileData)
    setCurrentStep('template')
  }

  const handleTemplateSelection = async (templateChoice: string) => {
    if (!createdProfile) return

    setLoading(true)
    setSelectedDesign(templateChoice)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non authentifié')

      // Générer un nom d'utilisateur unique si nécessaire
      let username = createdProfile.username || createdProfile.custom_url
      if (!username) {
        // Générer un nom d'utilisateur basé sur le nom et un timestamp
        const baseName = createdProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        username = `${baseName}-${Date.now().toString().slice(-6)}`
      }

      // Vérifier si le nom d'utilisateur existe déjà
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (existingProfile) {
        // Ajouter un suffixe numérique si le nom existe
        let counter = 1
        let uniqueUsername = `${username}-${counter}`

        while (true) {
          const { data: checkProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', uniqueUsername)
            .single()

          if (!checkProfile) break
          counter++
          uniqueUsername = `${username}-${counter}`
        }
        username = uniqueUsername
      }

      // Créer le profil avec le design choisi
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: createdProfile.name,
          profile_type: createdProfile.profile_type,
          bio: createdProfile.bio,
          image_url: createdProfile.image_url,
          cover_image_url: createdProfile.cover_image_url,
          custom_url: createdProfile.custom_url,
          username: username,
          email: createdProfile.email,
          phone: createdProfile.phone,
          whatsapp: createdProfile.whatsapp,
          facebook: createdProfile.facebook,
          instagram: createdProfile.instagram,
          twitter: createdProfile.twitter,
          youtube: createdProfile.youtube,
          tiktok: createdProfile.tiktok,
          website: createdProfile.website,
          custom_links: createdProfile.custom_links || [],
          company: createdProfile.company || '',
          job_title: createdProfile.job_title || '',
          design_choice: templateChoice,
          color_theme: 'default',
          is_public: createdProfile.is_public,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setCreatedProfile(profile)

      // ✅ CRÉATION SIMULTANÉE DE LA CARTE NUMÉRIQUE (Dashboard Admin & User)
      try {
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci')).replace(/\/$/, '')
        const profileSlug = profile.custom_url || profile.username
        const nfcLink = `${appUrl}/${profileSlug}`

        const { error: nfcError } = await createNFCCard({
            profile_name: profile.name || 'Ma carte',
            nfc_link: nfcLink,
            design_choice: templateChoice,
            color_theme: 'black',
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
          console.error('Erreur creation carte via service:', nfcError)
        }
      } catch (nfcErr) {
        console.error('Erreur globale creation carte:', nfcErr)
      }

      setCurrentStep('success')
      toast.success('Profil et carte créés avec succès !')

    } catch (error) {
      console.error('Error creating profile:', error)
      toast.error('Erreur lors de la création du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = () => {
    if (createdProfile) {
      const url = createdProfile.custom_url || createdProfile.username
      window.open(`/${url}`, '_blank')
    }
  }

  const handleBackToProfiles = () => {
    router.push('/dashboard/profiles')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'form':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Créer un nouveau profil</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                isEditing={false}
                onSuccess={handleFormSuccess}
                onCancel={() => router.push('/dashboard/profiles')}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                Profil créé avec succès !
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Votre profil est maintenant en ligne !
                  </h3>
                  <p className="text-gray-600">
                    Votre page publique est accessible via l'URL personnalisée
                  </p>
                </div>

                {createdProfile && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Informations du profil</h4>
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
                  <Button variant="outline" onClick={handleBackToProfiles} className="flex-1">
                    Retour aux profils
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
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header avec bouton retour */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                Créer un nouveau profil
              </h1>
              <p className="text-gray-600 mt-2">
                Créez votre profil professionnel personnalisé
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
    </ProtectedRoute>
  )
}