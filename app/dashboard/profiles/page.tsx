"use client"

import { useRouter } from 'next/navigation'
import { memo, useState, useMemo, useCallback } from 'react'
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ProfileWithLinks } from '@/lib/types/database'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Edit3,
  Eye,
  Trash2,
  ExternalLink,
  Loader2,
  Copy,
  Share2,
  Smartphone,
  User,
  QrCode,
  CreditCard,
  AlertCircle,
  Check,
  Palette,
  Settings,
  Camera,
  MoreVertical,
  ArrowRight,
  ShieldAlert,
  ShoppingBag,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/core/auth/ProtectedRoute"
import { useProfiles, useDeleteProfile } from '@/lib/hooks/useProfiles'
import { useNFCCards } from '@/lib/hooks/useNFCCards'
import { useOrderStats, usePaymentMethods } from '@/lib/hooks/usePayments'
import { NFCCardItem } from '@/components/features/profiles/NFCCardItem'
import { NFCCard } from '@/lib/types/nfc-cards'
import { NFCCardPreview } from '@/components/features/card-creator/NFCCardPreview'
import { ProfileVisualsBanner } from '@/components/features/dashboard/ProfileVisualsBanner'

// ============================================================================
// COMPOSANT PROFILE CARD ÉPURÉ & ERGONOMIQUE (Style Apple / Linear)
// ============================================================================
const ProfileCard = memo(function ProfileCard({
  profile,
  onEdit,
  onDeleteRequest,
  onView,
  onChangeDesign,
  onPersonalize,
  onManageFields,
  onAddImages,
  nfcCards
}: {
  profile: ProfileWithLinks
  onEdit: (id: string) => void
  onDeleteRequest: (profile: ProfileWithLinks) => void
  onView: (profile: ProfileWithLinks) => void
  onChangeDesign: (id: string) => void
  onPersonalize: (id: string) => void
  onManageFields: (id: string) => void
  onAddImages?: (id: string) => void
  nfcCards?: NFCCard[]
}) {
  const [isCopied, setIsCopied] = useState(false)

  // Vérifier si une carte NFC est reliée
  const associatedCard = useMemo(() => {
    return nfcCards?.find(card =>
      (card.profile_id && card.profile_id === profile.id) ||
      (profile.username && (card as any).username === profile.username) ||
      (profile.custom_url && (card as any).custom_url === profile.custom_url)
    )
  }, [nfcCards, profile])

  // Résolution de l'URL publique
  const publicSlug = profile.custom_url || profile.username || ''
  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${publicSlug}`
    : `https://ofika.ci/${publicSlug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setIsCopied(true)
      toast.success('Lien copié dans le presse-papiers !')
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error('Erreur lors de la copie du lien')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Profil Ofika : ${profile.name}`,
          text: profile.bio || `Découvrez la carte numérique de ${profile.name}`,
          url: publicUrl,
        })
      } else {
        handleCopyLink()
      }
    } catch {
      // Ignorer l'annulation de partage
    }
  }

  const hasMissingImages = !profile.image_url || !profile.cover_image_url

  return (
    <Card className="border border-neutral-200/90 rounded-2xl bg-white shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col h-full justify-between gap-4">
        
        {/* HAUT DE CARTE : AVATAR, INFOS ET MENU D'ACTIONS */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Photo avec pastille d'ajout si manquante */}
              <div
                onClick={() => onAddImages && onAddImages(profile.id)}
                className="relative cursor-pointer group shrink-0"
                title="Modifier les visuels (photo et couverture)"
              >
                {profile.image_url ? (
                  <img
                    src={profile.image_url}
                    alt={profile.name}
                    className="w-12 h-12 rounded-full object-cover border border-neutral-200 group-hover:opacity-85 transition-opacity"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 font-semibold text-base group-hover:bg-neutral-200 transition-colors">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {hasMissingImages && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                    <Camera className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              {/* Nom & Titre */}
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-neutral-950 tracking-tight truncate leading-tight">
                  {profile.name}
                </h3>
                <p className="text-xs text-neutral-500 truncate mt-0.5">
                  {profile.job_title ? (
                    <>
                      <span>{profile.job_title}</span>
                      {profile.company && <span className="opacity-75"> • {profile.company}</span>}
                    </>
                  ) : (
                    profile.bio || 'Carte numérique Ofika'
                  )}
                </p>
              </div>
            </div>

            {/* Badges de statut & Menu Contextuel */}
            <div className="flex items-center gap-1.5 shrink-0">
              {profile.is_active ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200/80 text-[10px] font-medium px-2 py-0.5">
                  En ligne
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-rose-50 text-rose-800 border-rose-200 text-[10px] font-medium px-2 py-0.5">
                  Suspendu
                </Badge>
              )}

              {/* Menu Plus d'options (remplace les 8 boutons par profil) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg cursor-pointer"
                    aria-label="Options du profil"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-neutral-200 rounded-xl shadow-lg p-1 text-xs">
                  <DropdownMenuItem
                    onClick={() => onEdit(profile.id)}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-neutral-50 font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Modifier les infos</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onChangeDesign(profile.id)}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-neutral-50 font-medium"
                  >
                    <Palette className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Changer de modèle</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onPersonalize(profile.id)}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-neutral-50 font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Couleurs & Thème</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onAddImages && onAddImages(profile.id)}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-neutral-50 font-medium"
                  >
                    <Camera className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Photos & Bannière</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-neutral-100 my-1" />

                  <DropdownMenuItem
                    onClick={() => onDeleteRequest(profile)}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer le profil</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* BANDEAU ALERTE SI SUSPENDU */}
          {!profile.is_active && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Profil hors-ligne suite à modération</span>
              </div>
              <p className="text-[11px] text-rose-700">
                {profile.suspension_reason || "Veuillez contacter le support pour réactiver votre page."}
              </p>
              <a
                href={`https://wa.me/2250503681588?text=Bonjour,%20mon%20profil%20Ofika%20(${publicSlug})%20est%20suspendu.`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-rose-800 underline inline-block pt-0.5"
              >
                Contacter le support WhatsApp
              </a>
            </div>
          )}

          {/* BANDEAU COPIE RAPIDE DE L'URL */}
          <div className="mt-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-50 border border-neutral-200/70">
            <span className="font-mono text-[11px] text-neutral-600 truncate px-1">
              /{publicSlug}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="h-7 px-2 text-[11px] font-medium text-neutral-700 hover:text-neutral-950 hover:bg-white rounded-lg shrink-0 flex items-center gap-1"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-neutral-500" />
                  <span>Copier</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* PIED DE CARTE : ACTIONS PRINCIPALES (Ergonomiques et directes) */}
        <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
          {/* Voir ma page publique */}
          <Button
            type="button"
            onClick={() => onView(profile)}
            className="flex-1 h-9 px-3 text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Voir en direct</span>
          </Button>

          {/* Modifier */}
          <Button
            type="button"
            variant="outline"
            onClick={() => onEdit(profile.id)}
            className="flex-1 h-9 px-3 text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Modifier</span>
          </Button>

          {/* Partager */}
          <Button
            type="button"
            variant="outline"
            onClick={handleShare}
            className="h-9 w-9 p-0 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
            title="Partager le profil"
            aria-label="Partager le profil"
          >
            <Share2 className="w-3.5 h-3.5" />
          </Button>
        </div>

      </CardContent>
    </Card>
  )
})

