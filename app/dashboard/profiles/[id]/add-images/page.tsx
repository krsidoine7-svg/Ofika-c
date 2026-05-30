"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfiles } from '@/lib/hooks/useProfiles'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Alert, AlertDescription } from '@/components/core/ui/alert'
import { ImageUploadFixed as ImageUpload } from '@/components/core/ui/image-upload-fixed'
import { ProtectedRoute } from '@/components/core/auth/ProtectedRoute'
import { ArrowLeft, CheckCircle, Image as ImageIcon, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function AddImagesPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { profiles } = useProfiles()
  const profileId = params.id as string
  
  const [profile, setProfile] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [coverImageUrl, setCoverImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profileId && profiles.length > 0) {
      const foundProfile = profiles.find(p => p.id === profileId)
      if (foundProfile) {
        setProfile(foundProfile)
        setImageUrl(foundProfile.image_url || '')
        setCoverImageUrl(foundProfile.cover_image_url || '')
      }
    }
  }, [profileId, profiles])

  const handleSave = async () => {
    if (!profile || !user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          image_url: imageUrl || null,
          cover_image_url: coverImageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Images mises à jour avec succès !')
      router.push('/dashboard/profiles')
    } catch (error: any) {
      console.error('Error updating images:', error)
      toast.error('Erreur lors de la mise à jour des images')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = imageUrl !== (profile?.image_url || '') || 
                     coverImageUrl !== (profile?.cover_image_url || '')

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/profiles')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux profils
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Ajouter des images à votre profil
              </h1>
              <p className="text-gray-600">
                Améliorez votre profil en ajoutant une photo de profil et une photo de couverture
              </p>
            </div>

            {/* Info Alert */}
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Ces images sont optionnelles mais recommandées pour rendre votre profil plus attrayant.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Images du profil</CardTitle>
                <CardDescription>
                  {profile.name} - {profile.custom_url || profile.username}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Photo de profil */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Photo de profil
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Image de profil pour votre page (recommandé : 400x400px)
                    </p>
                  </div>
                  <ImageUpload
                    value={imageUrl}
                    onChange={setImageUrl}
                    disabled={loading || saving}
                  />
                </div>

                {/* Photo de couverture */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Photo de couverture
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Image de fond pour votre profil (recommandé : 1200x400px)
                    </p>
                  </div>
                  <ImageUpload
                    value={coverImageUrl}
                    onChange={setCoverImageUrl}
                    disabled={loading || saving}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/profiles')}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Enregistrer les images
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

