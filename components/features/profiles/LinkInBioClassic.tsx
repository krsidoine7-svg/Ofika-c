'use client'

import { Card, CardContent } from "@/components/core/ui/card"
import { Button } from "@/components/core/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/ui/avatar"
import {
  Phone,
  MapPin,
  Globe,
  Download,
  ExternalLink,
  Play,
  Image as ImageIcon,
  ShoppingBag,
  Mail,
  Briefcase,
  Calendar
} from "lucide-react"
import { AddToContactsAuto } from "@/components/AddToContactsAuto"
import { ProfileWithLinks } from "@/lib/types/database"
import { SocialIcon } from "@/components/core/ui/social-icons"
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { toast } from "sonner"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"

interface LinkInBioClassicProps {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
}

export function LinkInBioClassic({
  profile,
  showAddToContacts = false
}: LinkInBioClassicProps) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const getLinkIcon = (link: any) => {
    if (link.type === 'website') return <Globe className="h-5 w-5 text-blue-600" />
    if (link.type === 'shop') return <ShoppingBag className="h-5 w-5 text-orange-600" />
    if (link.type === 'portfolio') return <Briefcase className="h-5 w-5 text-blue-700" />
    if (link.type === 'appointment') return <Calendar className="h-5 w-5 text-green-600" />
    if (link.type === 'contact') return <Phone className="h-5 w-5 text-red-600" />
    if (link.type === 'video') return <Play className="h-5 w-5 text-red-600" />
    if (link.type === 'image') return <ImageIcon className="h-5 w-5 text-purple-600" />
    return <ExternalLink className="h-5 w-5 text-gray-600" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-8 max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="p-8">

            {/* Header avec photo et infos */}
            <div className="text-center mb-8">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={profile.image_url} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.name}
              </h1>

              {profile.bio && (
                <p className="text-gray-700 mb-4">
                  {profile.bio}
                </p>
              )}

              {/* Localisation */}
              {profile.location && (
                <div className="flex items-center justify-center text-gray-500 mb-6 text-sm">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {profile.location}
                </div>
              )}

              {/* Boutons Actions */}
              {/* Social Icons (Standard) - Moved Above Actions */}
              {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false).length > 0 && (
                <div className="flex justify-center gap-4 mb-6">
                  {profile.social_links
                    .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
                    .map((link, index) => (
                      <button
                        key={index}
                        onClick={() => trackAndOpen(link.platform, link.url)}
                        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border border-gray-100 p-0"
                      >
                        <SocialIcon platform={link.platform} className="w-5 h-5" />
                      </button>
                    ))}
                </div>
              )}

              {/* Boutons Actions */}
              <div className="mb-6 space-y-3">
                {showAddToContacts && (
                  <>
                    <AddToContactsAuto
                      profile={profile}
                      variant="auto"
                      className="w-full shadow-md"
                    />

                    <Button
                      variant="outline"
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 h-11"
                      onClick={() => setIsExchangeFormOpen(true)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Echanger des contacts
                    </Button>
                  </>
                )}

                {/* Primary Social Buttons (Shop, Website, Other) */}
                {profile.social_links
                  ?.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
                  .map((link: any, index: number) => {
                    const labels: any = { shop: 'Ma Boutique', website: 'Mon Site Web', other: 'Autre lien' };
                    return (
                      <Button
                        key={`special-${index}`}
                        className="w-full bg-gray-900 text-white h-11 hover:bg-gray-800 transition-all font-semibold"
                        onClick={() => trackAndOpen(link.platform, link.url)}
                      >
                        <div className="flex items-center justify-between w-full px-2">
                          <SocialIcon platform={link.platform} className="w-4 h-4 text-white" />
                          <span>{labels[link.platform] || link.platform}</span>
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </div>

            {/* Informations de contact (si autres que boutons) */}
            <div className="space-y-3 mb-8">
              {profile.phone && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 text-left"
                  onClick={() => trackAndOpen('phone', `tel:${profile.phone}`)}
                >
                  <Phone className="h-5 w-5 mr-3 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">Téléphone</div>
                    <div className="text-sm text-gray-500">{profile.phone}</div>
                  </div>
                </Button>
              )}
            </div>

            <ContactExchangeForm
              profileId={profile.id}
              profileName={profile.name}
              isOpen={isExchangeFormOpen}
              onClose={() => setIsExchangeFormOpen(false)}
              onSuccess={() => {
                toast.success("Merci ! Vos coordonnées ont été envoyées.")
                setTimeout(() => {
                  toast("Téléchargement de ma carte de visite...", { description: "Échange de contact réussi !" })
                  const downloadVCard = async () => {
                    try {
                      const response = await fetch(`${window.location.origin}/api/contacts/${profile.id}`)
                      if (!response.ok) return
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${profile.name.replace(/\s+/g, '_')}.vcf`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (e) {
                      console.error("Erreur download auto", e)
                    }
                  }
                  downloadVCard()
                }, 1000)
              }}
            />

            {/* Informations de contact (si autres que boutons) */}

            {/* Liens personnalisés */}
            {profile.links && profile.links.filter((l: any) => l.is_active !== false).length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Mes liens</h3>
                <div className="space-y-3">
                  {profile.links.filter((l: any) => l.is_active !== false).map((link, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-12 text-left"
                      onClick={() => trackAndOpen(link.title, link.url)}
                    >
                      {getLinkIcon(link)}
                      <div className="flex-1 ml-3">
                        <div className="font-medium">{link.title}</div>
                        <div className="text-sm text-gray-500 truncate">{link.url}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Avis Clients */}
            <PublicReviewsSection profileId={profile.id} className="mb-8" />

            {/* Footer */}
            <div className="text-center pt-8 border-t border-gray-100">
              <a 
                href="/onboarding/public-page" 
                className="inline-block hover:scale-110 transition-transform duration-300"
              >
                <OfikaBlinkingLogo fontSize="text-2xl" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