// ============================================================================
// PAGE PRINCIPALE : PROFILES PAGE (Multi-écrans & Haute Ergonomie)
// ============================================================================
export default function ProfilesPage() {
  const router = useRouter()
  const { profiles, loading: isLoading, error } = useProfiles()
  const { deleteProfile, loading: isDeleting } = useDeleteProfile()
  const { cards: nfcCards, loading: nfcLoading, error: nfcError, refreshCards } = useNFCCards()
  const { stats: orderStats, loading: orderStatsLoading } = useOrderStats()
  const { basePrice } = usePaymentMethods()

  // Onglet actif avec surbrillance nette et retour immédiat
  const [activeTab, setActiveTab] = useState<'profiles' | 'cards' | 'orders'>('profiles')

  // État de dialogue de suppression accessible (remplace window.confirm)
  const [profileToDelete, setProfileToDelete] = useState<ProfileWithLinks | null>(null)

  // Prévisualisation de carte physique NFC
  const [previewCardData, setPreviewCardData] = useState<any | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [startInEditMode, setStartInEditMode] = useState(false)

  // Profils avec visuels incomplets
  const incompleteProfiles = useMemo(() => {
    return profiles.filter(p => !p.image_url || !p.cover_image_url)
  }, [profiles])

  const handleCompleteVisuals = useCallback((profileId?: string) => {
    const targetId = profileId || incompleteProfiles[0]?.id
    if (targetId) {
      router.push(`/dashboard/profiles/${targetId}/add-images`)
    }
  }, [incompleteProfiles, router])

  // Navigation handlers
  const handleEditProfile = useCallback((profile_id: string) => {
    router.push(`/dashboard/profiles/${profile_id}/edit`)
  }, [router])

  const handleAddImages = useCallback((profile_id: string) => {
    router.push(`/dashboard/profiles/${profile_id}/add-images`)
  }, [router])

  const handleChangeDesign = useCallback((profile_id: string) => {
    router.push(`/dashboard/profiles/${profile_id}/change-design`)
  }, [router])

  const handlePersonalize = useCallback((profile_id: string) => {
    router.push(`/dashboard/profiles/${profile_id}/personnaliser`)
  }, [router])

  const handleManageFields = useCallback((profile_id: string) => {
    router.push(`/dashboard/profiles/${profile_id}/design-fields`)
  }, [router])

  const handleViewProfile = useCallback((profile: ProfileWithLinks) => {
    const slug = profile.custom_url || profile.username
    if (slug) {
      window.open(`/${slug}`, '_blank', 'noopener,noreferrer')
    } else {
      toast.error("Ce profil n'a pas d'URL personnalisée")
    }
  }, [])

  // Suppression sécurisée
  const handleConfirmDelete = async () => {
    if (!profileToDelete) return
    try {
      await deleteProfile(profileToDelete.id)
      toast.success('Profil supprimé avec succès')
      setProfileToDelete(null)
    } catch {
      toast.error('Erreur lors de la suppression du profil')
    }
  }

  // Prévisualisation de carte NFC
  const handlePreviewCard = useCallback((card: NFCCard, editMode: boolean = false) => {
    const profileToPreview = profiles.find(p => p.id === card.profile_id)
    const previewData = {
      id: card.id,
      profile_name: card.profile_name,
      color_theme: card.color_theme || 'ofika',
      nfc_link: card.nfc_link,
      short_code: (card as any).short_code || (card as any).preview_data?.short_code,
      preview_data: (card as any).preview_data,
      full_name: card.full_name || profileToPreview?.name || card.profile_name,
      company: card.company || '',
      job_title: card.job_title || '',
      bio: card.bio || profileToPreview?.bio || '',
      phone: card.phone || profileToPreview?.phone || '',
      email: card.email || profileToPreview?.email || '',
      location: card.location || '',
      logo_url: card.logo_url,
      profile_photo_url: card.profile_photo_url || profileToPreview?.image_url,
      instagram: profileToPreview?.social_links?.find(l => l.platform === 'instagram')?.url || '',
      linkedin: profileToPreview?.social_links?.find(l => l.platform === 'linkedin')?.url || '',
    }

    setPreviewCardData(previewData)
    setStartInEditMode(editMode)
    setIsPreviewOpen(true)
  }, [profiles])

  const handleCardUpdated = (updatedCard: any) => {
    refreshCards()
    if (previewCardData && previewCardData.id === updatedCard.id) {
      setPreviewCardData((prev: any) => ({
        ...prev,
        nfc_link: updatedCard.nfc_link || prev.nfc_link
      }))
    }
  }

  const publicPages = useMemo(() => {
    const pages: Array<{ id: string; name: string; url: string; type: 'profile' | 'nfc_card' }> = []
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci')

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

    nfcCards?.forEach(card => {
      if (card.nfc_link) {
        let slug = card.nfc_link
        try {
          if (card.nfc_link.startsWith('http')) {
            const url = new URL(card.nfc_link)
            slug = url.pathname.replace(/^\//, '')
          }
        } catch { /* ignore */ }

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

  // Loader initial léger
  const isInitialLoading = (isLoading && profiles.length === 0) && (nfcLoading && nfcCards.length === 0)

  if (isInitialLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-neutral-900 mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">Chargement de votre espace profils...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center max-w-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-950">Erreur de chargement</h3>
              <p className="text-xs text-neutral-500 mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="rounded-xl border-neutral-200"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

          {/* Fil d'Ariane & Bouton retour */}
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour au tableau de bord</span>
            </Link>
          </div>

          {/* BANNIÈRE DE VISUELS RECOMMANDÉS (SI MANQUANTS) */}
          <ProfileVisualsBanner
            incompleteProfiles={incompleteProfiles}
            onComplete={handleCompleteVisuals}
          />

          {/* EN-TÊTE PRINCIPAL : TITRE & CTA NOBLE */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
                Mes Profils & Cartes NFC
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Gérez vos cartes numériques, vos liens professionnels et vos modèles de partage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/orders/new')}
                className="h-10 px-3.5 text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-neutral-600" />
                <span className="hidden sm:inline">Commander une carte physique</span>
                <span className="sm:hidden">Commander</span>
              </Button>

              <Button
                size="sm"
                onClick={() => router.push('/dashboard/profiles/create')}
                className="h-10 px-4 text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau profil</span>
              </Button>
            </div>
          </div>

          {/* KPI BENTO STRIP (3 Indicateurs Clairs & Épurés) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* KPI 1 : Profils Actifs */}
            <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">Profils numériques</p>
                <p className="text-xl sm:text-2xl font-semibold text-neutral-950 tracking-tight font-mono mt-0.5">
                  {profiles.length}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">En ligne et partagés</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                <User className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 2 : Cartes NFC Liées */}
            <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">Cartes connectées</p>
                <p className="text-xl sm:text-2xl font-semibold text-neutral-950 tracking-tight font-mono mt-0.5">
                  {nfcCards?.length || 0}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Puces sans contact actives</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 3 : Carte Physique & Commandes */}
            <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">Version physique</p>
                <p className="text-xl sm:text-2xl font-semibold text-neutral-950 tracking-tight font-mono mt-0.5">
                  {orderStats?.paid_orders ? `${orderStats.paid_orders} payée(s)` : 'À commander'}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">NFC + Finition haut de gamme</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* ONGLET DE NAVIGATION ERGONOMIQUE AVEC SURBRILLANCE ACTIVE NETTE */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full space-y-6">
            
            <div className="w-full overflow-x-auto pb-1 no-scrollbar">
              <div className="inline-flex items-center p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200/90 gap-1.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('profiles')}
                  className={cn(
                    "h-10 px-4 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap",
                    activeTab === 'profiles'
                      ? "bg-neutral-950 text-white shadow-md shadow-neutral-950/25 ring-1 ring-neutral-800 scale-[1.02]"
                      : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
                  )}
                >
                  <User className={cn("w-3.5 h-3.5 transition-colors", activeTab === 'profiles' ? "text-orange-400" : "text-neutral-400")} />
                  <span>Profils en ligne</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all",
                    activeTab === 'profiles'
                      ? "bg-orange-500/25 text-orange-300 border border-orange-500/40"
                      : "bg-neutral-200 text-neutral-600"
                  )}>
                    {profiles.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cards')}
                  className={cn(
                    "h-10 px-4 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap",
                    activeTab === 'cards'
                      ? "bg-neutral-950 text-white shadow-md shadow-neutral-950/25 ring-1 ring-neutral-800 scale-[1.02]"
                      : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
                  )}
                >
                  <Smartphone className={cn("w-3.5 h-3.5 transition-colors", activeTab === 'cards' ? "text-orange-400" : "text-neutral-400")} />
                  <span>Cartes NFC</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all",
                    activeTab === 'cards'
                      ? "bg-orange-500/25 text-orange-300 border border-orange-500/40"
                      : "bg-neutral-200 text-neutral-600"
                  )}>
                    {nfcCards?.length || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={cn(
                    "h-10 px-4 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap",
                    activeTab === 'orders'
                      ? "bg-neutral-950 text-white shadow-md shadow-neutral-950/25 ring-1 ring-neutral-800 scale-[1.02]"
                      : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
                  )}
                >
                  <CreditCard className={cn("w-3.5 h-3.5 transition-colors", activeTab === 'orders' ? "text-orange-400" : "text-neutral-400")} />
                  <span>Commandes physiques</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all",
                    activeTab === 'orders'
                      ? "bg-orange-500/25 text-orange-300 border border-orange-500/40"
                      : "bg-neutral-200 text-neutral-600"
                  )}>
                    {orderStats?.total_orders || 0}
                  </span>
                </button>
              </div>
            </div>

            {/* CONTENU ONGLET 1 : PROFILS */}
            <TabsContent value="profiles" className="focus-visible:outline-none">
              {profiles.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50 p-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto shadow-xs">
                    <User className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div className="max-w-sm mx-auto">
                    <h3 className="text-base font-semibold text-neutral-950">Aucun profil numérique créé</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Créez votre première carte de visite connectée pour commencer à partager vos coordonnées.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/dashboard/profiles/create')}
                    className="h-10 px-5 text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Créer mon profil Ofika
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      onEdit={handleEditProfile}
                      onDeleteRequest={(p) => setProfileToDelete(p)}
                      onView={handleViewProfile}
                      onChangeDesign={handleChangeDesign}
                      onPersonalize={handlePersonalize}
                      onManageFields={handleManageFields}
                      onAddImages={handleAddImages}
                      nfcCards={nfcCards}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* CONTENU ONGLET 2 : CARTES NFC */}
            <TabsContent value="cards" className="focus-visible:outline-none">
              {nfcLoading ? (
                <div className="py-12 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
                </div>
              ) : nfcCards.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50 p-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto shadow-xs">
                    <QrCode className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div className="max-w-sm mx-auto">
                    <h3 className="text-base font-semibold text-neutral-950">Aucune carte NFC configurée</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Reliez une puce sans contact ou créez une carte digitale pour vos échanges en rendez-vous.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/onboarding/nfc-card?reset=true')}
                    className="h-10 px-5 text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-xs"
                  >
                    <Smartphone className="w-4 h-4 mr-1.5" />
                    Configurer une carte NFC
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {nfcCards.map((card) => (
                    <NFCCardItem
                      key={card.id}
                      card={card}
                      onPreview={handlePreviewCard}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* CONTENU ONGLET 3 : COMMANDES PHYSIQUES */}
            <TabsContent value="orders" className="focus-visible:outline-none">
              <div className="border border-neutral-200/90 rounded-2xl p-5 sm:p-6 bg-white shadow-xs space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-neutral-100">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800">
                      <CreditCard className="w-3.5 h-3.5" />
                      Fabrication & Envoi en Côte d'Ivoire
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-950 tracking-tight">
                      Votre Carte Physique Ofika NFC
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-xl">
                      Une carte rigide gravée au laser, équipée d'une puce NFC NTAG216 et d'un QR code permanent, utilisable à vie sans abonnement.
                    </p>
                  </div>

                  <Button
                    onClick={() => router.push('/dashboard/orders/new')}
                    className="h-10 px-4 text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-xs shrink-0 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 mr-1.5" />
                    Commander ({basePrice.toLocaleString('fr-FR')} XOF)
                  </Button>
                </div>

                {/* Grille récapitulative de statut */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                    <span className="text-neutral-500">Commandes totales</span>
                    <p className="font-semibold text-neutral-900 text-base font-mono mt-0.5">
                      {orderStats?.total_orders || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                    <span className="text-neutral-500">Commandes payées</span>
                    <p className="font-semibold text-neutral-900 text-base font-mono mt-0.5">
                      {orderStats?.paid_orders || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                    <span className="text-neutral-500">Délai de livraison estimé</span>
                    <p className="font-semibold text-neutral-900 text-base mt-0.5">
                      7 à 14 jours ouvrés
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/orders')}
                    className="h-9 px-4 text-xs text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 border-neutral-200 rounded-xl"
                  >
                    Voir l'historique complet de mes commandes
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>

              </div>
            </TabsContent>

          </Tabs>

        </div>
      </div>

      {/* MODAL DIALOG DE CONFIRMATION DE SUPPRESSION (Accessible, remplace window.confirm) */}
      <Dialog open={!!profileToDelete} onOpenChange={(open) => !open && setProfileToDelete(null)}>
        <DialogContent className="max-w-md bg-white border border-neutral-200/90 rounded-2xl p-6 text-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-neutral-950 tracking-tight">
              Supprimer définitivement ce profil ?
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-2">
              Êtes-vous sûr de vouloir supprimer le profil de <strong className="text-neutral-900">{profileToDelete?.name}</strong> ? Cette action est irréversible : l'URL personnalisée <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800 font-mono">/{profileToDelete?.custom_url || profileToDelete?.username}</code> ne sera plus accessible à vos contacts.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setProfileToDelete(null)}
              disabled={isDeleting}
              className="h-9 px-4 text-xs rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            >
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-9 px-4 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer définitivement</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODALE DE PRÉVISUALISATION PHYSIQUE DE CARTE NFC */}
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
