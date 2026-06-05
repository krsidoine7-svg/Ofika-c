'use client'

import { useParams, useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/features/profiles/ProfileForm'
import { ProtectedRoute } from '@/components/core/auth/ProtectedRoute'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EditProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profile_id = params.id as string

  if (!profile_id) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-red-600">ID de profil manquant</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
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
                Modifier le profil
              </h1>
              <p className="text-gray-600 mt-2">
                Modifiez les informations de votre profil professionnel
              </p>
            </div>

            {/* Formulaire d'édition */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <ProfileForm
                profile_id={profile_id}
                isEditing={true}
                onSuccess={() => {
                  router.push('/dashboard/profiles')
                }}
                onCancel={() => {
                  router.back()
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
