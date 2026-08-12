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

interface LinkInBioEmeraudeProps {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  onAddToContacts?: () => void
  isPreview?: boolean
}

const themeColors = {
  teal: '#1f4d53', // Dark Teal from the image
  sand: '#f5efe6', // Beige Sand from the image
  tealLight: '#2a5a61', // Slightly lighter teal for hover
}

export function LinkInBioEmeraude({
  profile,
  showAddToContacts = false,
  onAddToContacts,
  isPreview = false
}: LinkInBioEmeraudeProps) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const getLinkIcon = (link: any) => {
    if (link.type === 'website') return <Globe className="w-5 h-5 text-gray-700" />
    if (link.type === 'shop') return <ShoppingBag className="w-5 h-5 text-gray-700" />
    if (link.type === 'portfolio') return <Briefcase className="w-5 h-5 text-gray-700" />
    if (link.type === 'appointment') return <Calendar className="w-5 h-5 text-gray-700" />
    if (link.type === 'contact') return <Phone className="w-5 h-5 text-gray-700" />
    return <ExternalLink className="w-5 h-5 text-gray-700" />
  }

  const deviceDimensions = { width: 390, height: 844 }
  const deviceAspectRatio = '390 / 844'

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

  try {
    const content = (
      <div className="flex flex-col items-center w-full min-h-full font-sans" style={{ backgroundColor: themeColors.sand }}>
        
        {/* Header Section */}
        <div 
          className="w-full relative flex flex-row overflow-hidden shadow-md"
          style={{ backgroundColor: themeColors.teal, height: '240px' }}
        >
          {/* Subtle Background Graphic (Abstract 'B' or curves) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-white fill-none" strokeWidth="0.5">
              <path d="M 0,10 C 30,10 50,40 50,70 C 50,90 20,100 0,100" />
              <path d="M 20,0 C 40,20 60,60 40,100" />
            </svg>
          </div>

          {/* Left Side: Avatar */}
          <div className="w-1/2 h-full relative z-10 flex items-center justify-center p-2">
            {profile.image_url ? (
              <img 
                src={profile.image_url} 
                alt={profile.name} 
                className="w-full max-w-[170px] h-[200px] rounded-2xl object-cover border-2 border-white/60 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-white/20 flex items-center justify-center text-white text-4xl font-bold border-2 border-white/40 shadow-lg">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Right Side: Info & Socials */}
          <div className="w-1/2 h-full relative z-10 flex flex-col items-center justify-center p-3 text-center">
            
            {/* Logo / Name / Job Title */}
            <div className="mb-2">
              <h1 className="text-lg sm:text-xl font-serif font-semibold text-white tracking-wider uppercase leading-tight">
                {profile.name}
              </h1>
              {profile.job_title && (
                <p className="text-xs font-medium text-white/90 tracking-wide uppercase mt-1">
                  {profile.job_title}
                </p>
              )}
              {profile.company && (
                <p className="text-[10px] text-white/70 tracking-[0.15em] uppercase mt-0.5">
                  {profile.company}
                </p>
              )}
            </div>

            {/* Social Icons */}
            {activeSocialLinks.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                {activeSocialLinks.map((link: any, index: number) => (
                  <button
                    key={index}
                    className="w-7 h-7 rounded-md border border-white/60 flex items-center justify-center hover:bg-white/10 transition-colors"
                    onClick={() => trackAndOpen(link.platform, link.url)}
                    aria-label={link.platform}
                  >
                    <SocialIcon platform={link.platform} className="w-3.5 h-3.5 text-white" />
                  </button>
                ))}
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="text-[10px] text-white/90 leading-tight line-clamp-2">
                {profile.bio}
              </p>
            )}

          </div>
        </div>

        {/* Main Body: Links Area */}
        <div className="w-full px-4 pt-6 pb-12 flex flex-col gap-5">
          
          {/* Actions (Add to contacts / Exchange) */}
          {showAddToContacts && (
            <div className="grid grid-cols-2 gap-2 w-full mb-2">
              <AddToContactsAuto
                profile={profile}
                variant="auto"
                className="w-full rounded-lg font-bold text-[11px] px-1 shadow-md transition-transform active:scale-95 bg-[#1f4d53] text-[#f5efe6] justify-center min-w-0 overflow-hidden whitespace-normal"
              />
              <Button
                className="w-full rounded-lg font-bold text-[11px] px-1 shadow-md transition-transform active:scale-95 border-2 justify-center min-w-0 overflow-hidden whitespace-normal gap-1"
                style={{ borderColor: themeColors.teal, color: themeColors.teal, backgroundColor: 'transparent' }}
                onClick={() => setIsExchangeFormOpen(true)}
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Échanger</span>
              </Button>
            </div>
          )}

          {/* Link Cards */}
          {allCards.map((link: any, index: number) => {
            const title = link.isCustom ? link.title : (link.platform === 'shop' ? 'Boutique' : link.platform === 'website' ? 'Site Web' : 'Lien');
            const desc = link.description || (link.isSpecial ? "Découvrez nos offres exclusives." : "Cliquez ici pour en savoir plus.");
            
            return (
              <button
                key={index}
                onClick={() => trackAndOpen(link.isCustom ? link.title : link.platform, link.url)}
                className="relative w-full rounded-2xl shadow-md text-left transition-transform hover:scale-[1.02] active:scale-95 flex"
                style={{ backgroundColor: themeColors.teal }}
              >
                {/* Floating Icon on the left edge */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-100"
                >
                  {link.isSpecial ? (
                    <SocialIcon platform={link.platform} className="w-5 h-5 text-gray-700" />
                  ) : (
                    getLinkIcon(link)
                  )}
                </div>

                {/* Card Content (Text + Button) */}
                <div className="pl-8 pr-4 py-5 flex-1 flex flex-col justify-center">
                  <h3 className="text-white font-serif text-sm tracking-wide uppercase mb-1">{title}</h3>
                  <p className="text-white/80 text-[10px] leading-snug mb-3 pr-2">
                    {desc}
                  </p>
                  <div 
                    className="px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-sm inline-block w-fit"
                    style={{ backgroundColor: themeColors.sand, color: themeColors.teal }}
                  >
                    Acessar
                  </div>
                </div>
              </button>
            )
          })}

          {/* Reviews */}
          <div className="w-full mt-4">
            <PublicReviewsSection profileId={profile.id} className="mb-4" />
          </div>

        </div>

        <ContactExchangeForm
          profileId={profile.id}
          profileName={profile.name}
          isOpen={isExchangeFormOpen}
          onClose={() => setIsExchangeFormOpen(false)}
          onSuccess={() => toast.success("Envoyé !")}
        />

        {/* Footer */}
        <div className="pb-8 text-center w-full" style={{ backgroundColor: themeColors.sand }}>
          <a 
            href="/onboarding/public-page" 
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <OfikaBlinkingLogo isDark={false} fontSize="text-xl" />
          </a>
          <p className="text-[9px] text-gray-500 mt-2">
            Ofika © Tous droits réservés.
          </p>
        </div>
      </div>
    );

    if (isPreview) {
      return (
        <div className="w-full min-h-full flex flex-col bg-white">
          {content}
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
        <div
          className="relative bg-white shadow-2xl overflow-hidden"
          style={{
            aspectRatio: deviceAspectRatio,
            maxWidth: `${deviceDimensions.width}px`,
            maxHeight: `${deviceDimensions.height}px`,
            width: '90vw',
            height: '90vh'
          }}
        >
          <div className="h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide">
            {content}
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-4 text-red-500 bg-red-50 border border-red-500 w-full h-full flex items-center justify-center text-xs">
        Render Error: {error.message}
      </div>
    );
  }
}
