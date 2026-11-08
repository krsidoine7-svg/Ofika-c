'use client'

import { useState, type ReactNode } from 'react'
import { Sora } from 'next/font/google'
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { AddToContactsAuto } from '@/components/AddToContactsAuto'
import { ContactExchangeForm } from '@/components/features/contacts/ContactExchangeForm'
import { PublicReviewsSection } from '@/components/features/reviews/PublicReviewsSection'
import { OfikaBlinkingLogo } from '@/components/brand/OfikaBlinkingLogo'
import { SocialIcon } from '@/components/ui/social-icons'
import { useLinkTracker } from '@/lib/hooks/useLinkTracker'
import { getThemeColors } from '@/lib/utils/theme-colors'
import { ProfileShareButton } from '../ProfileShareButton'
import { TemplateShell, fluid } from './TemplateShell'
import { useTemplateData } from './useTemplateData'

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-immersif', display: 'swap' })

interface LinkInBioImmersifProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

/**
 * Template "Immersif" : la photo occupe tout l'écran, le contenu se pose dessus
 * avec des boutons en verre dépoli. Pensé pour les créateurs et influenceurs.
 */
export function LinkInBioImmersif({ profile, showAddToContacts = true, isPreview = false }: LinkInBioImmersifProps) {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile?.id)
  const d = useTemplateData(profile)
  // primary_color = couleur de base (sous la photo), secondary_color = accent
  const { bg: base, accent, onBg, onBgMuted, onAccent, isDarkBg } = getThemeColors(profile, { bg: '#0d0b09', accent: '#ffd166' })

  const glass = isDarkBg ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.55)'
  const glassBorder = isDarkBg ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.08)'
  const heroImage = d.imageUrl || d.coverUrl
  const glassStyle = {
    backgroundColor: glass,
    border: `1px solid ${glassBorder}`,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    color: onBg,
  }

  const icons = [
    d.whatsappUrl && { id: 'whatsapp', label: 'WhatsApp', url: d.whatsappUrl, node: <MessageCircle className="w-5 h-5" /> },
    ...d.socials
      .filter((s) => s.platform !== 'whatsapp')
      .map((s) => ({ id: s.platform, label: s.label, url: s.url, node: <SocialIcon platform={s.platform} className="w-5 h-5" /> })),
    d.phoneUrl && { id: 'phone', label: 'Appeler', url: d.phoneUrl, node: <Phone className="w-5 h-5" /> },
    d.emailUrl && { id: 'email', label: 'E-mail', url: d.emailUrl, node: <Mail className="w-5 h-5" /> },
  ].filter(Boolean) as { id: string; label: string; url: string; node: ReactNode }[]

  return (
    <TemplateShell
      isPreview={isPreview}
      background={base}
      backdropImage={heroImage}
      className={sora.variable}
      style={{ fontFamily: 'var(--font-immersif), system-ui, sans-serif' }}
    >
      <div className="relative min-h-full flex flex-col" style={{ color: onBg }}>
        {/* Photo plein écran */}
        <div className="relative h-[520px] shrink-0 overflow-hidden" style={{ backgroundColor: `${accent}33` }}>
          {heroImage ? (
            <img src={heroImage} alt={d.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[160px] font-bold select-none" style={{ color: `${accent}66` }} aria-hidden="true">
              {d.initials}
            </div>
          )}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="absolute top-4 right-4">
            <ProfileShareButton profileName={d.name} profileSlug={d.slug || ''} theme="dark" />
          </div>
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${base}00 35%, ${base}e6 78%, ${base} 100%)` }} />
        </div>

        {/* Contenu posé sur la photo */}
        <div className="relative -mt-[210px] px-[22px] pb-7 flex flex-col gap-3.5">
          <div>
            {(d.jobTitle || d.location) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {d.jobTitle && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: accent, color: onAccent }}>
                    {d.jobTitle}
                  </span>
                )}
                {d.location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px]" style={{ border: `1px solid ${glassBorder}`, color: onBg }}>
                    <MapPin className="w-3 h-3" />
                    {d.location}
                  </span>
                )}
              </div>
            )}
            <h1 className="m-0 font-bold leading-none tracking-[-0.03em] [overflow-wrap:anywhere]" style={{ fontSize: fluid(d.name.length > 18 ? 32 : 40, 26) }}>{d.name}</h1>
            {d.bio && <p className="mt-2 mb-0 text-sm leading-relaxed" style={{ color: onBgMuted }}>{d.bio}</p>}
          </div>

          {icons.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {icons.map((c, i) => (
                <button
                  key={`${c.id}-${i}`}
                  type="button"
                  onClick={() => trackAndOpen(c.id, c.url)}
                  aria-label={c.label}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform active:scale-95"
                  style={glassStyle}
                >
                  {c.node}
                </button>
              ))}
            </div>
          )}

          {d.links.map((link, i) => (
            <button
              key={`${link.trackId}-${i}`}
              type="button"
              onClick={() => trackAndOpen(link.trackId, link.url)}
              className="w-full flex items-center justify-between gap-3 px-[18px] py-4 rounded-[18px] text-left text-[15px] font-semibold transition-transform active:scale-[0.99]"
              style={glassStyle}
            >
              <span className="min-w-0">
                <span className="block truncate">{link.label}</span>
                {link.description && <span className="block text-xs font-normal truncate mt-0.5" style={{ color: onBgMuted }}>{link.description}</span>}
              </span>
              <ArrowUpRight className="w-[18px] h-[18px] shrink-0" />
            </button>
          ))}

          {showAddToContacts && (
            <div className="flex gap-2.5">
              <AddToContactsAuto
                profile={profile}
                variant="auto"
                size="lg"
                className="flex-1 h-[54px] rounded-[18px] text-[15px] font-bold hover:opacity-90"
                style={{ backgroundColor: onBg, color: base }}
              />
              <button
                type="button"
                onClick={() => setIsExchangeOpen(true)}
                aria-label="Échanger les coordonnées"
                className="w-[54px] h-[54px] rounded-[18px] flex items-center justify-center"
                style={glassStyle}
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>
          )}

          <PublicReviewsSection profileId={profile?.id} />

          <div className="pt-4 text-center">
            <a href="/onboarding/public-page" className="inline-block hover:scale-105 transition-transform">
              <OfikaBlinkingLogo fontSize="text-base" isDark={isDarkBg} />
            </a>
          </div>
        </div>
      </div>

      <ContactExchangeForm
        profileId={profile?.id}
        profileName={d.name}
        isOpen={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
        onSuccess={() => toast.success('Coordonnées envoyées avec succès')}
      />
    </TemplateShell>
  )
}
