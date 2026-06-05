"use client"

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { WebhookService } from '@/lib/services/business-rules'
import {
  Loader2, Plus, Trash2, Globe, ShoppingBag, Link as LinkIcon,
  MessageCircle, Facebook, Instagram, Twitter, Youtube, Linkedin,
  AlertCircle, Info, MapPin, Music, User, Phone, TrendingUp, Settings,
  Sparkles, Cog, Check, Github, Link2, Briefcase, Calendar
} from "lucide-react"
import { ImageUploadFixed as ImageUpload } from "@/components/ui/image-upload-fixed"
import { UrlAvailabilityChecker } from "@/components/ui/url-availability-checker"


// Import du schéma unifié depuis lib/validations.ts
import { profileSchema } from '@/lib/validations'

type ProfileFormData = z.infer<typeof profileSchema>

const designFieldsConfig: Record<string, {
  name: string
  description: string
  supportsSocialLinks: boolean
  requiresLinks: boolean
  linkType?: 'shop' | 'website' | 'other'
}> = {
  default: {
    name: 'Design standard',
    description: 'Champs génériques disponibles pour tous les profils.',
    supportsSocialLinks: true,
    requiresLinks: false,
    linkType: 'website'
  },
  design1: {
    name: 'Design Classique',
    description: 'Style professionnel et épuré.',
    supportsSocialLinks: true,
    requiresLinks: false,
  },
  design2: {
    name: 'Design',
    description: 'Grille dynamique et moderne.',
    supportsSocialLinks: true,
    requiresLinks: false,
  },
  design3: {
    name: 'Design Créatif',
    description: 'Mise en avant visuelle accrue.',
    supportsSocialLinks: true,
    requiresLinks: true,
  },
  design4: {
    name: 'Design Nature',
    description: 'Minimaliste, inspiré par la nature.',
    supportsSocialLinks: true,
    requiresLinks: false,
  },
  design7: {
    name: 'Design Dark Elegant',
    description: 'Ambiance sombre et premium.',
    supportsSocialLinks: true,
    requiresLinks: false,
  },
  classic: {
    name: 'Design Classique',
    description: 'Version historique de notre design professionnel.',
    supportsSocialLinks: true,
    requiresLinks: false,
  },
  influencer: {
    name: 'Design Influenceur',
    description: 'Pensé pour les créateurs de contenu.',
    supportsSocialLinks: true,
    requiresLinks: false,
  },
  ecommerce: {
    name: 'Design E-commerce',
    description: 'Met en valeur vos produits et boutiques.',
    supportsSocialLinks: true,
    requiresLinks: true,
    linkType: 'shop',
  },
  freelance: {
    name: 'Design Freelance',
    description: 'Idéal pour présenter vos services.',
    supportsSocialLinks: true,
    requiresLinks: false,
  },
}

const SOCIAL_STATS_CONFIG: Record<string, any> = {
  instagram: {
    label: "Instagram",
    icon: <Instagram className="w-4 h-4 text-[#ee2a7b]" />,
    followersKey: "instagram_followers",
    postsKey: "instagram_posts",
    verifiedKey: "instagram_verified",
    showFollowersKey: "ig_show_followers",
    showPostsKey: "ig_show_posts",
    showVerifiedKey: "ig_show_verified"
  },
  tiktok: {
    label: "TikTok",
    icon: <Music className="w-4 h-4 text-black" />,
    followersKey: "tiktok_followers",
    postsKey: "tiktok_posts",
    verifiedKey: "tiktok_verified",
    showFollowersKey: "tt_show_followers",
    showPostsKey: "tt_show_posts",
    showVerifiedKey: "tt_show_verified"
  },
  youtube: {
    label: "YouTube",
    icon: <Youtube className="w-4 h-4 text-[#ff0000]" />,
    followersKey: "youtube_subscribers",
    postsKey: "youtube_videos",
    verifiedKey: "youtube_verified",
    showFollowersKey: "yt_show_subscribers",
    showPostsKey: "yt_show_videos",
    showVerifiedKey: "yt_show_verified",
    followersLabel: "Abos",
    postsLabel: "Vidéos"
  },
  twitter: {
    label: "X (Twitter)",
    icon: <Twitter className="w-4 h-4 text-[#1DA1F2]" />,
    followersKey: "twitter_followers",
    postsKey: "twitter_posts",
    verifiedKey: "twitter_verified",
    showFollowersKey: "tw_show_followers",
    showPostsKey: "tw_show_posts",
    showVerifiedKey: "tw_show_verified"
  },
  facebook: {
    label: "Facebook",
    icon: <Facebook className="w-4 h-4 text-[#1877F2]" />,
    followersKey: "facebook_followers",
    verifiedKey: "facebook_verified",
    showFollowersKey: "fb_show_followers",
    showVerifiedKey: "fb_show_verified"
  }
}

