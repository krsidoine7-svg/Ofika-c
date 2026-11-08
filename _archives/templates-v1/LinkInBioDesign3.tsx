'use client'

import {
  Instagram,
  Globe,
  ExternalLink,
  Facebook,
  Twitter,
  MessageCircle,
  Play,
  Music,
  ShoppingBag,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Phone
} from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"
import { AddToContactsAuto } from "@/components/AddToContactsAuto"
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SocialIcon } from "@/components/ui/social-icons"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"
import { ProfileShareButton } from "./ProfileShareButton"
import { ProfileMonogram } from "./ProfileMonogram"
import { FeaturedLinksList } from "./FeaturedLinksList"

interface LinkInBioDesign3Props {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  onAddToContacts?: () => void
  isPreview?: boolean
}

export function LinkInBioDesign3({
  profile,
  showAddToContacts = false,
  onAddToContacts,
  isPreview = false
}: LinkInBioDesign3Props) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const themeSettings = profile.theme_settings || {}
  const primaryBg = themeSettings.primary_color || '#fffbeb'
  const accentColor = themeSettings.secondary_color || '#ea580c'

  const platformConfig: Record<string, { icon: any, color: string }> = {
    instagram: { icon: Instagram, color: 'bg-black' },
    facebook: { icon: Facebook, color: 'bg-[#1877F2]' },
    twitter: { icon: Twitter, color: 'bg-[#1DA1F2]' },
    youtube: { icon: Play, color: 'bg-[#FF0000]' },
    tiktok: { icon: Music, color: 'bg-black' },
    linkedin: { icon: Globe, color: 'bg-[#0A66C2]' },
    whatsapp: { icon: MessageCircle, color: 'bg-[#25D366]' },
    website: { icon: Globe, color: 'bg-slate-800' }
  }

  const allSocialLinks = (profile.social_links || []).filter(link => link.url)
  const iconLinks = allSocialLinks.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform))
  const buttonSocialLinks = allSocialLinks.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform))

  const content = (
    <div className="flex flex-col items-center w-full px-5">
      {/* Header Profile Photo */}
      <div className="relative mb-5 flex flex-col items-center w-full pt-4">
        {/* Share Button */}
        <div className="absolute top-2 right-2 z-20">
          <ProfileShareButton
            profileName={profile.name}
            profileSlug={profile.custom_url || profile.username}
            theme="light"
          />
        </div>

        <div className="relative mb-3">
          <ProfileMonogram
            name={profile.name}
            imageUrl={profile.image_url}
            size="lg"
            shape="rounded-2xl"
            theme="light"
            customBgColor={accentColor}
            customTextColor="#ffffff"
            customBorderColor="#000000"
          />
        </div>

        {/* Name & Bio */}
        <div className="text-center w-full">
          <h1 className="text-2xl font-black text-black mb-1 tracking-tight">
            {profile.name}
          </h1>
          {profile.bio && (
            <p className="text-xs font-semibold text-neutral-700 mb-2 leading-relaxed px-4 line-clamp-3">
              {profile.bio}
            </p>
          )}
          {profile.location && (
            <div className="inline-flex items-center justify-center gap-1.5 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-black" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Social Network Icons */}
      {iconLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2.5 mb-6">
          {iconLinks.map((social, index) => {
            const config = platformConfig[social.platform] || { icon: Globe, color: 'bg-black' }
            const Icon = config.icon
            return (
              <button
                key={index}
                onClick={() => trackAndOpen(social.platform, social.url)}
                className="w-10 h-10 rounded-xl bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer p-0"
                aria-label={social.platform}
              >
                <div className={`w-5 h-5 rounded-md ${config.color} flex items-center justify-center text-white`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Main Actions */}
      <div className="w-full space-y-3 mb-6">
        {showAddToContacts && (
          <div className="space-y-2.5">
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-black text-white rounded-xl py-4 font-bold text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:scale-98"
            />
            <Button
              variant="outline"
              className="w-full border-2 border-black bg-white text-black py-4 h-auto rounded-xl font-bold text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:scale-98"
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Échanger les coordonnées
            </Button>
          </div>
        )}

        {/* Boutique, Site Web as Primary Buttons */}
        {buttonSocialLinks.map((link: any, index: number) => {
          const labels: any = { shop: 'Ma Boutique', website: 'Mon Site Web', other: 'Mon Lien' }
          return (
            <Button
              key={`special-${index}`}
              className="w-full py-3.5 h-auto rounded-xl font-bold text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black bg-white text-black hover:bg-neutral-50 hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:scale-98 flex items-center justify-between px-4"
              onClick={() => trackAndOpen(link.platform, link.url)}
            >
              <div className="flex items-center gap-2.5">
                <SocialIcon platform={link.platform} className="w-4 h-4 text-black" />
                <span>{labels[link.platform] || link.platform}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </Button>
          )
        })}
      </div>

      {/* Featured & Custom Links */}
      {(profile.custom_links || []).filter((l: any) => l.is_active !== false).length > 0 && (
        <div className="w-full mb-6">
          <FeaturedLinksList
            links={profile.custom_links}
            onLinkClick={(title, url) => trackAndOpen(title, url)}
            theme="light"
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Public Reviews */}
      <div className="w-full mb-6">
        <PublicReviewsSection profileId={profile.id} className="w-full" />
      </div>

      <ContactExchangeForm
        profileId={profile.id}
        profileName={profile.name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("Coordonnées enregistrées avec succès")}
      />

      {/* Footer Branding */}
      <div className="mt-8 pb-8 text-center w-full">
        <a 
          href="/onboarding/public-page" 
          className="inline-block hover:scale-105 transition-transform duration-200"
        >
          <OfikaBlinkingLogo fontSize="text-xl" />
        </a>
      </div>
    </div>
  )

  const header = profile.cover_image_url ? (
    <div className="relative h-40 overflow-hidden border-b-2 border-black">
      <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
    </div>
  ) : (
    <div className="relative h-20 border-b-2 border-black" style={{ backgroundColor: accentColor, opacity: 0.2 }} />
  )

  if (isPreview) {
    return (
      <div className="h-full relative overflow-y-auto custom-scrollbar" style={{ backgroundColor: primaryBg }}>
        {header}
        <div className="relative z-10">{content}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center p-4">
      <div
        className="relative bg-[#fdfdfd] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden rounded-[32px]"
        style={{
          aspectRatio: '390 / 844',
          maxWidth: '390px',
          maxHeight: '844px',
          width: '90vw',
          height: '90vh'
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative bg-[#fdfdfd]">
          {header}
          <div className="relative z-10">{content}</div>
        </div>
      </div>
    </div>
  )
}
