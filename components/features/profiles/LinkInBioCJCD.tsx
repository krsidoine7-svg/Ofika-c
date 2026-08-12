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

interface LinkInBioCJCDProps {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  onAddToContacts?: () => void
  isPreview?: boolean
}

export function LinkInBioCJCD({
  profile,
  showAddToContacts = false,
  onAddToContacts,
  isPreview = false
}: LinkInBioCJCDProps) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const themeSettings = profile.theme_settings || {};
  const primaryColor = themeSettings.primary_color || '#000000'; // Noir dominant
  const goldColor = themeSettings.secondary_color || '#d4af37'; // Or par défaut
  const bannerChoice = themeSettings.banner_choice || 'logo1'; // logo1, logo2, custom
  const customBannerUrl = themeSettings.custom_banner_url || '';
  const profileShape = themeSettings.profile_shape || 'rounded-full'; // rounded-full, rounded-xl, etc.
  const gradientStyle = themeSettings.gradient_style || 'none'; // linear, radial, etc.

  const getBannerUrl = () => {
    if (bannerChoice === 'custom' && customBannerUrl) {
      if (customBannerUrl.startsWith('http://') || customBannerUrl.startsWith('https://') || customBannerUrl.startsWith('/')) {
        return customBannerUrl;
      }
    }
    if (bannerChoice === 'logo2') return '/images/logo/logo design client/cjcd-rm.png';
    return '/images/logo/logo design client/cjcd-or-rm.png';
  }

  const getLinkIcon = (link: any) => {
    if (link.type === 'website') return <Globe className="w-5 h-5" style={{ color: primaryColor }} />
    if (link.type === 'shop') return <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} />
    if (link.type === 'portfolio') return <Briefcase className="w-5 h-5" style={{ color: primaryColor }} />
    if (link.type === 'appointment') return <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
    if (link.type === 'contact') return <Phone className="w-5 h-5" style={{ color: primaryColor }} />
    return <ExternalLink className="w-5 h-5" style={{ color: primaryColor }} />
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

  // Reorder based on themeSettings.link_order if it exists
  const orderedCards = themeSettings.link_order && Array.isArray(themeSettings.link_order)
    ? [...allCards].sort((a: any, b: any) => {
        const titleA = a.isCustom ? a.title : a.platform;
        const titleB = b.isCustom ? b.title : b.platform;
        const idxA = themeSettings.link_order.indexOf(titleA);
        const idxB = themeSettings.link_order.indexOf(titleB);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      })
    : allCards;

  // Background style based on gradient choice
  const backgroundStyle = gradientStyle === 'linear' 
    ? { background: `linear-gradient(to bottom, #111111, ${primaryColor})` }
    : { backgroundColor: primaryColor };

  try {
    const content = (
      <div className="flex flex-col items-center w-full min-h-full font-sans text-white relative" style={backgroundStyle}>
        
        {/* Banner Section */}
        <div className="w-full h-52 relative flex justify-center items-center overflow-hidden bg-black/50 pt-4">
          <img 
            src={getBannerUrl()} 
            alt="Banner" 
            className="w-full h-full object-cover absolute inset-0 opacity-40"
          />
          {/* Subtle gold overlay for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          <div className="z-10 text-center mt-8">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-white shadow-sm" style={{ textShadow: `0 2px 10px ${goldColor}` }}>
              {profile.name}
            </h1>
            {profile.job_title && (
              <p className="text-sm font-medium uppercase tracking-widest mt-1" style={{ color: goldColor }}>
                {profile.job_title}
              </p>
            )}
            {profile.company && (
              <p className="text-xs text-white/70 tracking-wider uppercase mt-1">
                {profile.company}
              </p>
            )}
          </div>
        </div>

        {/* Profile Picture overlapping the banner */}
        <div className="relative -mt-16 mb-4 z-20 flex flex-col items-center">
          <div className={`p-1 bg-gradient-to-br from-white to-gray-400 shadow-2xl ${profileShape}`} style={{ backgroundImage: `linear-gradient(to bottom right, ${goldColor}, #ffffff)` }}>
            {profile.image_url ? (
              <img 
                src={profile.image_url} 
                alt={profile.name} 
                className={`w-32 h-32 object-cover ${profileShape}`}
              />
            ) : (
              <div className={`w-32 h-32 bg-gray-900 flex items-center justify-center text-white text-4xl font-bold ${profileShape}`}>
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Main Body: Links Area */}
        <div className="w-full px-5 pb-12 flex flex-col gap-6 z-10">
          
          {/* Bio */}
          {profile.bio && (
            <div className="text-center bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <p className="text-sm text-white/90 leading-relaxed font-light">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Actions (Add to contacts / Exchange) */}
          {showAddToContacts && (
            <div className="flex gap-3 w-full">
              <AddToContactsAuto
                profile={profile}
                variant="auto"
                className="flex-1 rounded-xl font-bold text-sm py-6 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95 bg-[#d4af37] text-black hover:bg-[#c5a030]"
              />
              <Button
                className="flex-1 rounded-xl font-bold text-sm py-6 shadow-md transition-all active:scale-95 border-2 hover:bg-white/10"
                style={{ borderColor: goldColor, color: goldColor, backgroundColor: 'transparent' }}
                onClick={() => setIsExchangeFormOpen(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Échanger
              </Button>
            </div>
          )}

          {/* Social Icons (Horizontal Row) */}
          {activeSocialLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 py-2">
              {activeSocialLinks.map((link: any, index: number) => (
                <button
                  key={index}
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,255,255,0.1)] bg-black/40"
                  style={{ borderColor: goldColor }}
                  onClick={() => trackAndOpen(link.platform, link.url)}
                  aria-label={link.platform}
                >
                  <SocialIcon platform={link.platform} className="w-5 h-5 text-[#d4af37]" />
                </button>
              ))}
            </div>
          )}

          {/* Custom Link Cards */}
          <div className="flex flex-col gap-4 w-full">
            {orderedCards.map((link: any, index: number) => {
              const title = link.isCustom ? link.title : (link.platform === 'shop' ? 'Boutique' : link.platform === 'website' ? 'Site Web' : 'Lien');
              const desc = link.description || (link.isSpecial ? "Découvrez nos offres exclusives." : "Cliquez ici pour en savoir plus.");
              
              return (
                <button
                  key={index}
                  onClick={() => trackAndOpen(link.isCustom ? link.title : link.platform, link.url)}
                  className="group relative w-full rounded-2xl overflow-hidden shadow-lg text-left transition-all hover:scale-[1.02] active:scale-95 flex items-stretch border border-white/10"
                  style={{ backgroundColor: '#111111' }}
                >
                  {/* Left Accent Bar */}
                  <div className="w-2" style={{ backgroundColor: goldColor }} />
                  
                  {/* Content */}
                  <div className="p-4 flex-1 flex items-center">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-white/20 mr-4 group-hover:rotate-6 transition-transform"
                      style={{ backgroundColor: 'white' }}
                    >
                      {link.isSpecial ? (
                        <SocialIcon platform={link.platform} className="w-6 h-6 text-black" />
                      ) : (
                        getLinkIcon(link)
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-white font-bold text-sm tracking-wide mb-1">{title}</h3>
                      <p className="text-white/60 text-[11px] leading-snug">
                        {desc}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

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
        <div className="pb-8 text-center w-full z-10">
          <a 
            href="/onboarding/public-page" 
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <OfikaBlinkingLogo isDark={true} fontSize="text-xl" />
          </a>
          <p className="text-[10px] text-white/40 mt-2 font-light">
            Ofika © Tous droits réservés.
          </p>
        </div>
      </div>
    );

    if (isPreview) {
      return (
        <div className="w-full min-h-full flex flex-col bg-black">
          {content}
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
        <div
          className="relative bg-black shadow-2xl overflow-hidden"
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
