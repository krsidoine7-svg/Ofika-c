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
import { getThemeColors } from "@/lib/utils/theme-colors"

interface LinkInBioPrestigeProps {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  onAddToContacts?: () => void
  isPreview?: boolean
}

/**
 * Template "Prestige" : fond sombre élégant + couleur d'accent (Or par défaut).
 * Entièrement personnalisable via profile.theme_settings (fond, accent, ordre des liens).
 * Remplace l'ancien template réservé au client CJCD.
 */
export function LinkInBioPrestige({
  profile,
  showAddToContacts = false,
  isPreview = false
}: LinkInBioPrestigeProps) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const themeSettings = (profile as any).theme_settings || {}
  const { bg, accent, onBg, onBgMuted, onAccent, isDarkBg } = getThemeColors(profile as any, {
    bg: '#09090b',
    accent: '#d4af37'
  })

  // Surfaces (cartes, icônes) légèrement contrastées par rapport au fond
  const surface = isDarkBg ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const surfaceBorder = isDarkBg ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'

  const getLinkIcon = (link: any) => {
    const cls = "w-4 h-4"
    if (link.type === 'website') return <Globe className={cls} />
    if (link.type === 'shop') return <ShoppingBag className={cls} />
    if (link.type === 'portfolio') return <Briefcase className={cls} />
    if (link.type === 'appointment') return <Calendar className={cls} />
    if (link.type === 'contact') return <Phone className={cls} />
    return <ExternalLink className={cls} />
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

  const orderedCards = Array.isArray(themeSettings.link_order) && themeSettings.link_order.length > 0
    ? [...allCards].sort((a: any, b: any) => {
        const keyA = a.isCustom ? a.title : a.platform
        const keyB = b.isCustom ? b.title : b.platform
        const idxA = themeSettings.link_order.indexOf(keyA)
        const idxB = themeSettings.link_order.indexOf(keyB)
        if (idxA === -1) return 1
        if (idxB === -1) return -1
        return idxA - idxB
      })
    : allCards

  const content = (
    <div
      className="flex flex-col items-center w-full min-h-full font-sans relative"
      style={{ backgroundColor: bg, color: onBg }}
    >
      {/* Bannière : photo de couverture si fournie, sinon dégradé aux couleurs du thème */}
      <div
        className="w-full h-36 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent}55 0%, ${bg} 70%)`,
          borderBottom: `1px solid ${surfaceBorder}`
        }}
      >
        {profile.cover_image_url ? (
          <>
            <img
              src={profile.cover_image_url}
              alt="Couverture"
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
          </>
        ) : (
          // Motif discret pour éviter un aplat vide
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(${accent}66 1px, transparent 1px)`,
              backgroundSize: '18px 18px'
            }}
          />
        )}
        <div className="absolute top-3 right-3 z-20">
          <ProfileShareButton
            profileName={profile.name}
            profileSlug={profile.custom_url || profile.username}
            theme={isDarkBg ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* Photo & identité */}
      <div className="relative -mt-12 mb-5 z-20 flex flex-col items-center px-5 w-full">
        <ProfileMonogram
          name={profile.name}
          imageUrl={profile.image_url}
          size="lg"
          shape="rounded-2xl"
          theme={isDarkBg ? 'gold' : 'light'}
          customBorderColor={accent}
        />

        <div className="text-center mt-3 w-full">
          <h1 className="text-xl font-bold uppercase tracking-wider" style={{ color: onBg }}>
            {profile.name}
          </h1>
          {profile.job_title && (
            <p className="text-xs font-semibold uppercase tracking-widest mt-1" style={{ color: accent }}>
              {profile.job_title}
            </p>
          )}
          {profile.company && (
            <p className="text-[11px] tracking-wider uppercase mt-0.5" style={{ color: onBgMuted }}>
              {profile.company}
            </p>
          )}
          {profile.location && (
            <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-medium mt-1.5" style={{ color: onBgMuted }}>
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {profile.bio && (
          <div
            className="mt-3 text-center rounded-xl p-3.5 max-w-sm w-full"
            style={{ backgroundColor: surface, border: `1px solid ${surfaceBorder}` }}
          >
            <p className="text-xs leading-relaxed font-light" style={{ color: onBgMuted }}>
              {profile.bio}
            </p>
          </div>
        )}
      </div>

      {/* Actions principales */}
      {showAddToContacts && (
        <div className="w-full px-5 mb-5 z-10">
          <div className="flex gap-2.5 w-full">
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="flex-1 rounded-xl font-bold text-xs py-4 transition-all active:scale-98 hover:opacity-90"
              style={{ backgroundColor: accent, color: onAccent }}
            />
            <Button
              className="flex-1 rounded-xl font-semibold text-xs py-4 h-auto transition-all active:scale-98 border hover:opacity-80"
              style={{ borderColor: accent, color: accent, backgroundColor: surface }}
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Échanger
            </Button>
          </div>
        </div>
      )}

      {/* Réseaux sociaux */}
      {activeSocialLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2.5 px-5 mb-6 z-10">
          {activeSocialLinks.map((link: any, index: number) => (
            <button
              key={`${link.platform}-${index}`}
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer p-0"
              style={{ borderColor: `${accent}55`, backgroundColor: surface, color: onBg }}
              onClick={() => trackAndOpen(link.platform, link.url)}
              aria-label={link.platform}
            >
              <SocialIcon platform={link.platform} className="w-4 h-4" />
            </button>
          ))}
        </div>
      )}

      {/* Cartes de liens */}
      {orderedCards.length > 0 && (
        <div className="flex flex-col gap-2.5 w-full px-5 mb-6 z-10">
          {orderedCards.map((link: any, index: number) => {
            const title = link.isCustom ? link.title : (link.platform === 'shop' ? 'Boutique' : link.platform === 'website' ? 'Site Web' : 'Lien')
            const desc = link.description || null

            return (
              <button
                key={`${title}-${index}`}
                onClick={() => trackAndOpen(link.isCustom ? link.title : link.platform, link.url)}
                className="group relative w-full rounded-xl overflow-hidden text-left transition-all active:scale-98 flex items-stretch border hover:opacity-90"
                style={{ backgroundColor: surface, borderColor: surfaceBorder }}
              >
                <div className="w-1.5 shrink-0" style={{ backgroundColor: accent }} />
                <div className="p-3.5 flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${accent}22`, color: onBg }}
                    >
                      {link.isSpecial ? (
                        <SocialIcon platform={link.platform} className="w-4 h-4" />
                      ) : (
                        getLinkIcon(link)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs tracking-wide" style={{ color: onBg }}>{title}</h3>
                      {desc && (
                        <p className="text-[10px] leading-snug mt-0.5" style={{ color: onBgMuted }}>
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" style={{ color: onBgMuted }} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Avis (masqués si vides) */}
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

      {/* Pied de page */}
      <div className="mt-8 pb-8 text-center w-full z-10">
        <a
          href="/onboarding/public-page"
          className="inline-block hover:scale-105 transition-transform duration-200"
        >
          <OfikaBlinkingLogo fontSize="text-xl" color={isDarkBg ? "text-white" : "text-gray-900"} />
        </a>
      </div>
    </div>
  )

  if (isPreview) {
    return (
      <div className="w-full min-h-full flex flex-col relative overflow-y-auto custom-scrollbar" style={{ backgroundColor: bg }}>
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: bg }}>
      <div
        className="relative shadow-2xl overflow-hidden rounded-[32px] border"
        style={{
          backgroundColor: bg,
          borderColor: surfaceBorder,
          aspectRatio: '390 / 844',
          maxWidth: '390px',
          maxHeight: '844px',
          width: '90vw',
          height: '90vh'
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative">
          {content}
        </div>
      </div>
    </div>
  )
}
