'use client'

/**
 * ============================================
 * PAGE DE PERSONNALISATION DU DESIGN
 * ============================================
 * Modifier les couleurs et l'ordre des liens d'une page publique déjà publiée,
 * avec un aperçu en direct.
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Eye, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/core/auth/ProtectedRoute'
import { IPhone15Frame } from '@/components/ui/iphone-15-frame'
import { DesignCustomizationPanel } from '@/components/features/profiles/DesignCustomizationPanel'
import { ProfileTemplateRenderer } from '@/components/features/profiles/ProfileTemplateRenderer'
import { getTemplateLabel } from '@/lib/templates/registry'
import { createClient } from '@/lib/supabase/client'

export default function PersonalizeDesignPage() {
  const router = useRouter()
  const params = useParams()
  const profileId = params.id as string

  // savedProfile = état en base ; previewProfile = état affiché dans l'aperçu
  const [savedProfile, setSavedProfile] = useState<any>(null)
  const [previewProfile, setPreviewProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .eq('user_id', user.id) // uniquement ses propres profils
          .single()

        if (error || !data) throw error || new Error('Profil non trouvé')
        setSavedProfile(data)
        setPreviewProfile(data)
      } catch (e) {
        console.error('Erreur chargement profil:', e)
        toast.error('Profil introuvable')
        router.push('/dashboard/profiles')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profileId, router])

  if (loading || !savedProfile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
        </div>
      </ProtectedRoute>
    )
  }

  const publicSlug = savedProfile.custom_url || savedProfile.username

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          {/* En-tête */}
          <Button variant="ghost" onClick={() => router.push('/dashboard/profiles')} className="mb-3 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux profils
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Personnaliser ma page</h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                {savedProfile.name}
                <Badge variant="secondary">{getTemplateLabel(savedProfile.design_choice)}</Badge>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/dashboard/profiles/${profileId}/change-design`)}>
                <LayoutTemplate className="w-4 h-4 mr-2" />
                Changer de template
              </Button>
              {publicSlug && (
                <Button variant="outline" onClick={() => window.open(`/${publicSlug}`, '_blank')}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir ma page
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Panneau de réglages */}
            <div className="lg:col-span-6 xl:col-span-5">
              <DesignCustomizationPanel
                profile={savedProfile}
                onUpdate={setPreviewProfile}
                onSaved={(p) => {
                  setSavedProfile(p)
                  setPreviewProfile(p)
                }}
              />
            </div>

            {/* Aperçu en direct */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center lg:sticky lg:top-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-orange-500" />
                Aperçu en temps réel
              </h3>
              <IPhone15Frame showColorPicker={false} scaleClass="scale-[0.85] sm:scale-90 xl:scale-95 origin-top">
                <ProfileTemplateRenderer profile={previewProfile} isPreview />
              </IPhone15Frame>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
