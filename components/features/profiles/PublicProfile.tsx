"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Button } from "@/components/core/ui/button"
import { Badge } from "@/components/core/ui/badge"
import { ExternalLink, User, Mail, Phone, MapPin, Calendar, Share2, Globe, ShoppingBag, Link as LinkIcon, UserPlus } from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"
import { AddToContactsUnified } from "@/components/AddToContactsUnified"
import { ContactQRCode } from "@/components/ContactQRCode"
import { SocialIcon, getSocialColor } from "@/components/core/ui/social-icons"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useProfileAnalytics } from "@/lib/hooks/useProfileAnalytics"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"

interface PublicProfileProps {
  profile: ProfileWithLinks
}

export function PublicProfile({ profile }: PublicProfileProps) {
  const supabase = createClient()
  const { trackClick, trackContact } = useProfileAnalytics(profile.id)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const handleLinkClick = async (linkId: string, url: string) => {
    try {
      // Enregistrer le clic avec le nouveau service
      await trackClick(linkId, url)

      // Incrémenter le compteur
      // Incrémenter le compteur sans utiliser supabase.raw (non supporté)
      // On récupère d'abord la valeur actuelle, puis on incrémente côté client
      const { data: linkData, error: fetchError } = await supabase
        .from('links')
        .select('click_count')
        .eq('id', linkId)
        .single()

      if (!fetchError && linkData) {
        const newCount = (linkData.click_count || 0) + 1
        await supabase
          .from('links')
          .update({ click_count: newCount })
          .eq('id', linkId)
      }

      // Ouvrir le lien
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error tracking link click:', error)
      // Ouvrir le lien même en cas d'erreur
      window.open(url, '_blank')
    }
  }


  const getProfileTypeLabel = (type: string) => {
    switch (type) {
      case 'professional':
        return 'Professionnel'
      case 'personal':
        return 'Personnel'
      case 'event':
        return 'Événement'
      default:
        return type
    }
  }

  const getProfileTypeColor = (type: string) => {
    switch (type) {
      case 'professional':
        return 'bg-blue-100 text-blue-800'
      case 'personal':
        return 'bg-green-100 text-green-800'
      case 'event':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlatformLabel = (platform: string) => {
    const labels: Record<string, string> = {
      whatsapp: 'WhatsApp',
      facebook: 'Facebook',
      instagram: 'Instagram',
      twitter: 'Twitter / X',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      linkedin: 'LinkedIn',
      snapchat: 'Snapchat',
      telegram: 'Telegram',
      website: 'Site Web'
    }
    return labels[platform] || platform
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header du profil */}
        <Card className="mb-6 shadow-xl">
          <CardHeader className="text-center pb-4">
            {profile.image_url && (
              <div className="mx-auto mb-4">
                <img
                  src={profile.image_url}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                />
              </div>
            )}
            <CardTitle className="text-3xl font-bold text-gray-900">
              {profile.name}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {profile.bio || 'Aucune description disponible'}
            </CardDescription>
            <Badge className={`mx-auto ${getProfileTypeColor(profile.profile_type)}`}>
              {getProfileTypeLabel(profile.profile_type)}
            </Badge>
          </CardHeader>
        </Card>

        {/* Bloc unifié : Ajouter aux contacts + Réseaux sociaux + Liens personnalisés */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">Contact & Réseaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Section Ajouter aux contacts & Actions Primaires */}
            <div className="pb-4 border-b space-y-3">
              {/* Social Icons (Standard) - MOVED ABOVE CONTACT BUTTON */}
              {(profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false).length > 0) && (
                <div className="flex justify-center gap-4 mb-4 flex-wrap">
                  {profile.social_links
                    .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
                    .map((link, index) => (
                      <button
                        key={index}
                        onClick={() => trackAndOpen(link.platform, link.url)}
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:scale-110 transition-all cursor-pointer p-0"
                      >
                        <SocialIcon platform={link.platform} className="h-5 w-5" />
                      </button>
                    ))}
                </div>
              )}

              <AddToContactsUnified
                profile={profile}
                variant="card"
                showQRCode={true}
              />

              {/* Boutique, Site Web, Autre as Primary Buttons */}
              {profile.social_links
                ?.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
                .map((link: any, index: number) => (
                  <Button
                    key={`special-${index}`}
                    className="w-full bg-gray-900 text-white h-12 hover:bg-gray-800 transition-all font-bold"
                    onClick={() => trackAndOpen(link.platform, link.url)}
                  >
                    <div className="flex items-center justify-between w-full px-4">
                      <SocialIcon platform={link.platform} className="h-5 w-5 mr-3 text-white" />
                      <span>{getPlatformLabel(link.platform)}</span>
                      <ExternalLink className="h-4 w-4 opacity-50" />
                    </div>
                  </Button>
                ))}
            </div>

            {/* Boutons de contact direct */}
            {(profile.email || profile.phone) && (
              <div className="grid grid-cols-2 gap-2 pb-4 border-b">
                {profile.email && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const subject = `Contact depuis le profil ${profile.name}`
                      const body = `Bonjour,\n\nJe vous contacte depuis votre profil Ofika.\n\nCordialement`
                      trackAndOpen('email', `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}
                {profile.phone && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      trackAndOpen('phone', `tel:${profile.phone}`)
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Téléphone
                  </Button>
                )}
              </div>
            )}

            {/* Section Liens personnalisés */}
            {profile.custom_links && profile.custom_links.filter((l: any) => l.is_active !== false).length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-gray-900 text-center">Liens Personnalisés</h4>
                {profile.custom_links.filter((l: any) => l.is_active !== false).map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-12 text-left"
                    onClick={() => trackAndOpen(link.title, link.url)}
                  >
                    {link.type === 'website' && <Globe className="h-5 w-5 mr-3" />}
                    {link.type === 'shop' && <ShoppingBag className="h-5 w-5 mr-3" />}
                    {link.type === 'other' && <LinkIcon className="h-5 w-5 mr-3" />}
                    <div className="flex-1">
                      <div className="font-medium">{link.title}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {link.url}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liens */}
        {profile.links && profile.links.filter((l: any) => l.is_active !== false).length > 0 && (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center">Liens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.links.filter((l: any) => l.is_active !== false).map((link) => (
                <Button
                  key={link.id}
                  variant="outline"
                  className="w-full justify-start h-12 text-left"
                  onClick={() => handleLinkClick(link.id, link.url)}
                >
                  <ExternalLink className="h-4 w-4 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium">{link.title}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {link.url}
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Bouton d'appel à l'action */}
        <Card className="shadow-lg border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Créé par <span className="text-orange-600">Ofika</span>
              </h3>
              <p className="text-gray-600 mb-4">
                Partagez vos contacts instantanément
              </p>
            </div>

            <Button
              onClick={() => window.open('/auth/signup', '_blank')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Créer ma page de contact
            </Button>

            <p className="text-sm text-gray-500 mt-3">
              Rejoignez des milliers d'utilisateurs qui partagent leurs contacts facilement
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
