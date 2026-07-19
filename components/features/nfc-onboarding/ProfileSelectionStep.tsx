'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  X,
  CheckCircle,
  Globe,
  Lock,
  FileText,
  LayoutGrid,
  Sparkles,
  Leaf,
  TrendingUp,
  ShoppingBag,
  Moon,
  Briefcase,
  User,
  PlusCircle,
  Smartphone,
  Tablet,
  Eye,
  ArrowRight,
  Link
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LinkInBioDesign1 } from '@/components/features/profiles/LinkInBioDesign1'
import { LinkInBioDesign2 } from '@/components/features/profiles/LinkInBioDesign2'
import { LinkInBioDesign3 } from '@/components/features/profiles/LinkInBioDesign3'
import { LinkInBioDesign4 } from '@/components/features/profiles/LinkInBioDesign4'
import { LinkInBioDesign7 } from '@/components/features/profiles/LinkInBioDesign7'
import { LinkInBioInfluencer } from '@/components/features/profiles/LinkInBioInfluencer'
import { LinkInBioEcommerce } from '@/components/features/profiles/LinkInBioEcommerce'
import { LinkInBioFreelance } from '@/components/features/profiles/LinkInBioFreelance'
import { toast } from 'sonner'
import { useProfiles } from '@/lib/hooks/useProfiles'
import { NFCCardFormData } from '@/lib/types/nfc-card-onboarding'
import { useEffect, useCallback } from 'react'
import { SocialIcon } from '@/components/ui/social-icons'
import { BusinessRulesService } from '@/lib/services/business-rules'
import { cn } from '@/lib/utils'

const MAX_SOCIAL_LINKS = 4;
const MAX_CUSTOM_LINKS = 4;

interface ProfileSelectionStepProps {
  onProfileSelected: (profileId: string) => void
  onCreateNewProfile: (profileData: any) => void
  onFinalize?: (profileId?: string) => void
  onPrev?: () => void
  isLoading?: boolean
  formData?: NFCCardFormData
}

// Fonction pour créer le profil d'aperçu à partir des données du formulaire
const createPreviewProfile = (formData: any, designChoice: string) => {
  // Mapping des designs de l'onboarding vers les IDs de templates
  const designMapping: Record<string, string> = {
    'classic': 'design1',
    'grid': 'design2',
    'creative': 'design3',
    'showcase': 'design4',
    'nature': 'design3', // Fallback
    'ecommerce': 'ecommerce',
    'dark': 'design7',
    'freelance': 'freelance'
  };

  const actualDesignId = designMapping[designChoice] || designChoice;

  return {
    id: 'preview',
    user_id: 'preview-user',
    profile_type: 'public' as const,
    name: formData.name || 'Votre Nom',
    bio: formData.bio || '',
    image_url: formData.photo ? URL.createObjectURL(formData.photo) : (formData.profilePhotoUrl || null),
    custom_url: formData.customUrl || formData.username || 'votre-url',
    username: formData.username || formData.customUrl || 'votre-url',
    email: formData.email || null,
    phone: formData.phone || null,
    location: formData.location || null,
    design_choice: actualDesignId,
    color_theme: 'default',
    is_active: true,
    social_links: formData.social_links || [],
    custom_links: formData.custom_links || [],
    is_public: true,
    display_reviews: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    links: []
  }
}

