'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PublicProfileCard } from '@/components/features/card-creator/DesignCardsPublic'
import { NFCProfile } from '@/lib/types/nfc-card-onboarding'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProfileAnalytics } from '@/lib/hooks/useProfileAnalytics'

export default function NFCPublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<NFCProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Analytics pour le profil
  const { trackView, trackScan } = useProfileAnalytics(params.id as string)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const cardId = params.id as string

        // Récupérer la carte NFC depuis la base de données (table digital_nfc_cards)
        const { data, error: fetchError } = await supabase
          .from('digital_nfc_cards')
          .select('*')
          .eq('id', cardId)
          .neq('status', 'draft')
          .single()

        if (fetchError) {
          console.error('Error fetching card:', fetchError)
          setError('Carte non trouvée ou inactive')
          return
        }

        if (!data) {
          setError('Profil non trouvé')
          return
        }

        // Transformer les données pour correspondre au type NFCProfile
        const p = data.preview_data || {}
        const nfcProfile: NFCProfile = {
          id: data.id,
          user_id: data.user_id,
          full_name: data.full_name || p.full_name || '',
          company: data.company || p.company || '',
          job_title: data.job_title || p.job_title || '',
          bio: p.bio || '',
          phone: data.phone || p.phone || '',
          email: data.email || p.email || '',
          instagram: p.instagram || '',
          tiktok: p.tiktok || '',
          linkedin: p.linkedin || '',
          other_links: p.other_links || '',
          location: p.location || '',
          profile_name: data.profile_name || p.profile_name || '',
          username: data.custom_url || p.username || '',
          custom_url: data.custom_url || p.custom_url || '',
          logo_url: data.logo_url || p.logo_url || '',
          nfc_link: data.nfc_link || p.nfc_link || '',
          qr_code_url: data.qr_code_url || p.qr_code_url || '',
          design_choice: data.design_choice || 'design-classic',
          color_theme: data.color_theme || 'black',
          status: data.status === 'activated' ? 'active' : 'inactive',
          created_at: data.created_at,
          updated_at: data.updated_at
        }

        setProfile(nfcProfile)

        // Mettre à jour les métadonnées de la page
        if (typeof window !== 'undefined') {
          const name = data.full_name || p.full_name || p.profile_name || 'Carte NFC'
          const company = data.company || p.company || ''
          document.title = `${name} - Carte NFC Ofika`

          // Meta description
          const metaDescription = document.querySelector('meta[name="description"]')
          if (metaDescription) {
            metaDescription.setAttribute('content', `Carte de visite NFC de ${name} - ${company} - Contactez-moi via Ofika`)
          }
        }

        // Tracker la vue du profil
        await trackView()

      } catch (err) {
        console.error('Error in fetchProfile:', err)
        setError('Erreur lors du chargement du profil')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProfile()
    }
  }, [params.id, supabase])

  // Page de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-900" />
            <h2 className="text-xl font-semibold mb-2">Chargement du profil...</h2>
            <p className="text-gray-600">Veuillez patienter</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Page d'erreur
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Profil non trouvé</h2>
            <p className="text-gray-600 mb-6">
              {error || 'Ce profil NFC n\'existe pas ou n\'est plus actif.'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/')}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Page du profil
  return <PublicProfileCard profile={profile} />
}
