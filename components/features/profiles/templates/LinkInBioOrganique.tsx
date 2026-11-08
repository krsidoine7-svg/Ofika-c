'use client'

import { useState, type ReactNode } from 'react'
import { Cormorant, Nunito_Sans } from 'next/font/google'
import { Calendar, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
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

const serif = Cormorant({ subsets: ['latin'], weight: ['500'], style: ['normal', 'italic'], variable: '--font-organique-serif', display: 'swap' })
const sans = Nunito_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-organique-sans', display: 'swap' })

const SERIF = 'var(--font-organique-serif), Georgia, serif'

interface LinkInBioOrganiqueProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

/**
 * Template "Organique" : tons naturels, portrait en arche, formes douces et boutons arrondis.
 * Le bouton principal invite à réserver (lien de rendez-vous, sinon WhatsApp ou téléphone).
 */
export function LinkInBioOrganique({ profile, showAddToContacts = true, isPreview = false }: LinkInBioOrganiqueProps) {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile?.id)
  const d = useTemplateData(profile)
  const { bg, accent, onBg, onBgMuted, onAccent, isDarkBg } = getThemeColors(profile, { bg: '#efe6da', accent: '#8a5a44' })

  const pill = isDarkBg ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.65)'
  const pillBorder = isDarkBg ? 'rgba(255,255,255,0.16)' : 'rgba(58,46,37,0.12)'
  const portraitBg = isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(58,46,37,0.08)'

  // Bouton principal : un lien de rendez-vous s'il existe, sinon WhatsApp, sinon téléphone
  const bookingLink = d.links.find((l) => l.kind === 'appointment')
  const primary = bookingLink
    ? { label: bookingLink.label, track: bookingLink.trackId, url: bookingLink.url }
    : d.whatsappUrl
      ? { label: 'Prendre rendez-vous', track: 'whatsapp', url: d.whatsappUrl }
      : d.phoneUrl
        ? { label: 'Appeler pour réserver', track: 'phone', url: d.phoneUrl }
        : null
  const otherLinks = d.links.filter((l) => l !== bookingLink)

  const contacts = [
    d.whatsappUrl && primary?.track !== 'whatsapp' && { id: 'whatsapp', label: 'WhatsApp', url: d.whatsappUrl, node: <MessageCircle className="w-[18px] h-[18px]" /> },
    d.phoneUrl && primary?.track !== 'phone' && { id: 'phone', label: 'Appeler', url: d.phoneUrl, node: <Phone className="w-[18px] h-[18px]" /> },
    d.emailUrl && { id: 'email', label: 'E-mail', url: d.emailUrl, node: <Mail className="w-[18px] h-[18px]" /> },
    d.mapsUrl && { id: 'maps', label: 'Itinéraire', url: d.mapsUrl, node: <MapPin className="w-[18px] h-[18px]" /> },
    ...d.socials
      .filter((s) => s.platform !== 'whatsapp')
      .map((s) => ({ id: s.platform, label: s.label, url: s.url, node: <SocialIcon platform={s.platform} className="w-[18px] h-[18px]" /> })),
  ].filter(Boolean) as { id: string; label: string; url: string; node: ReactNode }[]

  return (
    <TemplateShell
      isPreview={isPreview}
      background={bg}
      className={`${serif.variable} ${sans.variable}`}
      style={{ fontFamily: 'var(--font-organique-sans), system-ui, sans-serif' }}
    >
      <div className="relative overflow-hidden min-h-full flex flex-col items-center px-[26px] pt-9 pb-7" style={{ color: onBg }}>
        {/* Formes douces en arrière-plan */}
        <div className="absolute -top-[90px] -right-[110px] w-[280px] h-[280px] rounded-full opacity-[0.18]" style={{ backgroundColor: accent }} aria-hidden="true" />
        <div className="absolute top-[480px] -left-[120px] w-[240px] h-[240px] rounded-full opacity-[0.12]" style={{ backgroundColor: accent }} aria-hidden="true" />
        <div className="absolute top-4 right-4 z-10">
          <ProfileShareButton profileName={d.name} profileSlug={d.slug || ''} theme={isDarkBg ? 'dark' : 'light'} />
        </div>

        {/* Portrait en arche */}
        <div
          className="relative w-[200px] h-[250px] rounded-t-[100px] rounded-b-[24px] overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: portraitBg, boxShadow: '0 18px 30px -18px rgba(58,46,37,0.5)' }}
        >
          {d.imageUrl ? (
            <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
          ) : (
            <span className="italic" style={{ fontFamily: SERIF, fontSize: 72, color: accent }}>{d.initials}</span>
          )}
        </div>

        <h1 className="relative mt-[22px] mb-0 text-center leading-none [overflow-wrap:anywhere]" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: fluid(d.name.length > 18 ? 34 : 42, 28) }}>
          {d.firstName} {d.lastName && <span className="italic">{d.lastName}</span>}
        </h1>
        {(d.jobTitle || d.company) && (
          <p className="relative mt-2 mb-0 text-[13px] font-semibold text-center" style={{ color: accent }}>
            {[d.jobTitle, d.company].filter(Boolean).join(' · ')}
          </p>
        )}
        {(d.bio || d.location) && (
          <p className="relative mt-1.5 mb-0 text-[13px] text-center leading-relaxed max-w-[300px]" style={{ color: onBgMuted }}>
            {d.bio}
            {d.bio && d.location && <br />}
            {d.location}
          </p>
        )}

        {primary && (
          <button
            type="button"
            onClick={() => trackAndOpen(primary.track, primary.url)}
            className="relative mt-[22px] w-full h-[54px] rounded-full flex items-center justify-center gap-2.5 text-[15px] font-bold transition-transform active:scale-[0.98]"
            style={{ backgroundColor: accent, color: onAccent }}
          >
            <Calendar className="w-[18px] h-[18px]" />
            {primary.label}
          </button>
        )}

        {otherLinks.length > 0 && (
          <div className="relative mt-3 w-full flex flex-col gap-2.5">
            {otherLinks.map((link, i) => (
              <button
                key={`${link.trackId}-${i}`}
                type="button"
                onClick={() => trackAndOpen(link.trackId, link.url)}
                className="min-h-[50px] px-5 py-2.5 rounded-full text-sm font-semibold text-center transition-colors"
                style={{ backgroundColor: pill, border: `1px solid ${pillBorder}`, color: onBg }}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {contacts.length > 0 && (
          <div className="relative mt-5 flex flex-wrap justify-center gap-2.5">
            {contacts.map((c, i) => (
              <button
                key={`${c.id}-${i}`}
                type="button"
                onClick={() => trackAndOpen(c.id, c.url)}
                aria-label={c.label}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95"
                style={{ backgroundColor: pill, border: `1px solid ${pillBorder}`, color: accent }}
              >
                {c.node}
              </button>
            ))}
          </div>
        )}

        {showAddToContacts && (
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="h-11 px-5 rounded-full text-[13px] font-semibold hover:opacity-80"
              style={{ backgroundColor: 'transparent', border: `1px solid ${onBg}`, color: onBg }}
            />
            <button
              type="button"
              onClick={() => setIsExchangeOpen(true)}
              className="h-11 px-5 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-80"
              style={{ border: `1px solid ${onBg}`, color: onBg }}
            >
              Échanger
            </button>
          </div>
        )}

        <div className="relative w-full mt-6">
          <PublicReviewsSection profileId={profile?.id} />
        </div>

        <div className="relative mt-auto pt-6">
          <a href="/onboarding/public-page" className="inline-block hover:scale-105 transition-transform">
            <OfikaBlinkingLogo fontSize="text-base" isDark={isDarkBg} />
          </a>
        </div>
      </div>

      <ContactExchangeForm
        profileId={profile?.id}
        profileName={d.name}
        isOpen={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
        accentColor={accent}
        onSuccess={() => toast.success('Coordonnées envoyées avec succès')}
      />
    </TemplateShell>
  )
}
