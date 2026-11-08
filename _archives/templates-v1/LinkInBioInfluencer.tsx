'use client'

import { ProfileWithLinks } from '@/lib/types/database'
import { ExternalLink, Mail, MapPin, Briefcase, Calendar, ShoppingBag, Phone, Globe } from 'lucide-react'
import { AddToContactsAuto } from '@/components/AddToContactsAuto'
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { SocialIcon } from "@/components/ui/social-icons"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"
import { getThemeColors } from "@/lib/utils/theme-colors"

interface LinkInBioInfluencerProps {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  isPreview?: boolean
}

export function LinkInBioInfluencer({ profile, showAddToContacts, isPreview = false }: LinkInBioInfluencerProps) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)
  const { bg, accent, onBg, onBgMuted, onAccent, isDarkBg } = getThemeColors(profile as any, { bg: '#0a0a0a', accent: '#f97316' })

  const content = (
    <div className="flex flex-col items-center w-full px-5">
      {/* Profile Header */}
      <div className="relative w-full -mt-12 mb-5">
        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-3">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-neutral-900">
              {profile.image_url ? (
                <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="text-center w-full">
            <h1 className="text-xl font-bold tracking-tight mb-1" style={{ color: onBg }}>
              {profile.name}
            </h1>
            {profile.bio && (
              <p className="text-xs font-medium leading-relaxed mb-2 px-2 line-clamp-3" style={{ color: onBgMuted }}>
                {profile.bio}
              </p>
            )}
            {profile.location && (
              <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-medium" style={{ color: onBgMuted }}>
                <MapPin className="w-3.5 h-3.5" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Icons */}
      {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform)).length > 0 && (
        <div className="flex flex-wrap justify-center gap-2.5 mb-6">
          {profile.social_links
            .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform))
            .map((link: any, index: number) => (
              <button
                key={index}
                onClick={() => trackAndOpen(link.platform, link.url)}
                className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center transition-all border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 cursor-pointer p-0 shadow-sm"
                aria-label={link.platform}
              >
                <SocialIcon platform={link.platform} className="w-5 h-5" />
              </button>
            ))}
        </div>
      )}

      {/* Primary Actions */}
      <div className="w-full mb-6 space-y-2.5">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full hover:opacity-90 font-bold py-4 rounded-xl transform active:scale-98 transition-all shadow-md"
              style={{ backgroundColor: accent, color: onAccent }}
            />
            <Button
              variant="outline"
              className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white hover:bg-neutral-800 py-4 h-auto rounded-xl font-semibold text-xs tracking-wide transform active:scale-98 transition-all"
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Échanger les coordonnées
            </Button>
          </>
        )}

        {/* Special Links as primary buttons */}
        {profile.social_links
          ?.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform))
          .map((link: any, index: number) => {
            const labels: any = { shop: 'Ma Boutique', website: 'Mon Site Web', other: 'Autre lien' }
            return (
              <Button
                key={`special-${index}`}
                className="w-full bg-neutral-900 text-white font-medium py-3.5 h-auto rounded-xl border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 transition-all flex items-center justify-between px-4 transform active:scale-98 shadow-sm text-xs"
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

      {/* Custom Links */}
      {(profile.custom_links || []).length > 0 && (
        <div className="w-full space-y-2.5 mb-6">
          {(profile.custom_links || []).map((link: any, index: number) => (
            <button
              key={index}
              onClick={() => trackAndOpen(link.title, link.url)}
              className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl py-3.5 px-4 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="text-neutral-400">
                  {link.type === 'portfolio' && <Briefcase className="w-4 h-4" />}
                  {link.type === 'appointment' && <Calendar className="w-4 h-4" />}
                  {link.type === 'contact' && <Phone className="w-4 h-4" />}
                  {link.type === 'website' && <Globe className="w-4 h-4" />}
                  {link.type === 'shop' && <ShoppingBag className="w-4 h-4" />}
                  {!['portfolio', 'appointment', 'contact', 'website', 'shop'].includes(link.type) && <ExternalLink className="w-4 h-4" />}
                </div>
                <span className="font-semibold text-white text-xs">{link.title}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          ))}
        </div>
      )}

      {/* Reviews Section */}
      <div className="w-full">
        <PublicReviewsSection profileId={profile.id} className="mb-6" />
      </div>

      {/* Exchange Modal */}
      <ContactExchangeForm
        profileId={profile.id}
        profileName={profile.name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("Coordonnées enregistrées avec succès")}
      />

      {/* Footer */}
      <div className="mt-8 pb-8 text-center w-full">
        <a
          href="/onboarding/public-page"
          className="inline-block hover:scale-105 transition-transform duration-200"
        >
          <OfikaBlinkingLogo fontSize="text-xl" color={isDarkBg ? "text-white" : "text-gray-900"} />
        </a>
      </div>
    </div>
  )

  const header = profile.cover_image_url ? (
    <div className="relative h-40 overflow-hidden border-b border-neutral-800">
      <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
    </div>
  ) : (
    <div className="relative h-24 border-b border-neutral-800" style={{ background: `linear-gradient(135deg, ${accent}66, ${bg})` }} />
  )

  if (isPreview) {
    return (
      <div className="h-full relative overflow-y-auto custom-scrollbar" style={{ backgroundColor: bg }}>
        {header}
        <div className="relative z-10">{content}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4" style={{ backgroundColor: bg }}>
      <div
        className="relative shadow-2xl overflow-hidden rounded-[32px] border border-neutral-800"
        style={{
          backgroundColor: bg,
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
