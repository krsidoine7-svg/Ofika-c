'use client'

/**
 * ============================================
 * PAGE DE CHANGEMENT DE DESIGN
 * ============================================
 * 
 * Permet à l'utilisateur de changer le design de son profil existant
 * 
 * Flow :
 * 1. Afficher le design actuel
 * 2. Permettre de choisir un nouveau design
 * 3. Prévisualiser avec les données existantes
 * 4. Sauvegarder le changement
 */

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/core/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { TemplateSelectionStep } from '@/components/features/profiles/TemplateSelectionStep'
import { ProtectedRoute } from '@/components/core/auth/ProtectedRoute'
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const designNames: Record<string, string> = {
  design1: 'Classique',
  design2: 'Design',
  design3: 'Créatif',
  design4: 'Nature',
  influencer: 'Influenceur',
  ecommerce: 'E-commerce',
  design7: 'Dark Elegant',
  freelance: 'Freelance'
}

export default function ChangeDesignPage() {
  const router = useRouter()
  const params = useParams()
  const profileId = params.id as string
  const supabase = createClient()

  // États
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  // ============================================
  // CHARGEMENT DU PROFIL
  // ============================================

  useEffect(() => {
    loadProfile()
  }, [profileId])

  const loadProfile = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Vous devez être connecté')
        router.push('/login')
        return
      }

      // Charger le profil avec vérification de propriété
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .eq('user_id', user.id) // Sécurité : vérifier que c'est bien son profil
        .single()

      if (error) throw error

      if (!profileData) {
        toast.error('Profil non trouvé')
        router.push('/dashboard/profiles')
        return
      }

      setProfile(profileData)
      setSelectedDesign(profileData.design_choice || 'design1')

    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error('Erreur lors du chargement du profil')
      router.push('/dashboard/profiles')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // GESTION DU CHANGEMENT DE DESIGN
  // ============================================

  const handleDesignSelection = (design: string) => {
    if (design === profile?.design_choice) {
      toast.info('Ce design est déjà sélectionné')
      return
    }

    setSelectedDesign(design)
    setShowConfirmation(true)
  }

  const handleConfirmChange = async () => {
    if (!profile) return

    setSaving(true)

    try {
      // Mettre à jour le design dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          design_choice: selectedDesign,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)

      if (error) throw error

      toast.success('Design modifié avec succès !')

      // Toujours rediriger vers le dashboard après changement
      setTimeout(() => {
        router.push(`/dashboard/profiles`)
      }, 1500)

    } catch (error: any) {
      console.error('Error updating design:', error)
      toast.error('Erreur lors de la modification du design')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelChange = () => {
    setSelectedDesign(profile?.design_choice || 'design1')
    setShowConfirmation(false)
  }

  // ============================================
  // RENDU
  // ============================================

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/profiles')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux profils
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                Changer le design
              </h1>
              <p className="text-gray-600 mt-2">
                Profil : {profile.name}
              </p>
            </div>

            {/* Design actuel */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Design actuel</span>
                  <Badge className="bg-blue-500 text-white">
                    {designNames[profile.design_choice] || 'Classique'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vous pouvez changer le design de votre profil à tout moment.
                  Vos informations (nom, bio, liens, etc.) seront conservées.
                </p>
              </CardContent>
            </Card>

            {/* Avertissement sur les champs spécifiques */}
            <Card className="mb-8 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">
                      ⚠️ Important à savoir
                    </h4>
                    <p className="text-sm text-orange-800">
                      Certains designs ont des champs spécifiques (ex: liens personnalisés pour E-commerce).
                      Si vous changez vers un design qui nécessite ces champs et que vous ne les avez pas remplis,
                      vous pourrez les ajouter en modifiant votre profil après.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sélection du nouveau design */}
            {!showConfirmation ? (
              <TemplateSelectionStep
                onNext={handleDesignSelection}
                onPrev={() => router.push('/dashboard/profiles')}
                formData={profile}
                isLoading={false}
              />
            ) : (
              // Confirmation du changement
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Confirmer le changement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">

                    {/* Comparaison */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Design actuel</p>
                        <Badge variant="outline" className="text-base">
                          {designNames[profile.design_choice]}
                        </Badge>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-gray-600 mb-2">Nouveau design</p>
                        <Badge className="bg-green-600 text-white text-base">
                          {designNames[selectedDesign]}
                        </Badge>
                      </div>
                    </div>

                    {/* Informations conservées */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        ✅ Ces informations seront conservées :
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Nom et bio</li>
                        <li>• Photo de profil et photo de couverture</li>
                        <li>• Email et téléphone</li>
                        <li>• Tous vos réseaux sociaux</li>
                        <li>• Tous vos liens personnalisés</li>
                        <li>• Votre URL personnalisée</li>
                      </ul>
                    </div>

                    {/* Ce qui change */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        🎨 Ce qui va changer :
                      </h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• L'apparence visuelle de votre page</li>
                        <li>• La disposition des éléments</li>
                        <li>• Les couleurs et le style</li>
                      </ul>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleCancelChange}
                        disabled={saving}
                        className="flex-1"
                      >
                        Annuler
                      </Button>

                      <Button
                        onClick={handleConfirmChange}
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Modification en cours...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmer le changement
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
