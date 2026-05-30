'use client'

/**
 * ============================================
 * PAGE DE GESTION DES CHAMPS SPÉCIFIQUES
 * ============================================
 * 
 * Permet de remplir/modifier les champs spécifiques au design choisi
 * 
 * Cas d'usage :
 * - Après changement de design vers un design avec champs spécifiques
 * - Pour ajouter des liens personnalisés (E-commerce, Créatif, etc.)
 * - Pour ajouter des réseaux sociaux manquants (Influenceur, Freelance, etc.)
 */

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"
import { Label } from "@/components/core/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/core/ui/select"
import { ArrowLeft, Plus, X, Save, Info, MessageCircle, Facebook, Instagram, Twitter, Youtube, Linkedin, Globe } from 'lucide-react'
import { ProtectedRoute } from '@/components/core/auth/ProtectedRoute'
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// ============================================
// CONFIGURATION DES CHAMPS PAR DESIGN
// ============================================

const designFieldsConfig: Record<string, {
  name: string
  description: string
  supportsSocialLinks: boolean
  requiresLinks: boolean
  linkType?: 'shop' | 'website' | 'other'
}> = {
  design1: {
    name: 'Design Classique',
    description: 'Professionnel et épuré',
    supportsSocialLinks: true,
    requiresLinks: false
  },
  design2: {
    name: 'Design',
    description: 'Grille moderne',
    supportsSocialLinks: true,
    requiresLinks: false
  },
  design3: {
    name: 'Design Créatif',
    description: 'Artistique et émotionnel',
    supportsSocialLinks: true,
    requiresLinks: true
  },
  design4: {
    name: 'Design Nature',
    description: 'Minimaliste',
    supportsSocialLinks: true,
    requiresLinks: false
  },
  influencer: {
    name: 'Design Influenceur',
    description: 'Pour créateurs de contenu',
    supportsSocialLinks: true,
    requiresLinks: false
  },
  ecommerce: {
    name: 'Design E-commerce',
    description: 'Pour vendeurs en ligne',
    supportsSocialLinks: true,
    requiresLinks: true,
    linkType: 'shop'
  },
  design7: {
    name: 'Design Dark Elegant',
    description: 'Sombre et élégant',
    supportsSocialLinks: true,
    requiresLinks: false
  },
  freelance: {
    name: 'Design Freelance',
    description: 'Pour freelances',
    supportsSocialLinks: true,
    requiresLinks: false
  }
}