const COUNTRY_CODES = [
  { code: '225', label: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '33', label: 'France', flag: '🇫🇷' },
  { code: '221', label: 'Sénégal', flag: '🇸🇳' },
  { code: '223', label: 'Mali', flag: '🇲🇱' },
  { code: '226', label: 'Burkina Faso', flag: '🇧🇫' },
  { code: '229', label: 'Bénin', flag: '🇧🇯' },
  { code: '228', label: 'Togo', flag: '🇹🇬' },
  { code: '224', label: 'Guinée', flag: '🇬🇳' },
  { code: '237', label: 'Cameroun', flag: '🇨🇲' },
  { code: '241', label: 'Gabon', flag: '🇬🇦' },
  { code: '243', label: 'RD Congo', flag: '🇨🇩' },
  { code: '242', label: 'Congo', flag: '🇨🇬' },
  { code: '212', label: 'Maroc', flag: '🇲🇦' },
  { code: '216', label: 'Tunisie', flag: '🇹🇳' },
  { code: '213', label: 'Algérie', flag: '🇩🇿' },
  { code: '1', label: 'USA', flag: '🇺🇸' },
  { code: '44', label: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '32', label: 'Belgique', flag: '🇧🇪' },
  { code: '31', label: 'Pays-Bas', flag: '🇳🇱' },
  { code: '41', label: 'Suisse', flag: '🇨🇭' },
  { code: '234', label: 'Nigeria', flag: '🇳🇬' },
  { code: '233', label: 'Ghana', flag: '🇬🇭' },
]

interface ProfileFormProps {
  profile_id?: string
  isEditing?: boolean
  onSuccess?: (data?: ProfileFormData) => void
  onCancel?: () => void
  requireAuth?: boolean // Si false, permet la soumission sans authentification
  hideImages?: boolean // Si true, masque les champs photo de profil et couverture
  initialData?: any // Données initiales pour pré-remplir le formulaire
}

