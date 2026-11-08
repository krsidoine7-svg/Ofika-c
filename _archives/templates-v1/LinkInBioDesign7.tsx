'use client'

import { ProfileWithLinks } from '@/lib/types/database'
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
  Mail,
  Phone,
  MapPin,
  Music,
  ExternalLink,
  Briefcase,
  Calendar,
  ShoppingBag,
  MessageCircle
} from 'lucide-react'
import { AddToContactsAuto } from '@/components/AddToContactsAuto'
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"
import { SocialIcon } from "@/components/ui/social-icons"
import { ProfileShareButton } from "./ProfileShareButton"
import { ProfileMonogram } from "./ProfileMonogram"
import { FeaturedLinksList } from "./FeaturedLinksList"

interface LinkInBioDesign7Props {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  isPreview?: boolean
}

export function LinkInBioDesign7({ profile, showAddToContacts, isPreview = false }: LinkInBioDesign7Props) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const themeSettings = profile.theme_settings || {}
  const primaryBg = themeSettings.primary_color || '#09090b'
  const accentColor = themeSettings.secondary_color || '#a855f7'

  const socialIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    linkedin: Linkedin,
    tiktok: Music,
    whatsapp: MessageCircle,
    website: Globe
  }

  const allSocialLinks = (profile.social_links || []).filter(link => link.url)
  const iconLinks = allSocialLinks.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform))
  const buttonLinks = allSocialLinks.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform))

  const content = (
    <div className="flex flex-col items-center w-full px-5">
      {/* Profile Photo / Luxury Monogram */}
      <div className="flex justify-center -mt-12 mb-4 relative z-10">
        <ProfileMonogram
          name={profile.name}
          imageUrl={profile.image_url}
          size="lg"
          shape="rounded-2xl"
          theme="dark"
          customBorderColor={accentColor}
        />
      </div>

      {/* Identity */}
      <div className="text-center mb-6 w-full">
        <h1 className="text-xl font-bold mb-1 tracking-tight text-white">{profile.name}</h1>
        {profile.bio && (
          <p className="text-xs text-neutral-400 font-medium tracking-wide mb-3 px-2 line-clamp-3 leading-relaxed">
            {profile.bio}
          </p>
        )}
        {profile.location && (
          <div className="inline-flex items-center justify-center gap-1.5 text-neutral-500 text-[11px] font-medium tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span>{profile.location}</span>
          </div>
        )}
      </div>

      {/* Social Network Icons */}
      {iconLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2.5 mb-6">
          {iconLinks.map((social, index) => {
            const Icon = socialIcons[social.platform] || Globe
            return (
              <button
                key={`${social.platform}-${index}`}
                onClick={() => trackAndOpen(social.platform, social.url)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#18181b] border border-white/10 text-neutral-300 hover:text-white hover:border-white/30 hover:bg-[#222227] transition-all cursor-pointer p-0"
                aria-label={social.platform}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full mb-6 space-y-2.5">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-white text-black hover:bg-neutral-100 font-bold py-4 rounded-xl transform active:scale-98 transition-all shadow-md"
            />
            <Button
              variant="outline"
              className="w-full bg-[#18181b] border border-white/15 text-white hover:bg-[#24242a] hover:text-white py-4 h-auto rounded-xl font-semibold text-xs tracking-wide transform active:scale-98 transition-all"
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Échanger les coordonnées
            </Button>
          </>
        )}

        {/* Special Links */}
        {buttonLinks.map((link: any, index: number) => {
          const labels: any = { shop: 'Ma Boutique', website: 'Mon Site Web', other: 'Autre lien' }
          return (
            <Button
              key={`special-${index}`}
              className="w-full bg-[#18181b] text-white font-medium py-3.5 h-auto rounded-xl text-xs border border-white/10 hover:border-white/30 hover:bg-[#222227] transition-all flex items-center justify-between px-4 transform active:scale-98"
              onClick={() => trackAndOpen(link.platform, link.url)}
            >
              <div className="flex items-center gap-2.5">
                <SocialIcon platform={link.platform} className="w-4 h-4 text-white" />
                <span>{labels[link.platform] || link.platform}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </Button>
          )
        })}
      </div>

      {/* Featured & Custom Links */}
      {(profile.custom_links || []).length > 0 && (
        <div className="w-full mb-6">
          <FeaturedLinksList
            links={profile.custom_links || []}
            onLinkClick={(title, url) => trackAndOpen(title, url)}
            theme="dark"
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Public Reviews */}
      <div className="w-full">
        <PublicReviewsSection profileId={profile.id} className="mb-6" />
      </div>

      {/* Exchange Contact Modal */}
      <ContactExchangeForm
        profileId={profile.id}
        profileName={profile.name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("Coordonnées enregistrées avec succès")}
      />

      {/* Ofika Blinking Logo Footer */}
      <div className="mt-8 pb-8 text-center w-full">
        <a 
          href="/onboarding/public-page" 
          className="inline-block hover:scale-105 transition-transform duration-200"
        >
          <OfikaBlinkingLogo fontSize="text-xl" color="text-white" />
        </a>
      </div>
    </div>
  )

  const header = (
    <div className={`relative ${profile.cover_image_url ? 'h-40' : 'h-24 bg-[#121217]'} overflow-hidden border-b border-white/10`}>
      {profile.cover_image_url && (
        <img
          src={profile.cover_image_url}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute top-3.5 right-3.5 z-20">
        <ProfileShareButton
          profileName={profile.name}
          profileSlug={profile.custom_url || profile.username}
          theme="dark"
        />
      </div>
    </div>
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
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
      <div
        className="relative bg-[#0d0d11] shadow-2xl overflow-hidden rounded-[32px] border border-white/10"
        style={{
          aspectRatio: '390 / 844',
          maxWidth: '390px',
          maxHeight: '844px',
          width: '90vw',
          height: '90vh'
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative">
          {header}
          <div className="relative z-10">{content}</div>
        </div>
      </div>
    </div>
  )
}
