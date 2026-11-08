'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  ShoppingBag,
  Calendar,
  Briefcase
} from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"
import { toast } from "sonner"
import { AddToContactsAuto } from "@/components/AddToContactsAuto"
import { SocialIcon } from "@/components/ui/social-icons"
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"
import { ProfileShareButton } from "./ProfileShareButton"
import { ProfileMonogram } from "./ProfileMonogram"

interface LinkInBioEmeraudeProps {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  onAddToContacts?: () => void
  isPreview?: boolean
}

const themeColors = {
  teal: '#1f4d53',
  sand: '#f5efe6',
  tealLight: '#2a5a61',
}

export function LinkInBioEmeraude({
  profile,
  showAddToContacts = false,
  onAddToContacts,
  isPreview = false
}: LinkInBioEmeraudeProps) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const themeSettings = profile.theme_settings || {}
  const tealColor = themeSettings.primary_color || themeColors.teal
  const sandColor = themeSettings.secondary_color || themeColors.sand

  const getLinkIcon = (link: any) => {
    if (link.type === 'website') return <Globe className="w-4 h-4 text-[#1f4d53]" />
    if (link.type === 'shop') return <ShoppingBag className="w-4 h-4 text-[#1f4d53]" />
    if (link.type === 'portfolio') return <Briefcase className="w-4 h-4 text-[#1f4d53]" />
    if (link.type === 'appointment') return <Calendar className="w-4 h-4 text-[#1f4d53]" />
    if (link.type === 'contact') return <Phone className="w-4 h-4 text-[#1f4d53]" />
    return <ExternalLink className="w-4 h-4 text-[#1f4d53]" />
  }

  const activeSocialLinks = profile.social_links?.filter(
    (link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false
  ) || []

  const specialLinks = profile.social_links?.filter(
    (link: any) => ['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false
  ) || []

  const customLinks = profile.custom_links?.filter((l: any) => l.is_active !== false) || []

  const allCards = [
    ...specialLinks.map((l: any) => ({ ...l, isSpecial: true })),
    ...customLinks.map((l: any) => ({ ...l, isCustom: true }))
  ]

  const content = (
    <div className="flex flex-col items-center w-full min-h-full font-sans" style={{ backgroundColor: sandColor }}>
      {/* Header Teal Banner */}
      <div 
        className="w-full h-36 relative flex flex-row overflow-hidden border-b border-teal-900/10"
        style={{ backgroundColor: tealColor }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-white fill-none" strokeWidth="0.5">
            <path d="M 0,10 C 30,10 50,40 50,70 C 50,90 20,100 0,100" />
            <path d="M 20,0 C 40,20 60,60 40,100" />
          </svg>
        </div>
        <div className="absolute top-3 right-3 z-20">
          <ProfileShareButton
            profileName={profile.name}
            profileSlug={profile.custom_url || profile.username}
            theme="dark"
          />
        </div>
      </div>

      {/* Profile Photo & Identity */}
      <div className="relative -mt-12 mb-5 z-20 flex flex-col items-center px-5 w-full">
        <ProfileMonogram
          name={profile.name}
          imageUrl={profile.image_url}
          size="lg"
          shape="rounded-2xl"
          theme="teal"
        />

        {/* Name / Titles */}
        <div className="text-center mt-3 w-full">
          <h1 
            className="text-xl font-serif font-bold tracking-wide uppercase leading-tight"
            style={{ color: themeColors.teal }}
          >
            {profile.name}
          </h1>
          {profile.job_title && (
            <p className="text-xs font-semibold text-teal-800 tracking-wider uppercase mt-1">
              {profile.job_title}
            </p>
          )}
          {profile.company && (
            <p className="text-[11px] text-teal-700/80 tracking-widest uppercase mt-0.5">
              {profile.company}
            </p>
          )}
          {profile.location && (
            <div className="inline-flex items-center justify-center gap-1.5 text-teal-800/60 text-[11px] font-medium mt-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {/* Bio (Only if entered by user) */}
        {profile.bio && (
          <div className="mt-3 text-center bg-white/60 rounded-xl p-3.5 border border-teal-900/10 max-w-sm w-full">
            <p className="text-xs text-teal-950 leading-relaxed font-normal">
              {profile.bio}
            </p>
          </div>
        )}
      </div>

      {/* Main Actions (Add to contacts / Exchange) */}
      <div className="w-full px-5 mb-5 space-y-2.5 z-10">
        {showAddToContacts && (
          <div className="flex gap-2.5 w-full">
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="flex-1 rounded-xl font-bold text-xs py-4 transition-all active:scale-98 shadow-sm text-[#f5efe6] bg-[#1f4d53] hover:bg-[#2a5a61]"
            />
            <Button
              className="flex-1 rounded-xl font-semibold text-xs py-4 h-auto transition-all active:scale-98 border bg-transparent hover:bg-teal-900/5"
              style={{ borderColor: themeColors.teal, color: themeColors.teal }}
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Échanger
            </Button>
          </div>
        )}
      </div>

      {/* Social Network Icons */}
      {activeSocialLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2.5 px-5 mb-6 z-10">
          {activeSocialLinks.map((link: any, index: number) => (
            <button
              key={index}
              className="w-10 h-10 rounded-xl border border-teal-900/20 bg-white flex items-center justify-center hover:bg-teal-50 transition-colors shadow-sm cursor-pointer p-0"
              onClick={() => trackAndOpen(link.platform, link.url)}
              aria-label={link.platform}
            >
              <SocialIcon platform={link.platform} className="w-4 h-4 text-[#1f4d53]" />
            </button>
          ))}
        </div>
      )}

      {/* Custom Links Cards */}
      {allCards.length > 0 && (
        <div className="flex flex-col gap-2.5 w-full px-5 mb-6 z-10">
          {allCards.map((link: any, index: number) => {
            const title = link.isCustom ? link.title : (link.platform === 'shop' ? 'Boutique' : link.platform === 'website' ? 'Site Web' : 'Lien')
            const desc = link.description || (link.isSpecial ? "Découvrez nos offres exclusives." : null)
            
            return (
              <button
                key={index}
                onClick={() => trackAndOpen(link.isCustom ? link.title : link.platform, link.url)}
                className="group relative w-full rounded-xl overflow-hidden text-left transition-all hover:border-teal-700/40 active:scale-98 flex items-stretch border border-teal-900/10 bg-white shadow-sm"
              >
                <div className="w-1.5 shrink-0" style={{ backgroundColor: themeColors.teal }} />
                
                <div className="p-3.5 flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-teal-50">
                      {link.isSpecial ? (
                        <SocialIcon platform={link.platform} className="w-4 h-4 text-[#1f4d53]" />
                      ) : (
                        getLinkIcon(link)
                      )}
                    </div>
                    <div>
                      <h3 className="text-teal-950 font-semibold text-xs tracking-wide">{title}</h3>
                      {desc && (
                        <p className="text-teal-800/70 text-[10px] leading-snug mt-0.5">
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-teal-800/40" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Reviews (Hidden if empty) */}
      <div className="w-full px-5">
        <PublicReviewsSection profileId={profile.id} className="mb-4" />
      </div>

      <ContactExchangeForm
        profileId={profile.id}
        profileName={profile.name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("Coordonnées enregistrées avec succès")}
      />

      {/* Footer */}
      <div className="mt-8 pb-8 text-center w-full z-10">
        <a 
          href="/onboarding/public-page" 
          className="inline-block hover:scale-105 transition-transform duration-200"
        >
          <OfikaBlinkingLogo fontSize="text-xl" />
        </a>
      </div>
    </div>
  )

  if (isPreview) {
    return (
      <div className="w-full min-h-full flex flex-col relative overflow-y-auto custom-scrollbar" style={{ backgroundColor: themeColors.sand }}>
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div
        className="relative shadow-2xl overflow-hidden rounded-[32px] border border-teal-900/10"
        style={{
          aspectRatio: '390 / 844',
          maxWidth: '390px',
          maxHeight: '844px',
          width: '90vw',
          height: '90vh',
          backgroundColor: themeColors.sand
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative">
          {content}
        </div>
      </div>
    </div>
  )
}
