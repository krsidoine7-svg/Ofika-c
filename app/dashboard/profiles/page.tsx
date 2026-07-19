"use client"

import { useRouter } from 'next/navigation'
import { memo, useState, useMemo } from 'react'
import { toast } from "sonner"
import { ProfileWithLinks } from '@/lib/types/database'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Eye, Trash2, ExternalLink, Loader2, Copy, Share2, Smartphone, User, QrCode, ShoppingCart, CreditCard, AlertCircle, CheckCircle, Info, Palette, Settings } from "lucide-react"
import { ProtectedRoute } from "@/components/core/auth/ProtectedRoute"
import { useProfiles, useDeleteProfile } from '@/lib/hooks/useProfiles'
import { useNFCCards, useCardLogic } from '@/lib/hooks/useNFCCards'
import { useOrderStats } from '@/lib/hooks/usePayments'
import { NFCCardItem } from '@/components/features/profiles/NFCCardItem'
import { NFCCard } from '@/lib/types/nfc-cards'
import { NFCCardPreview } from '@/components/features/card-creator/NFCCardPreview'

// Composant de profil optimisé avec memo
const ProfileCard = memo(function ProfileCard({
  profile,
  onEdit,
  onDelete,
  onView,
  onChangeDesign,
  onManageFields,
  nfcCards
}: {
  profile: ProfileWithLinks
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (profile: ProfileWithLinks) => void
  onChangeDesign: (id: string) => void
  onManageFields: (id: string) => void
  nfcCards?: NFCCard[]
}) {
  const [isCopied, setIsCopied] = useState(false)

  const getProfileTypeLabel = (type: string) => {
    switch (type) {
      case 'professional': return 'Professionnel'
      case 'personal': return 'Personnel'
      case 'event': return 'Événement'
      default: return type
    }
  }

  const getProfileTypeColor = (type: string) => {
    switch (type) {
      case 'professional': return 'bg-blue-100 text-blue-800'
      case 'personal': return 'bg-green-100 text-green-800'
      case 'event': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCopyLink = async () => {
    try {
      // Chercher une carte NFC associée à ce profil
      const associatedCard = nfcCards?.find(card =>
        (card.profile_id && card.profile_id === profile.id) ||
        (profile.username && (card as any).username === profile.username) ||
        (profile.custom_url && (card as any).custom_url === profile.custom_url)
      )

      let profileUrl
      if (associatedCard) {
        // Nettoyer le lien pour extraire le slug
        let slug = associatedCard.nfc_link
        if (associatedCard.nfc_link.startsWith('http')) {
          try {
            const url = new URL(associatedCard.nfc_link)
            slug = url.pathname.replace(/^\/+|\/+$/g, '') || url.pathname
          } catch (e) { /* ignore */ }
        } else {
          slug = associatedCard.nfc_link.split('/').filter(Boolean).pop() || associatedCard.nfc_link
        }
        profileUrl = `${window.location.origin}/${slug}`
      } else {
        // Fallback sur l'URL du profil
        profileUrl = `${window.location.origin}/${profile.custom_url || profile.username}`
      }

      await navigator.clipboard.writeText(profileUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast.success('Lien copié !')
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Erreur lors de la copie du lien')
    }
  }

  const handleShare = async () => {
    try {
      // Chercher une carte NFC associée à ce profil
      const associatedCard = nfcCards?.find(card =>
        (card.profile_id && card.profile_id === profile.id) ||
        (profile.username && (card as any).username === profile.username) ||
        (profile.custom_url && (card as any).custom_url === profile.custom_url)
      )

      let profileUrl
      if (associatedCard) {
        // Nettoyer le lien pour extraire le slug
        let slug = associatedCard.nfc_link
        if (associatedCard.nfc_link.startsWith('http')) {
          try {
            const url = new URL(associatedCard.nfc_link)
            slug = url.pathname.replace(/^\/+|\/+$/g, '') || url.pathname
          } catch (e) { /* ignore */ }
        } else {
          slug = associatedCard.nfc_link.split('/').filter(Boolean).pop() || associatedCard.nfc_link
        }
        profileUrl = `${window.location.origin}/${slug}`
      } else {
        // Fallback sur l'URL du profil
        profileUrl = `${window.location.origin}/${profile.custom_url || profile.username}`
      }

      if (navigator.share) {
        await navigator.share({
          title: `Profil ${profile.name}`,
          text: profile.bio || `Découvrez le profil de ${profile.name}`,
          url: profileUrl,
        })
      } else {
        // Fallback: copier le lien
        handleCopyLink()
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Erreur lors du partage')
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {profile.image_url ? (
              <img
                src={profile.image_url}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-lg">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0 overflow-hidden">
              <CardTitle className="text-lg truncate">{profile.name}</CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">
                {profile.bio || 'Aucune description'}
              </p>
            </div>
          </div>
          <Badge className={`${getProfileTypeColor(profile.profile_type)} flex-shrink-0`}>
            {getProfileTypeLabel(profile.profile_type)}
          </Badge>
        </div>
        
        {!profile.is_active && (
          <Alert variant="destructive" className="mt-4 bg-red-50 border-red-100 text-red-800 py-3 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <p className="font-black text-xs uppercase tracking-tight">Profil Suspendu</p>
                <p className="text-xs font-medium opacity-90">
                  {profile.suspension_reason 
                    ? `Raison : ${profile.suspension_reason}` 
                    : "Votre profil a été mis hors-ligne par la modération."}
                </p>
                <a 
                  href={`https://wa.me/2250503681588?text=Bonjour,%20mon%20profil%20Ofika%20(${profile.custom_url || profile.username})%20est%20suspendu.%20Pouvez-vous%20m'aider%20?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-2 hover:opacity-70 transition-opacity inline-block mt-1"
                >
                  Contacter le support via WhatsApp
                </a>
              </div>
            </div>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Boutons d'action principaux */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(profile)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(profile.id)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          </div>

          {/* Boutons de partage et copie */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-1" />
              {isCopied ? 'Copié !' : 'Copier'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Partager
            </Button>
          </div>

          {/* Bouton changer le design */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChangeDesign(profile.id)}
            className="w-full"
          >
            <Palette className="h-4 w-4 mr-1" />
            Changer le design
          </Button>

          {/* Bouton de suppression */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(profile.id)}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

export default function ProfilesPage() {
  const router = useRouter()
  const { profiles, loading: isLoading, error } = useProfiles()
  const { deleteProfile, loading: isDeleting } = useDeleteProfile()
  const { cards: nfcCards, loading: nfcLoading, error: nfcError, refreshCards } = useNFCCards()
  const { stats: orderStats, loading: orderStatsLoading } = useOrderStats()
  const { status: cardLogicStatus, loading: cardLogicLoading, actions, helpers } = useCardLogic()
  const [previewCardData, setPreviewCardData] = useState<any | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [startInEditMode, setStartInEditMode] = useState(false)

  // Handler pour la mise à jour d'une carte NFC
  const handleCardUpdated = (updatedCard: any) => {
    // Rafraîchir la liste des cartes
    refreshCards()
    // Mettre à jour les données de preview si la carte est affichée
    if (previewCardData && previewCardData.id === updatedCard.id) {
      setPreviewCardData((prev: any) => ({
        ...prev,
        nfc_link: updatedCard.nfc_link || prev.nfc_link
      }))
    }
  }

  // Construire la liste des pages publiques disponibles (profils + cartes NFC)
  const publicPages = useMemo(() => {
    const pages: Array<{ id: string; name: string; url: string; type: 'profile' | 'nfc_card' }> = []
    // Utiliser l'URL publique configurée, ou fallback sur localhost si non définie, mais préférer la variable d'env
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://ofika.com')

    // Ajouter les profils publics
    profiles.forEach(profile => {
      if (profile.is_public && (profile.custom_url || profile.username)) {
        const slug = profile.custom_url || profile.username
        pages.push({
          id: `profile-${profile.id}`,
          name: profile.name,
          url: `${baseUrl}/${slug}`.replace(/([^:]\/)\/+/g, '$1'),
          type: 'profile'
        })
      }
    })

    // Ajouter les cartes NFC (si elles ont un lien différent)
    nfcCards?.forEach(card => {
      if (card.nfc_link) {
        // Extraire le slug du lien NFC
        let slug = card.nfc_link
        try {
          if (card.nfc_link.startsWith('http')) {
            const url = new URL(card.nfc_link)
            slug = url.pathname.replace(/^\//, '')
          }
        } catch {
          // Garder le lien tel quel
        }

        // Vérifier si cette URL n'est pas déjà dans la liste (éviter les doublons)
        const existingPage = pages.find(p => p.url.endsWith(`/${slug}`) || p.url === card.nfc_link)
        if (!existingPage) {
          pages.push({
            id: `nfc-${card.id}`,
            name: card.profile_name || card.full_name || 'Carte NFC',
            url: `${baseUrl}/${slug}`.replace(/([^:]\/)\/+/g, '$1'),
            type: 'nfc_card'
          })
        }
      }
    })

    return pages
  }, [profiles, nfcCards])

  const handleDeleteProfile = async (profile_id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce profil ? Cette action est irréversible.')) {
      try {
        await deleteProfile(profile_id)
        toast.success('Profil supprimé avec succès')
        // Le hook useProfiles se mettra à jour automatiquement
      } catch (error) {
        console.error('Error deleting profile:', error)
        toast.error('Erreur lors de la suppression du profil')
      }
    }
  }

  // Commande de carte physique
  const handleOrderCard = () => {
    router.push('/dashboard/orders/new')
  }

  // Création de carte NFC numérique
  const handleCreateDigitalCard = () => {
    router.push('/onboarding/nfc-card')
  }

  const handleEditProfile = (profile_id: string) => {
    router.push(`/dashboard/profiles/${profile_id}/edit`)
  }

  const handleEditNFCCard = (card: NFCCard) => {
    if (card.profile_id) {
      router.push(`/dashboard/profiles/${card.profile_id}/edit`)
    } else {
      toast.error("Cette carte ne peut pas être modifiée car elle n'a pas de profil associé.")
    }
  }

  const handleViewProfile = (profile: ProfileWithLinks) => {
    // Chercher une carte NFC associée à ce profil
    const associatedCard = nfcCards?.find(card =>
      (card.profile_id && card.profile_id === profile.id) ||
      (profile.username && (card as any).username === profile.username) ||
      (profile.custom_url && (card as any).custom_url === profile.custom_url)
    )

    if (associatedCard) {
      // Nettoyer le lien (enlever les slashes de fin et parser le slug)
      let username = associatedCard.nfc_link
      try {
        if (associatedCard.nfc_link.startsWith('http')) {
          const url = new URL(associatedCard.nfc_link)
          username = url.pathname.replace(/^\/+|\/+$/g, '') || url.pathname
        } else {
          username = associatedCard.nfc_link.split('/').filter(Boolean).pop() || associatedCard.nfc_link
        }
      } catch (e) {
        console.error("Error parsing link", e)
      }

      const localUrl = `/${username}`
      window.open(localUrl, '_blank', 'noopener,noreferrer')
    } else if (profile.custom_url || profile.username) {
      // Fallback sur l'URL du profil
      window.open(`/${profile.custom_url || profile.username}`, '_blank', 'noopener,noreferrer')
    } else {
      toast.error('Ce profil n\'a pas d\'URL personnalisée')
    }
  }

  const handlePreviewCard = (card: NFCCard, editMode: boolean = false) => {
    // 1. Essayer de trouver le profil par profile_id
    let profileToPreview = profiles.find(p => p.id === card.profile_id)

    // Construire les données pour la prévisualisation physique
    const previewData = {
      id: card.id,
      profile_name: card.profile_name,
      color_theme: card.color_theme || 'ofika',
      nfc_link: card.nfc_link,
      full_name: card.full_name || profileToPreview?.name || card.profile_name,
      company: card.company || '',
      job_title: card.job_title || '',
      bio: card.bio || profileToPreview?.bio || '',
      phone: card.phone || profileToPreview?.phone || '',
      email: card.email || profileToPreview?.email || '',
      location: card.location || '',
      logo_url: card.logo_url,
      profile_photo_url: card.profile_photo_url || profileToPreview?.image_url,
      // Réseaux sociaux - on prendrait ceux du profil si nécessaire, 
      // mais NFCCardPreview semble attendre des champs plats pour l'instant
      instagram: profileToPreview?.social_links?.find(l => l.platform === 'instagram')?.url || '',
      linkedin: profileToPreview?.social_links?.find(l => l.platform === 'linkedin')?.url || '',
    }

    setPreviewCardData(previewData)
    setStartInEditMode(editMode)
    setIsPreviewOpen(true)
  }

  const handleChangeDesign = (profile_id: string) => {
    router.push(`/dashboard/profiles/${profile_id}/change-design`)
  }

  const handleManageFields = (profile_id: string) => {
    router.push(`/dashboard/profiles/${profile_id}/design-fields`)
  }


  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                <p className="text-gray-600">Chargement des profils...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Erreur lors du chargement
                  </h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Réessayer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }



  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header principal */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mes Profils & Cartes</h1>
                <p className="text-gray-600 mt-2">
                  Gérez vos profils et cartes NFC pour partager vos informations
                </p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/profiles/create')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un profil
              </Button>
            </div>

            {/* 🎯 ALERTE INFORMATIVE SELON LE STATUT */}
            {!cardLogicLoading && (
              <>
                {cardLogicStatus.nextRequiredAction === 'create_profile' && (
                  <Alert className="mb-6 border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Première étape :</strong> Créez votre profil professionnel pour commencer à utiliser Ofika.
                    </AlertDescription>
                  </Alert>
                )}

                {cardLogicStatus.nextRequiredAction === 'create_digital_card' && (
                  <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Étape suivante :</strong> Créez votre carte numérique avant de pouvoir commander une version physique.
                    </AlertDescription>
                  </Alert>
                )}

                {cardLogicStatus.nextRequiredAction === 'can_order_physical' && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Prêt à commander !</strong> Vous pouvez maintenant commander votre carte physique.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Section commande de cartes */}
            <Card className="mb-8 bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg lg:text-xl font-bold text-gray-900">Commander une carte physique</h2>
                      <p className="text-sm lg:text-base text-gray-600 mt-1">
                        Transformez votre profil numérique en carte physique élégante
                      </p>
                      <div className="flex flex-wrap items-center mt-2 gap-x-3 gap-y-1 text-xs lg:text-sm text-gray-600">
                        <span className="flex items-center whitespace-nowrap">
                          <Smartphone className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                          NFC + QR Code
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">Livraison 7-14 jours</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">
                          À partir de {parseInt(process.env.NEXT_PUBLIC_LYGOS_DEFAULT_AMOUNT || '14600').toLocaleString('fr-FR')} XOF
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full sm:w-auto">
                    <Button
                      onClick={handleOrderCard}
                      className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Commander ma carte</span>
                      <span className="sm:hidden">Commander</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard/orders')}
                      className="text-orange-600 border-orange-600 hover:bg-orange-50 w-full sm:w-auto"
                    >
                      Mes commandes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques des commandes */}
            {orderStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total commandes</p>
                        <p className="text-2xl font-bold text-gray-900">{orderStats.total_orders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Commandes payées</p>
                        <p className="text-2xl font-bold text-gray-900">{orderStats.paid_orders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total dépensé</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {orderStats.total_spent.toLocaleString('fr-FR')} XOF
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}


            {/* Structure en deux colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* COLONNE GAUCHE - PROFILS */}
              <div className="space-y-6">
                {/* Header de la section Profils */}
                <div className="flex items-center justify-between border-b-2 border-orange-200 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Mes Profils</h2>
                  </div>
                  <Button
                    onClick={() => router.push('/dashboard/profiles/create')}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer mon profil
                  </Button>
                </div>

                {/* Liste des profils */}
                <div className="space-y-4">
                  {profiles.length === 0 ? (
                    <Card className="text-center py-8">
                      <CardContent>
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Aucun profil disponible
                        </h3>
                        <p className="text-gray-600">
                          Vos profils apparaîtront ici une fois créés
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {profiles.map((profile) => (
                        <ProfileCard
                          key={profile.id}
                          profile={profile}
                          onEdit={handleEditProfile}
                          onDelete={handleDeleteProfile}
                          onView={handleViewProfile}
                          onChangeDesign={handleChangeDesign}
                          onManageFields={handleManageFields}
                          nfcCards={nfcCards}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* COLONNE DROITE - CARTES NFC */}
              <div className="space-y-6">
                {/* Header de la section Cartes NFC */}
                <div className="flex items-center justify-between border-b-2 border-blue-200 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Mes Cartes NFC</h2>
                  </div>
                  <Button
                    onClick={handleCreateDigitalCard}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Créer une carte NFC
                  </Button>
                </div>

                {/* Liste des cartes NFC */}
                <div className="space-y-4">
                  {nfcLoading ? (
                    <Card className="text-center py-8">
                      <CardContent>
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          <span className="text-gray-600">Chargement des cartes NFC...</span>
                        </div>
                      </CardContent>
                    </Card>
                  ) : nfcError ? (
                    <Card className="text-center py-8">
                      <CardContent>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-red-600 text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Erreur de chargement
                        </h3>
                        <p className="text-red-600 mb-4">{nfcError}</p>
                        <Button
                          onClick={() => window.location.reload()}
                          variant="outline"
                        >
                          Réessayer
                        </Button>
                      </CardContent>
                    </Card>
                  ) : nfcCards.length === 0 ? (
                    <Card className="text-center py-8">
                      <CardContent>
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <QrCode className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Aucune carte NFC disponible
                        </h3>
                        <p className="text-gray-600">
                          Vos cartes NFC apparaîtront ici une fois créées
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {nfcCards.map((card) => (
                        <NFCCardItem
                          key={card.id}
                          card={card}
                          onPreview={handlePreviewCard}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isPreviewOpen && previewCardData && (
        <NFCCardPreview
          card={previewCardData}
          publicPages={publicPages}
          onClose={() => setIsPreviewOpen(false)}
          onCardUpdated={handleCardUpdated}
          startInEditMode={startInEditMode}
        />
      )}
    </ProtectedRoute>
  )
}