'use client'

import { ProfileWithLinks } from '@/lib/types/database'
import { ShoppingBag, ExternalLink, Mail, MapPin, Briefcase, Calendar, Phone, Globe } from 'lucide-react'
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

interface LinkInBioEcommerceProps {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  isPreview?: boolean
}

export function LinkInBioEcommerce({ profile, showAddToContacts, isPreview = false }: LinkInBioEcommerceProps) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)
  const { bg, accent, onAccent, isDarkBg } = getThemeColors(profile as any, { bg: '#f8fafc', accent: '#0f172a' })

  const content = (
    <div className="flex flex-col items-center w-full px-5">
      {/* Profile Header Box */}
      <div className="relative w-full -mt-12 mb-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center">
          <div className="flex justify-center mb-3">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100">
              {profile.image_url ? (
                <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="text-center w-full">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              {profile.name}
            </h1>
            {profile.bio && (
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 px-2 line-clamp-3">
                {profile.bio}
              </p>
            )}
            {profile.location && (
              <div className="inline-flex items-center justify-center gap-1.5 text-slate-500 text-[11px] font-semibold mt-2.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Network Icons */}
      {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform)).length > 0 && (
        <div className="flex flex-wrap justify-center gap-2.5 mb-5">
          {profile.social_links
            .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform))
            .map((link: any, index: number) => (
              <button
                key={index}
                className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer p-0"
                onClick={() => trackAndOpen(link.platform, link.url)}
                aria-label={link.platform}
              >
                <SocialIcon platform={link.platform} className="w-4 h-4 text-slate-800" />
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
              className="w-full hover:opacity-90 font-bold py-4 rounded-xl transform active:scale-98 transition-all shadow-sm"
              style={{ backgroundColor: accent, color: onAccent }}
            />
            <Button
              variant="outline"
              className="w-full border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 font-semibold py-4 h-auto rounded-xl text-xs transform active:scale-98 transition-all"
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
            const labels: any = { shop: 'Visiter la Boutique', website: 'Consulter le Site Web', other: 'Autre lien' }
            return (
              <Button
                key={`special-${index}`}
                className="w-full hover:opacity-90 font-medium py-3.5 h-auto rounded-xl shadow-sm border-none transform active:scale-98 flex items-center justify-between px-4 text-xs"
                style={{ backgroundColor: accent, color: onAccent }}
                onClick={() => trackAndOpen(link.platform, link.url)}
              >
                <div className="flex items-center gap-2.5">
                  <SocialIcon platform={link.platform} className="w-4 h-4 text-white" />
                  <span>{labels[link.platform] || link.platform}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
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
              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 hover:border-slate-400 transition-all cursor-pointer text-left shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  {link.type === 'portfolio' && <Briefcase className="w-4 h-4" />}
                  {link.type === 'appointment' && <Calendar className="w-4 h-4" />}
                  {link.type === 'contact' && <Phone className="w-4 h-4" />}
                  {link.type === 'website' && <Globe className="w-4 h-4" />}
                  {link.type === 'shop' && <ShoppingBag className="w-4 h-4" />}
                  {!['portfolio', 'appointment', 'contact', 'website', 'shop'].includes(link.type) && <ExternalLink className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">{link.title}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    {link.type === 'shop' ? 'Boutique' : link.type || 'Lien'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      )}

      {/* Reviews Section */}
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

      {/* Footer */}
      <div className="mt-8 pb-8 text-center w-full">
        <a 
          href="/onboarding/public-page" 
          className="inline-block hover:scale-105 transition-transform duration-200"
        >
          <OfikaBlinkingLogo fontSize="text-xl" isDark={isDarkBg} />
        </a>
      </div>
    </div>
  )

  const header = profile.cover_image_url ? (
    <div className="relative h-40 overflow-hidden border-b border-slate-200">
      <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
    </div>
  ) : (
    <div className="relative h-24 border-b border-slate-200" style={{ background: `linear-gradient(135deg, ${accent}33, ${bg})` }} />
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div
        className="relative shadow-xl overflow-hidden rounded-[32px] border border-slate-200/90"
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