const socialPlatforms = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { value: 'twitter', label: 'Twitter / X', icon: Twitter, color: 'text-sky-500' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { value: 'tiktok', label: 'TikTok', icon: null, color: 'text-black' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { value: 'snapchat', label: 'Snapchat', icon: null, color: 'text-yellow-400' },
  { value: 'telegram', label: 'Telegram', icon: MessageCircle, color: 'text-blue-500' },
  { value: 'website', label: 'Site Web', icon: Globe, color: 'text-gray-600' }
]

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function DesignFieldsPage() {
  const router = useRouter()
  const params = useParams()
  const profileId = params.id as string
  const supabase = createClient()

  // États
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customLinks, setCustomLinks] = useState<any[]>([])
  const [socialLinks, setSocialLinks] = useState<any[]>([])

  // Configuration du design actuel
  const config = profile ? designFieldsConfig[profile.design_choice] : null

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

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (!profileData) {
        toast.error('Profil non trouvé')
        router.push('/dashboard/profiles')
        return
      }

      setProfile(profileData)
      setCustomLinks(profileData.custom_links || [])
      setSocialLinks(profileData.social_links || [])

    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error('Erreur lors du chargement')
      router.push('/dashboard/profiles')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // GESTION DES LIENS PERSONNALISÉS
  // ============================================

  const addCustomLink = () => {
    const linkType = config?.linkType || 'website'
    setCustomLinks([...customLinks, { title: '', url: '', type: linkType }])
  }

  const removeCustomLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index))
  }

  const updateCustomLink = (index: number, field: string, value: string) => {
    const updated = [...customLinks]
    updated[index] = { ...updated[index], [field]: value }
    setCustomLinks(updated)
  }

  // ============================================
  // SAUVEGARDE
  // ============================================

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const updates: any = {}

    // Sauvegarder les réseaux sociaux
    if (config?.supportsSocialLinks && socialLinks.length > 0) {
      // Valider que les liens sociaux sont complets
      const invalidSocialLinks = socialLinks.filter(link => !link.url)
      if (invalidSocialLinks.length > 0) {
        toast.error('Tous les réseaux sociaux doivent avoir une URL')
        return
      }
      updates.social_links = socialLinks
    }

    // Ajouter les liens personnalisés
    if (config?.requiresLinks || customLinks.length > 0) {
      // Valider que les liens requis sont remplis
      if (config?.requiresLinks && customLinks.length === 0) {
        toast.error('Au moins un lien est requis pour ce design')
        return
      }

      // Valider que les liens sont complets
      const invalidLinks = customLinks.filter(link => !link.title || !link.url)
      if (invalidLinks.length > 0) {
        toast.error('Tous les liens doivent avoir un titre et une URL')
        return
      }

      updates.custom_links = customLinks
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)

      if (error) throw error

      toast.success('Informations mises à jour avec succès !')
      router.push('/dashboard/profiles')

    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
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
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!profile || !config) {
    return null
  }

  // Vérifier si le design a des champs spécifiques
  const hasSpecificFields = config.supportsSocialLinks || config.requiresLinks

  if (!hasSpecificFields) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Aucun champ spécifique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Le design "{config.name}" n'a pas de champs spécifiques à remplir.
                  </p>
                  <Button onClick={() => router.push('/dashboard/profiles')}>
                    Retour aux profils
                  </Button>
                </CardContent>
              </Card>
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
          <div className="max-w-3xl mx-auto">

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
                Compléter les informations
              </h1>
              <p className="text-gray-600 mt-2">
                Profil : {profile.name}
              </p>
            </div>

            {/* Info du design */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Design : {config.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {config.description}. Complétez les champs ci-dessous pour optimiser votre profil.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulaire */}
            <form onSubmit={handleSave}>

              {/* Réseaux sociaux */}
              {config.supportsSocialLinks && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Réseaux sociaux (max 4)</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Ajoutez vos réseaux sociaux pour que vos contacts puissent vous suivre
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex gap-2 items-start p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Select
                            value={link.platform}
                            onValueChange={(value) => {
                              const newLinks = [...socialLinks]
                              newLinks[index] = { ...link, platform: value }
                              setSocialLinks(newLinks)
                            }}
                            disabled={saving}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir un réseau social" />
                            </SelectTrigger>
                            <SelectContent>
                              {socialPlatforms.map((platform) => {
                                const Icon = platform.icon
                                return (
                                  <SelectItem key={platform.value} value={platform.value}>
                                    <div className="flex items-center gap-2">
                                      {Icon && <Icon className={`h-4 w-4 ${platform.color}`} />}
                                      {!Icon && <div className={`h-4 w-4 ${platform.color === 'text-black' ? 'bg-black' : 'bg-yellow-400'} rounded-sm`} />}
                                      {platform.label}
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="https://exemple.com/votre-profil"
                            type="url"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...socialLinks]
                              newLinks[index] = { ...link, url: e.target.value }
                              setSocialLinks(newLinks)
                            }}
                            disabled={saving}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newLinks = socialLinks.filter((_, i) => i !== index)
                            setSocialLinks(newLinks)
                          }}
                          disabled={saving}
                          className="mt-1"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSocialLinks([...socialLinks, { platform: 'whatsapp', url: '' }])
                      }}
                      className="w-full"
                      disabled={saving || socialLinks.length >= 4}
                    >
                      <Plus className="w-4 w-4 mr-2" />
                      Ajouter un réseau social {socialLinks.length >= 4 && '(Limite atteinte)'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Liens personnalisés */}
              {(config.requiresLinks || customLinks.length > 0) && (
                <Card className="mb-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          Liens personnalisés (max 4)
                          {config.requiresLinks && <span className="text-red-500 ml-1">*</span>}
                        </CardTitle>
                        {config.linkType === 'shop' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Ajoutez vos liens de produits ou boutiques
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customLinks.map((link, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <Label>Lien #{index + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomLink(index)}
                            disabled={saving}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div>
                          <Label>Titre</Label>
                          <Input
                            placeholder={config.linkType === 'shop' ? 'Nom du produit' : 'Titre du lien'}
                            value={link.title}
                            onChange={(e) => updateCustomLink(index, 'title', e.target.value)}
                            disabled={saving}
                            required
                          />
                        </div>

                        <div>
                          <Label>URL</Label>
                          <Input
                            type="url"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => updateCustomLink(index, 'url', e.target.value)}
                            disabled={saving}
                            required
                          />
                        </div>

                        <div>
                          <Label>Type</Label>
                          <Select
                            value={link.type}
                            onValueChange={(value) => updateCustomLink(index, 'type', value)}
                            disabled={saving}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Site web</SelectItem>
                              <SelectItem value="shop">Boutique</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCustomLink}
                      className="w-full"
                      disabled={saving || customLinks.length >= 4}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un lien {customLinks.length >= 4 && '(Limite atteinte)'}
                    </Button>

                    {config.requiresLinks && customLinks.length === 0 && (
                      <p className="text-sm text-red-600">
                        ⚠️ Au moins un lien est requis pour ce design
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/profiles')}
                  disabled={saving}
                  className="flex-1"
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