export function ProfileSelectionStep({
  onProfileSelected,
  onCreateNewProfile,
  onFinalize,
  onPrev,
  isLoading = false,
  formData
}: ProfileSelectionStepProps) {
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | 'none'>('new')
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [showNewProfileForm, setShowNewProfileForm] = useState(true)

  // Données du nouveau profil
  const [newProfileData, setNewProfileData] = useState({
    name: '',
    type: 'professionnel',
    bio: '',
    photo: null as File | null,
    social_links: [] as Array<{ platform: string, url: string, label: string }>,
    custom_links: [] as Array<{ title: string, url: string, type?: string }>,
    customUrl: '',
    username: '',
    isPublic: true,
    designChoice: 'design1'
  })

  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)

  // ✅ Auto-remplissage intelligent depuis les étapes précédentes
  useEffect(() => {
    if (formData && !newProfileData.name && !newProfileData.bio) {
      console.log("✨ Auto-mapping des données pour le nouveau profil:", formData);

      const mappedLinks: Array<{ platform: string, url: string, label: string }> = [];
      if (formData.instagram) mappedLinks.push({ platform: 'instagram', url: formData.instagram, label: 'Instagram' });
      if (formData.tiktok) mappedLinks.push({ platform: 'tiktok', url: formData.tiktok, label: 'TikTok' });
      if (formData.linkedin) mappedLinks.push({ platform: 'linkedin', url: formData.linkedin, label: 'LinkedIn' });

      // Ajouter aussi les social_links structurés si présents
      if (formData.social_links) {
        formData.social_links.forEach(link => {
          if (!mappedLinks.find(ml => ml.platform === link.platform)) {
            mappedLinks.push({ platform: link.platform, url: link.url, label: link.platform.charAt(0).toUpperCase() + link.platform.slice(1) });
          }
        });
      }

      const generatedBio = formData.bio || (formData.jobTitle && formData.company ? `${formData.jobTitle} chez ${formData.company}` : '');
      const generatedSlug = (formData.fullName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      setNewProfileData(prev => ({
        ...prev,
        // @ts-ignore
        name: formData.profileName || formData.fullName || prev.name,
        bio: generatedBio || prev.bio,
        social_links: mappedLinks.length > 0 ? mappedLinks : prev.social_links,
        custom_links: formData.custom_links || prev.custom_links,
        // @ts-ignore
        username: formData.username || generatedSlug || prev.username,
        // @ts-ignore
        customUrl: formData.customUrl || generatedSlug || prev.customUrl
      }));
    }
  }, [formData]);

  // ✅ Vérification de disponibilité du slug en temps réel
  useEffect(() => {
    const checkAvailability = async () => {
      const slug = newProfileData.customUrl || newProfileData.username;
      if (!slug || slug.length < 3) {
        setIsSlugAvailable(null);
        return;
      }

      setIsCheckingSlug(true);
      try {
        const { isAvailable } = await BusinessRulesService.isCustomUrlAvailable(slug);
        setIsSlugAvailable(isAvailable);
      } catch (error) {
        console.error("Erreur vérification slug:", error);
      } finally {
        setIsCheckingSlug(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [newProfileData.customUrl, newProfileData.username]);

  const { profiles, loading: profilesLoading, refetch: refetchProfiles } = useProfiles()

  // Vérifier si l'utilisateur peut créer un nouveau profil
  const canCreateNewProfile = !profilesLoading && (profiles?.length || 0) < 3
  const hasExistingProfiles = !profilesLoading && (profiles?.length || 0) > 0

  const handleOptionChange = (option: 'existing' | 'new' | 'none') => {
    setSelectedOption(option)
    if (option === 'new') {
      setShowNewProfileForm(true)
    } else {
      setShowNewProfileForm(false)
    }
  }

  const handleExistingProfileSelect = (profileId: string) => {
    setSelectedProfileId(profileId)
  }

  const handleCreateNewProfile = () => {
    if (!newProfileData.name || !newProfileData.bio) {
      toast.error('Nom du profil et bio sont requis')
      return
    }

    onCreateNewProfile(newProfileData)
  }

  const handleAssociateProfile = async () => {
    // Si on a la fonction de finalisation (nouveau flux)
    if (onFinalize) {
      if (selectedOption === 'existing' && selectedProfileId) {
        // Cas 1 : Profil existant -> On finalise avec l'ID
        onFinalize(selectedProfileId)
      } else if (selectedOption === 'new') {
        // Cas 2 : Nouveau profil -> On délègue la création au parent qui appellera ensuite onFinalize
        if (!newProfileData.name || !newProfileData.bio) {
          toast.error('Nom du profil et bio sont requis')
          return
        }

        // On appelle onCreateNewProfile qui doit être async dans le parent
        if (isSlugAvailable === false) {
          toast.error("Cette URL est déjà utilisée par un autre utilisateur.");
          return;
        }
        await onCreateNewProfile(newProfileData)
      } else if (selectedOption === 'none') {
        // Cas 3 : Pas de profil -> On finalise sans ID
        onFinalize(undefined)
      } else {
        toast.error("Veuillez sélectionner une option.")
      }
      return
    }

    // Ancien flux (Si pas de onFinalize)
    if (selectedOption === 'existing' && selectedProfileId) {
      onProfileSelected(selectedProfileId)
    } else if (selectedOption === 'new') {
      handleCreateNewProfile()
    }
  }

  const addSocialLink = () => {
    if (newProfileData.social_links.length >= MAX_SOCIAL_LINKS) {
      toast.error(`Limite de ${MAX_SOCIAL_LINKS} liens atteinte`)
      return
    }
    setNewProfileData(prev => ({
      ...prev,
      social_links: [...prev.social_links, { platform: 'instagram', url: '', label: '' }]
    }))
  }

  const removeSocialLink = (index: number) => {
    setNewProfileData(prev => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index)
    }))
  }

  const updateSocialLink = (index: number, field: 'platform' | 'url' | 'label', value: string) => {
    setNewProfileData(prev => ({
      ...prev,
      social_links: prev.social_links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  // Handlers pour liens personnalisés
  const addCustomLink = () => {
    if (newProfileData.custom_links.length >= MAX_CUSTOM_LINKS) {
      toast.error(`Limite de ${MAX_CUSTOM_LINKS} liens atteinte`)
      return
    }
    setNewProfileData(prev => ({
      ...prev,
      custom_links: [...prev.custom_links, { title: '', url: '', type: 'website' }]
    }))
  }

  const removeCustomLink = (index: number) => {
    setNewProfileData(prev => ({
      ...prev,
      custom_links: prev.custom_links.filter((_, i) => i !== index)
    }))
  }

  const updateCustomLink = (index: number, field: 'title' | 'url' | 'type', value: string) => {
    setNewProfileData(prev => ({
      ...prev,
      custom_links: prev.custom_links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  const renderPreview = (designId: string) => {
    // On passe les données du nouveau profil plus les données du formulaire de base
    const profile = createPreviewProfile({ ...newProfileData, profilePhotoUrl: formData?.profilePhotoUrl }, designId)

    // Mapping interne car ProfileSelectionStep utilise des mots au lieu de design1, etc.
    const designMapping: Record<string, string> = {
      'classic': 'design1',
      'grid': 'design2',
      'creative': 'design3',
      'showcase': 'design4',
      'nature': 'design3',
      'ecommerce': 'ecommerce',
      'dark': 'design7',
      'freelance': 'freelance'
    };

    const actualId = designMapping[designId] || designId;

    switch (actualId) {
      case 'design1': return <LinkInBioDesign1 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design2': return <LinkInBioDesign2 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design3': return <LinkInBioDesign3 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design4': return <LinkInBioDesign4 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'influencer': return <LinkInBioInfluencer profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'ecommerce': return <LinkInBioEcommerce profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design7': return <LinkInBioDesign7 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'freelance': return <LinkInBioFreelance profile={profile as any} showAddToContacts={true} isPreview={true} />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Dernière étape ! 🎉
        </h2>
        <p className="text-lg text-gray-600 mb-2">
          Où voulez-vous envoyer vos contacts ?
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Important :</strong> Le QR code de votre carte NFC redirigera vos contacts vers le profil que vous choisirez ci-dessous.
          </p>
        </div>
      </div>

      {/* Choix initial */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {/* Créer nouveau profil */}
        <button
          type="button"
          onClick={() => canCreateNewProfile && handleOptionChange('new')}
          disabled={!canCreateNewProfile}
          className={`p-3 md:p-4 rounded-lg border-2 transition-all text-left h-full ${selectedOption === 'new'
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:border-blue-200'
            } ${!canCreateNewProfile ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex flex-col h-full justify-center">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${selectedOption === 'new'
                ? 'bg-blue-500'
                : 'bg-gray-200'
                }`}>
                {selectedOption === 'new' ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <PlusCircle className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              <h3 className="font-bold text-xs md:text-sm leading-tight">Nouveau profil</h3>
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 leading-normal pl-8">
              Créer une toute nouvelle page maintenant.
            </p>
            {!canCreateNewProfile && (
              <p className="text-[9px] text-red-600 mt-1 pl-8">Limite de 3 profils atteinte</p>
            )}
          </div>
        </button>

        {/* Pas de profil (Je le ferai plus tard) */}
        <button
          type="button"
          onClick={() => handleOptionChange('none')}
          className={`p-3 md:p-4 rounded-lg border-2 transition-all text-left h-full ${selectedOption === 'none'
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:border-blue-200'
            } cursor-pointer`}
        >
          <div className="flex flex-col h-full justify-center">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${selectedOption === 'none'
                ? 'bg-blue-500'
                : 'bg-gray-200'
                }`}>
                {selectedOption === 'none' ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <Lock className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              <h3 className="font-bold text-xs md:text-sm leading-tight">Pas de profil</h3>
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 leading-normal pl-8">
              Je l'associerai plus tard depuis mon dashboard.
            </p>
          </div>
        </button>
      </div>

      {/* Sélection de profil existant */}
      {selectedOption === 'existing' && hasExistingProfiles && (
        <Card className="animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Profils existants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profiles?.map((profile) => (
                <div
                  key={profile.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedProfileId === profile.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => handleExistingProfileSelect(profile.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{profile.name}</h4>
                      <p className="text-sm text-gray-600">{profile.bio}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {profile.profile_type || 'Professionnel'}
                        </Badge>
                        {profile.is_public ? (
                          <Badge variant="outline" className="text-xs text-green-600">
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-gray-600">
                            <Lock className="w-3 h-3 mr-1" />
                            Privé
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${selectedProfileId === profile.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                      }`}>
                      {selectedProfileId === profile.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire de création de nouveau profil avec Aperçu Mobile */}
      {selectedOption === 'new' && showNewProfileForm && canCreateNewProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Menu de configuration - Gauche */}
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-4">
              Configuration de votre page
            </h3>

            <Card className="border-orange-100 shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom d'affichage */}
                  <div className="space-y-2">
                    <Label htmlFor="profile-name" className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-500" />
                      Nom d'affichage
                    </Label>
                    <Input
                      id="profile-name"
                      value={newProfileData.name}
                      onChange={(e) => setNewProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Jean Dupont"
                      className="focus-visible:ring-orange-500"
                    />
                  </div>

                  {/* Lien personnalisé */}
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-orange-500" />
                      Lien personnalisé Ofika
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm select-none">
                        {(process.env.NEXT_PUBLIC_APP_URL || 'ofika.com')
                          .replace(/^https?:\/\//, '')
                          .replace(/\/$/, '') + '/'}
                      </span>
                      <div className="relative flex-1">
                        <Input
                          id="slug"
                          value={newProfileData.customUrl || newProfileData.username}
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                            setNewProfileData(prev => ({ ...prev, customUrl: val, username: val }));
                          }}
                          className={`rounded-l-none pr-10 focus-visible:ring-orange-500 ${isSlugAvailable === false ? 'border-red-300 bg-red-50' : isSlugAvailable === true ? 'border-green-300 bg-green-50' : ''}`}
                          placeholder="votre-nom"
                        />
                        <div className="absolute right-3 top-2.5">
                          {isCheckingSlug ? (
                            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          ) : isSlugAvailable === true ? (
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                          ) : isSlugAvailable === false ? (
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✗</div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] mt-1">
                      {isSlugAvailable === true ? (
                        <span className="text-green-600 font-medium">✅ Ce lien est disponible !</span>
                      ) : isSlugAvailable === false ? (
                        <span className="text-red-500 font-medium">❌ Ce lien est déjà pris.</span>
                      ) : (
                        <span className="text-gray-500">Choisissez l'adresse (min. 3 caractères).</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Ma bio en dessous */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    Ma bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={newProfileData.bio}
                    onChange={(e) => setNewProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Écrivez une courte description..."
                    rows={3}
                    className="focus-visible:ring-orange-500 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-100 shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-6">
                {/* SECTION RÉSEAUX SOCIAUX */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-orange-500" />
                      Réseaux Sociaux
                    </h4>
                    <Badge variant="secondary" className="text-xs font-bold">{newProfileData.social_links.length}/{MAX_SOCIAL_LINKS}</Badge>
                  </div>

                  <div className="space-y-3">
                    {newProfileData.social_links.map((link, index) => (
                      <div key={index} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                        <Select
                          value={link.platform}
                          onValueChange={(val) => updateSocialLink(index, 'platform', val)}
                        >
                          <SelectTrigger className="w-[140px] h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['whatsapp', 'instagram', 'facebook', 'linkedin', 'tiktok', 'github', 'shop', 'website', 'email', 'phone', 'other'].map(p => (
                              <SelectItem key={p} value={p}>
                                <div className="flex items-center">
                                  <SocialIcon platform={p} className="w-4 h-4 mr-2" />
                                  <span className="capitalize">{p === 'shop' ? 'Boutique' : p === 'website' ? 'Site Web' : p === 'other' ? 'Autre' : p}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Lien ou numéro..."
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                          className="flex-1 h-11"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSocialLink(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors h-11 w-11"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {newProfileData.social_links.length < MAX_SOCIAL_LINKS && (
                      <Button
                        variant="outline"
                        onClick={addSocialLink}
                        className="w-full border-dashed border-2 hover:border-orange-300 hover:bg-orange-50 text-gray-600 font-semibold transition-all py-6 h-12"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un réseau social
                      </Button>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-6" />

                {/* SECTION LIENS PERSONNALISÉS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Link className="w-5 h-5 text-orange-500" />
                      Liens Personnalisés
                    </h4>
                    <Badge variant="secondary" className="text-xs font-bold">{newProfileData.custom_links.length}/{MAX_CUSTOM_LINKS}</Badge>
                  </div>

                  <div className="space-y-4">
                    {newProfileData.custom_links.map((link, index) => (
                      <div key={index} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-3 animate-in slide-in-from-right-2 duration-300 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomLink(index)}
                          className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-1 gap-3">
                          <Input
                            placeholder="Titre du lien (ex: Mon Site Web)"
                            value={link.title}
                            onChange={(e) => updateCustomLink(index, 'title', e.target.value)}
                            className="h-11 font-medium"
                          />
                          <div className="flex gap-2">
                            <Select
                              value={link.type}
                              onValueChange={(val) => updateCustomLink(index, 'type', val)}
                            >
                              <SelectTrigger className="w-[120px] h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="website">Web</SelectItem>
                                <SelectItem value="shop">Boutique</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="https://..."
                              value={link.url}
                              onChange={(e) => updateCustomLink(index, 'url', e.target.value)}
                              className="flex-1 h-11"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {newProfileData.custom_links.length < MAX_CUSTOM_LINKS && (
                      <Button
                        variant="outline"
                        onClick={addCustomLink}
                        className="w-full border-dashed border-2 hover:border-orange-300 hover:bg-orange-50 text-gray-600 font-semibold transition-all py-6 h-12"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un lien personnalisé
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-100 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-orange-500" />
                  Design de votre page
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'classic', name: 'Classique', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { id: 'grid', name: 'Grille', icon: LayoutGrid, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { id: 'creative', name: 'Créatif', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
                    { id: 'showcase', name: 'Showcase', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { id: 'nature', name: 'Nature', icon: Leaf, color: 'text-green-500', bg: 'bg-green-50' },
                    { id: 'ecommerce', name: 'Boutique', icon: ShoppingBag, color: 'text-red-500', bg: 'bg-red-50' },
                    { id: 'dark', name: 'Élégant Dark', icon: Moon, color: 'text-slate-600', bg: 'bg-slate-100' },
                    { id: 'freelance', name: 'Freelance', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map((design) => (
                    <button
                      key={design.id}
                      type="button"
                      onClick={() => setNewProfileData(prev => ({ ...prev, designChoice: design.id }))}
                      className={cn(
                        "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                        newProfileData.designChoice === design.id
                          ? "border-orange-500 bg-orange-50 shadow-sm ring-2 ring-orange-500/10"
                          : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-transform", design.bg, newProfileData.designChoice === design.id && "scale-110")}>
                        <design.icon className={cn("w-5 h-5", design.color)} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight text-center">{design.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* APERÇU MOBILE - Droite */}
          <div className="lg:col-span-5 hidden lg:block sticky top-24 h-fit">
            <div className="flex flex-col items-center">
              {/* Le Mockup Smartphone */}
              <div className="relative mx-auto w-[320px] h-[650px] bg-[#0F0F0F] rounded-[3.5rem] border-[8px] border-[#1F1F1F] shadow-[0_0_60px_rgba(0,0,0,0.4)] overflow-hidden">
                {/* Speaker/Notch area */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-[#1F1F1F] rounded-b-3xl z-40 flex items-center justify-center">
                  <div className="w-12 h-1.5 bg-[#0F0F0F] rounded-full"></div>
                </div>

                {/* Écran du téléphone */}
                <div className="absolute inset-2 bg-white rounded-[2.5rem] overflow-hidden z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={newProfileData.designChoice}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="w-full h-full"
                    >
                      {renderPreview(newProfileData.designChoice)}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Réflexions sur l'écran */}
                <div className="absolute inset-0 pointer-events-none z-50">
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-[-15deg] translate-x-1/2"></div>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold shadow-sm">
                  <Eye className="w-3.5 h-3.5" />
                  Aperçu en temps réel
                </div>
                <p className="text-[10px] text-gray-500 italic max-w-xs text-center">
                  C'est ce que vos contacts verront en scannant votre carte NFC.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'action Final */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md pt-4 pb-2 border-t border-gray-100 z-50 flex gap-3">
        {onPrev && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 py-6 text-base font-bold rounded-xl px-6 transition-all hover:scale-[1.01] active:scale-[0.99]"
            size="lg"
          >
            Retour
          </Button>
        )}
        <Button
          onClick={handleAssociateProfile}
          disabled={isLoading || (selectedOption === 'existing' && !selectedProfileId) || (selectedOption === 'new' && (!newProfileData.name || !newProfileData.bio || isSlugAvailable === false))}
          className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-orange-500/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Activation en cours...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Activer ma carte</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