export function ProfileForm({ profile_id, isEditing = false, onSuccess, onCancel, requireAuth = true, hideImages = false, initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditing)
  const [oldSlug, setOldSlug] = useState<string | null>(null)

  const supabase = createClient()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.name || '',
      profile_type: initialData?.profile_type || 'professional',
      bio: initialData?.bio || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      location: initialData?.location || '',
      image_url: initialData?.image_url || '',
      cover_image_url: initialData?.cover_image_url || '',
      custom_url: initialData?.custom_url || '',
      social_links: initialData?.social_links || [],
      custom_links: initialData?.custom_links || [],
      company: initialData?.company || '',
      job_title: initialData?.job_title || '',
      design_choice: initialData?.design_choice || 'design1',
      color_theme: initialData?.color_theme || 'default',
      is_public: initialData?.is_public ?? true,
      display_reviews: initialData?.display_reviews ?? false,
      instagram_followers: initialData?.instagram_followers || '',
      instagram_posts: initialData?.instagram_posts || '',
      instagram_verified: initialData?.instagram_verified ?? false,
      ig_show_followers: initialData?.ig_show_followers ?? true,
      ig_show_posts: initialData?.ig_show_posts ?? true,
      ig_show_verified: initialData?.ig_show_verified ?? true,

      tiktok_followers: initialData?.tiktok_followers || '',
      tiktok_posts: initialData?.tiktok_posts || '',
      tiktok_verified: initialData?.tiktok_verified ?? false,
      tt_show_followers: initialData?.tt_show_followers ?? true,
      tt_show_posts: initialData?.tt_show_posts ?? true,
      tt_show_verified: initialData?.tt_show_verified ?? true,

      youtube_subscribers: initialData?.youtube_subscribers || '',
      youtube_videos: initialData?.youtube_videos || '',
      youtube_verified: initialData?.youtube_verified ?? false,
      yt_show_subscribers: initialData?.yt_show_subscribers ?? true,
      yt_show_videos: initialData?.yt_show_videos ?? true,
      yt_show_verified: initialData?.yt_show_verified ?? true,

      twitter_followers: initialData?.twitter_followers || '',
      twitter_posts: initialData?.twitter_posts || '',
      twitter_verified: initialData?.twitter_verified ?? false,
      tw_show_followers: initialData?.tw_show_followers ?? true,
      tw_show_posts: initialData?.tw_show_posts ?? true,
      tw_show_verified: initialData?.tw_show_verified ?? true,

      facebook_followers: initialData?.facebook_followers || '',
      facebook_verified: initialData?.facebook_verified ?? false,
      fb_show_followers: initialData?.fb_show_followers ?? true,
      fb_show_verified: initialData?.fb_show_verified ?? true
    }
  })
  const selectedDesign = (form.watch('design_choice') as keyof typeof designFieldsConfig) || 'default'
  const designConfig = designFieldsConfig[selectedDesign] || designFieldsConfig.default

  // Charger les données du profil si on est en mode édition
  useEffect(() => {
    if (isEditing && profile_id) {
      loadProfileData()
    }
  }, [isEditing, profile_id])

  const loadProfileData = async () => {
    try {
      setLoadingData(true)

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile_id)
        .single()

      if (error) throw error

      if (profile) {
        setOldSlug(profile.custom_url || profile.username || profile.id)
        form.reset({
          name: profile.name || '',
          profile_type: profile.profile_type || 'professional',
          bio: profile.bio || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          image_url: profile.image_url || '',
          cover_image_url: profile.cover_image_url || '',
          custom_url: profile.custom_url || '',
          social_links: profile.social_links || [],
          custom_links: profile.custom_links || [],
          company: profile.company || '',
          job_title: profile.job_title || '',
          design_choice: profile.design_choice || 'design1',
          color_theme: profile.color_theme || 'default',
          is_public: profile.is_public ?? true,
          display_reviews: profile.display_reviews ?? false,
          instagram_followers: profile.instagram_followers || '',
          instagram_posts: profile.instagram_posts || '',
          instagram_verified: profile.instagram_verified ?? false,
          ig_show_followers: profile.ig_show_followers ?? true,
          ig_show_posts: profile.ig_show_posts ?? true,
          ig_show_verified: profile.ig_show_verified ?? true,

          tiktok_followers: profile.tiktok_followers || '',
          tiktok_posts: profile.tiktok_posts || '',
          tiktok_verified: profile.tiktok_verified ?? false,
          tt_show_followers: profile.tt_show_followers ?? true,
          tt_show_posts: profile.tt_show_posts ?? true,
          tt_show_verified: profile.tt_show_verified ?? true,

          youtube_subscribers: profile.youtube_subscribers || '',
          youtube_videos: profile.youtube_videos || '',
          youtube_verified: profile.youtube_verified ?? false,
          yt_show_subscribers: profile.yt_show_subscribers ?? true,
          yt_show_videos: profile.yt_show_videos ?? true,
          yt_show_verified: profile.yt_show_verified ?? true,

          twitter_followers: profile.twitter_followers || '',
          twitter_posts: profile.twitter_posts || '',
          twitter_verified: profile.twitter_verified ?? false,
          tw_show_followers: profile.tw_show_followers ?? true,
          tw_show_posts: profile.tw_show_posts ?? true,
          tw_show_verified: profile.tw_show_verified ?? true,

          facebook_followers: profile.facebook_followers || '',
          facebook_verified: profile.facebook_verified ?? false,
          fb_show_followers: profile.fb_show_followers ?? true,
          fb_show_verified: profile.fb_show_verified ?? true
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setLoadingData(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true)
      console.log('🔍 Données du formulaire:', data)
      console.log('📸 Photo de couverture:', data.cover_image_url)

      // Si requireAuth est false, on retourne juste les données via onSuccess
      if (!requireAuth) {
        console.log('✅ Mode sans authentification - retour des données')
        if (onSuccess) {
          onSuccess(data)
        }
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Utilisateur non authentifié')
      }

      if (isEditing && profile_id) {
        // Mode édition - mettre à jour le profil
        const updateData = {
          name: data.name,
          profile_type: data.profile_type,
          bio: data.bio,
          email: data.email,
          phone: data.phone,
          location: data.location,
          image_url: data.image_url,
          cover_image_url: data.cover_image_url,
          custom_url: data.custom_url,
          social_links: data.social_links,
          custom_links: data.custom_links,
          design_choice: data.design_choice,
          color_theme: data.color_theme,
          is_public: data.is_public,
          display_reviews: data.display_reviews,
          instagram_followers: data.instagram_followers,
          instagram_posts: data.instagram_posts,
          instagram_verified: data.instagram_verified,
          ig_show_followers: data.ig_show_followers,
          ig_show_posts: data.ig_show_posts,
          ig_show_verified: data.ig_show_verified,

          tiktok_followers: data.tiktok_followers,
          tiktok_posts: data.tiktok_posts,
          tiktok_verified: data.tiktok_verified,
          tt_show_followers: data.tt_show_followers,
          tt_show_posts: data.tt_show_posts,
          tt_show_verified: data.tt_show_verified,

          youtube_subscribers: data.youtube_subscribers,
          youtube_videos: data.youtube_videos,
          youtube_verified: data.youtube_verified,
          yt_show_subscribers: data.yt_show_subscribers,
          yt_show_videos: data.yt_show_videos,
          yt_show_verified: data.yt_show_verified,

          twitter_followers: data.twitter_followers,
          twitter_posts: data.twitter_posts,
          twitter_verified: data.twitter_verified,
          tw_show_followers: data.tw_show_followers,
          tw_show_posts: data.tw_show_posts,
          tw_show_verified: data.tw_show_verified,

          facebook_followers: data.facebook_followers,
          facebook_verified: data.facebook_verified,
          fb_show_followers: data.fb_show_followers,
          fb_show_verified: data.fb_show_verified,
          company: data.company,
          job_title: data.job_title
        }

        console.log('💾 Données à enregistrer:', updateData)

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profile_id)
          .eq('user_id', user.id)

        // ✅ SYNC WITH NFC CARDS: Update linked cards with new workspace/job info
        const { error: syncError } = await supabase
          .from('digital_nfc_cards')
          .update({
            full_name: data.name,
            company: data.company,
            job_title: data.job_title,
            bio: data.bio,
            phone: data.phone,
            email: data.email,
            location: data.location,
            profile_photo_url: data.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('profile_id', profile_id)
          .eq('user_id', user.id)

        if (syncError) {
          console.warn('⚠️ Sync NFC error:', syncError)
        }

        // ✅ SYNC WITH QR_REDIRECTS: Call server-side API to bypass RLS
        const newSlug = data.custom_url || data.username
        const actualProfileId = profile_id || (data as any).id
        
        if (newSlug && actualProfileId) {
            try {
                console.log('🔄 Triggering QR sync...', { actualProfileId, newSlug, oldSlug })
                const syncRes = await fetch('/api/profiles/sync-qr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        profileId: actualProfileId,
                        newSlug,
                        oldSlug,
                        name: data.name
                    })
                })
                const syncData = await syncRes.json()
                if (syncData.success) {
                    console.log(`✅ successfully synced ${syncData.updatedCount} QR redirects`)
                    setOldSlug(newSlug)
                }
            } catch (err) {
                console.warn('⚠️ QR Redirect sync API error:', err)
            }
        }

        if (error) {
          console.error('❌ Erreur Supabase:', error)
          throw error
        }

        console.log('✅ Profil mis à jour avec succès')
        toast.success('Profil mis à jour avec succès')
        if (onSuccess) {
          onSuccess()
        }
      } else {
        // Mode création - juste passer les données au callback
        toast.success('Informations enregistrées !')
        if (onSuccess) {
          onSuccess(data)
        }
        return // Sortir de la fonction pour éviter d'appeler onSuccess() deux fois
      }

      onSuccess?.()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(isEditing ? 'Erreur lors de la mise à jour du profil' : 'Erreur lors de la création du profil')
    } finally {
      setLoading(false)
    }
  }

  // Afficher un loader pendant le chargement des données
  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }


  return (
    <>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error('❌ Erreurs de validation:', errors)
          toast.error('Veuillez corriger les erreurs dans le formulaire')
        })} className="space-y-6">
          <div className="space-y-8">
            {/* Section Identité */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-900" />
                Identité
              </h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de profil *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="professional">Professionnel</SelectItem>
                          <SelectItem value="personal">Personnel</SelectItem>
                          <SelectItem value="event">Événement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="custom_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL personnalisée</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            ofika.com/
                          </span>
                          <UrlAvailabilityChecker
                            value={field.value || ''}
                            onChange={field.onChange}
                            type="custom_url"
                            excludeProfileId={profile_id}
                            placeholder="mon-profil"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entreprise</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Acme Inc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poste / Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Directeur Général" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (max 2048 caractères) *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Présentez-vous en quelques paragraphes..."
                        className="resize-y min-h-[120px]"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-end text-[10px] text-gray-400 font-medium">
                      {(field.value?.length || 0)}/2048
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section Coordonnées */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-900" />
                Coordonnées
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="exemple@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+225 00 00 00 00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation / Adresse</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input className="pl-9" placeholder="Abidjan, Côte d'Ivoire" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section Réseaux Sociaux */}
            <div className="space-y-4 pt-6 border-t font-sans">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-900" />
                    Réseaux Sociaux
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ajoutez vos profils pour enrichir votre page publique
                  </p>
                </div>
                {!isEditing && (
                  <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                    Recommandé
                  </Badge>
                )}
              </div>

              <FormField
                control={form.control}
                name="social_links"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-4">
                      {field.value?.map((link, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 border border-gray-200 rounded-2xl bg-gray-50/50 shadow-sm transition-all hover:border-gray-300">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm mt-1 shadow-md border-2 border-white">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Select
                                value={link.platform}
                                onValueChange={(value: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin' | 'snapchat' | 'telegram' | 'website' | 'github' | 'shop' | 'other') => {
                                  const newLinks = [...(field.value || [])]
                                  newLinks[index] = { ...link, platform: value }
                                  field.onChange(newLinks)
                                }}
                              >
                                <SelectTrigger className="bg-white border-gray-200">
                                  <SelectValue placeholder="Choisir un réseau social" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="whatsapp">
                                    <div className="flex items-center gap-2">
                                      <MessageCircle className="h-4 w-4 text-green-600" />
                                      WhatsApp
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="facebook">
                                    <div className="flex items-center gap-2">
                                      <Facebook className="h-4 w-4 text-blue-600" />
                                      Facebook
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="instagram">
                                    <div className="flex items-center gap-2">
                                      <Instagram className="h-4 w-4 text-pink-600" />
                                      Instagram
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="twitter">
                                    <div className="flex items-center gap-2">
                                      <Twitter className="h-4 w-4 text-sky-500" />
                                      Twitter / X
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="youtube">
                                    <div className="flex items-center gap-2">
                                      <Youtube className="h-4 w-4 text-red-600" />
                                      YouTube
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="tiktok">
                                    <div className="flex items-center gap-2">
                                      <div className="h-4 w-4 bg-black rounded-sm flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13-.08-.26-.17-.38-.25v7.39c.04 4.13-2.5 7.9-6.53 8.78-4.04.89-8.4-1.31-9.9-5.13-1.5-3.83.13-8.62 3.86-10.45,1.26-.61,2.69-.87 4.08-.8v3.98c-1.39-.14-2.87.21-3.92 1.18-1.05.97-1.47 2.45-1.12 3.83.35 1.38 1.53 2.5 2.94 2.78,1.41.28 2.95-.2 3.82-1.3.87-1.11 1.05-2.61 1.05-3.99V.02z" /></svg>
                                      </div>
                                      TikTok
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="linkedin">
                                    <div className="flex items-center gap-2">
                                      <Linkedin className="h-4 w-4 text-blue-700" />
                                      LinkedIn
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="snapchat">
                                    <div className="flex items-center gap-2">
                                      <div className="h-4 w-4 bg-yellow-400 rounded-sm" />
                                      Snapchat
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="telegram">
                                    <div className="flex items-center gap-2">
                                      <MessageCircle className="h-4 w-4 text-blue-500" />
                                      Telegram
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="website">
                                    <div className="flex items-center gap-2">
                                      <Globe className="h-4 w-4 text-gray-600" />
                                      Site Web
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="github">
                                    <div className="flex items-center gap-2">
                                      <Github className="h-4 w-4 text-gray-900" />
                                      GitHub
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="shop">
                                    <div className="flex items-center gap-2">
                                      <ShoppingBag className="h-4 w-4 text-amber-600" />
                                      Boutique
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="other">
                                    <div className="flex items-center gap-2">
                                      <Link2 className="h-4 w-4 text-gray-500" />
                                      Autre
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                {link.platform === 'whatsapp' ? (
                                  <div className="flex-1 flex gap-2">
                                    <div className="relative w-32">
                                      <Select
                                        value={(() => {
                                          const full = link.url.replace('https://wa.me/', '')
                                          const matched = COUNTRY_CODES.find(c => full.startsWith(c.code))
                                          return matched?.code || '225'
                                        })()}
                                        onValueChange={(code) => {
                                          const full = link.url.replace('https://wa.me/', '')
                                          const matched = COUNTRY_CODES.find(c => full.startsWith(c.code))
                                          const number = matched ? full.substring(matched.code.length) : full

                                          const newLinks = [...(field.value || [])]
                                          newLinks[index] = { ...link, url: `https://wa.me/${code}${number}` }
                                          field.onChange(newLinks)
                                        }}
                                      >
                                        <SelectTrigger className="bg-white border-gray-200 h-10 text-xs px-2">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {COUNTRY_CODES.map(c => (
                                            <SelectItem key={c.code} value={c.code} className="text-xs">
                                              <span className="flex items-center gap-2">
                                                <span>{c.flag}</span>
                                                <span>+{c.code}</span>
                                              </span>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <div className="absolute -top-5 left-0 text-[10px] font-bold text-gray-400 uppercase">Pays</div>
                                    </div>
                                    <div className="relative flex-1">
                                      <Input
                                        placeholder="Numéro"
                                        type="tel"
                                        className="bg-white border-gray-200 h-10 text-sm"
                                        value={(() => {
                                          const full = link.url.replace('https://wa.me/', '')
                                          const matched = COUNTRY_CODES.find(c => full.startsWith(c.code))
                                          return matched ? full.substring(matched.code.length) : full
                                        })()}
                                        onChange={(e) => {
                                          const num = e.target.value.replace(/\D/g, '')
                                          const full = link.url.replace('https://wa.me/', '')
                                          const code = COUNTRY_CODES.find(c => full.startsWith(c.code))?.code || '225'

                                          const newLinks = [...(field.value || [])]
                                          newLinks[index] = { ...link, url: `https://wa.me/${code}${num}` }
                                          field.onChange(newLinks)
                                        }}
                                      />
                                      <div className="absolute -top-5 left-0 text-[10px] font-bold text-gray-400 uppercase">Numéro</div>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <Input
                                      placeholder="Lien du profil (ex: https://...)"
                                      type="url"
                                      className="bg-white border-gray-200 flex-1"
                                      value={link.url}
                                      onChange={(e) => {
                                        const newLinks = [...(field.value || [])]
                                        newLinks[index] = { ...link, url: e.target.value }
                                        field.onChange(newLinks)
                                      }}
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newLinks = field.value?.filter((_, i) => i !== index) || []
                              field.onChange(newLinks)
                            }}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {(field.value?.length || 0) >= 4 && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <p className="text-sm text-amber-800">
                            Limite atteinte : 4 réseaux sociaux maximum
                          </p>
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newLinks = [...(field.value || []), { platform: 'whatsapp' as const, url: '' }]
                          field.onChange(newLinks)
                        }}
                        className="w-full h-12 border-dashed border-2 hover:border-orange-500 hover:text-orange-600 transition-all rounded-xl"
                        disabled={(field.value?.length || 0) >= 4}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un réseau social {(field.value?.length || 0) > 0 && `(${field.value?.length || 0}/4)`}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section Liens Personnalisés */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-orange-500" />
                    Liens Personnalisés
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Boutique, Portfolio, Site Web, etc.
                  </p>
                </div>
              </div>
              <FormField
                control={form.control}
                name="custom_links"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-3">
                      {field.value?.map((link, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder={designConfig.linkType === 'shop' ? 'Nom du produit / boutique' : 'Titre du lien'}
                              value={link.title}
                              onChange={(e) => {
                                const newLinks = [...(field.value || [])]
                                newLinks[index] = { ...link, title: e.target.value }
                                field.onChange(newLinks)
                              }}
                            />
                            <Input
                              placeholder="https://exemple.com"
                              type="url"
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...(field.value || [])]
                                newLinks[index] = { ...link, url: e.target.value }
                                field.onChange(newLinks)
                              }}
                            />
                            <Select
                              value={link.type}
                              onValueChange={(value: 'website' | 'shop' | 'other') => {
                                const newLinks = [...(field.value || [])]
                                newLinks[index] = { ...link, type: value }
                                field.onChange(newLinks)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="website">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Site Web
                                  </div>
                                </SelectItem>
                                <SelectItem value="portfolio">
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Portfolio
                                  </div>
                                </SelectItem>
                                <SelectItem value="appointment">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Rendez-vous
                                  </div>
                                </SelectItem>
                                <SelectItem value="contact">
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Contact
                                  </div>
                                </SelectItem>
                                <SelectItem value="shop">
                                  <div className="flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Boutique
                                  </div>
                                </SelectItem>
                                <SelectItem value="other">
                                  <div className="flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4" />
                                    Autre
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newLinks = field.value?.filter((_, i) => i !== index) || []
                              field.onChange(newLinks)
                            }}
                            className="mt-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {(field.value?.length || 0) >= 4 && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <p className="text-sm text-amber-800">
                            Limite atteinte : 4 liens personnalisés maximum
                          </p>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newLinks = [...(field.value || []), { title: '', url: '', type: (designConfig.linkType || 'website') as 'website' | 'shop' | 'other' }]
                          field.onChange(newLinks)
                        }}
                        className="w-full"
                        disabled={(field.value?.length || 0) >= 4}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un lien {(field.value?.length || 0) > 0 && `(${field.value?.length || 0}/4)`}
                      </Button>
                      {designConfig.requiresLinks && (field.value?.length || 0) === 0 && (
                        <p className="text-sm text-red-600">
                          ⚠️ Ce design nécessite au moins un lien personnalisé.
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section Images - Photo de profil et photo de couverture */}
            {!hideImages && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Images</h3>

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo de profil</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">
                        Image de profil pour votre page (recommandé : 400x400px)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo de couverture</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">
                        Image de fond pour votre profil (recommandé : 1200x400px)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Section Configuration */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Cog className="h-5 w-5 text-orange-500" />
                Configuration
              </h3>

              <FormField
                control={form.control}
                name="display_reviews"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Avis clients</FormLabel>
                      <div className="text-sm text-gray-500">
                        Afficher les témoignages clients sur votre profil
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Profil public</FormLabel>
                      <p className="text-sm text-gray-500">
                        Permet aux autres de voir et partager ce profil
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Mettre à jour' : 'Continuer'}
              </Button>
            </div>
          </div>
        </form>
      </Form >
    </>
  )
}