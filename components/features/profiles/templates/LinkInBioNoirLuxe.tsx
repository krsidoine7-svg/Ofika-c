'use client'

import { useState, type ReactNode } from 'react'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
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

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-luxe-serif',
  display: 'swap',
})
const sans = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-luxe-sans', display: 'swap' })

const SERIF = 'var(--font-luxe-serif), Georgia, serif'

interface LinkInBioNoirLuxeProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

/**
 * Template "Noir Luxe" : fond noir profond, portrait en arche cerclé d'or,
 * capitales très espacées et filets dorés. Inspiration maison de haute joaillerie.
 */
export function LinkInBioNoirLuxe({ profile, showAddToContacts = true, isPreview = false }: LinkInBioNoirLuxeProps) {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile?.id)
  const d = useTemplateData(profile)
  const { bg, accent, onBg, onBgMuted, isDarkBg } = getThemeColors(profile, { bg: '#0a0a0a', accent: '#c9a96e' })

  const hairline = isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
  const portraitBg = isDarkBg ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'

  const contacts = [
    d.phoneUrl && { id: 'phone', label: 'Appeler', url: d.phoneUrl, node: <Phone className="w-4 h-4" strokeWidth={1.5} /> },
    d.whatsappUrl && { id: 'whatsapp', label: 'WhatsApp', url: d.whatsappUrl, node: <MessageCircle className="w-4 h-4" strokeWidth={1.5} /> },
    d.emailUrl && { id: 'email', label: 'E-mail', url: d.emailUrl, node: <Mail className="w-4 h-4" strokeWidth={1.5} /> },
    d.mapsUrl && { id: 'maps', label: 'Itinéraire', url: d.mapsUrl, node: <MapPin className="w-4 h-4" strokeWidth={1.5} /> },
    ...d.socials
      .filter((s) => s.platform !== 'whatsapp')
      .map((s) => ({ id: s.platform, label: s.label, url: s.url, node: <SocialIcon platform={s.platform} className="w-4 h-4" /> })),
  ].filter(Boolean) as { id: string; label: string; url: string; node: ReactNode }[]

  return (
    <TemplateShell
      isPreview={isPreview}
      background={bg}
      className={`${serif.variable} ${sans.variable}`}
      style={{ fontFamily: 'var(--font-luxe-sans), system-ui, sans-serif', fontWeight: 300 }}
    >
      <div className="relative flex flex-col items-center text-center min-h-full px-[34px] pt-11 pb-7" style={{ color: onBg }}>
        <div className="absolute top-4 right-4">
          <ProfileShareButton profileName={d.name} profileSlug={d.slug || ''} theme={isDarkBg ? 'dark' : 'light'} />
        </div>

        <div className="text-[10px] uppercase tracking-[0.5em] min-h-[14px]" style={{ color: accent }}>
          {d.company || ''}
        </div>

        {/* Portrait en arche */}
        <div className="mt-8 w-[132px] h-[164px] p-1.5 rounded-t-[66px] rounded-b-[4px]" style={{ border: `1px solid ${accent}` }}>
          <div className="w-full h-full rounded-t-[60px] rounded-b-[2px] overflow-hidden flex items-center justify-center" style={{ backgroundColor: portraitBg }}>
            {d.imageUrl ? (
              <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
            ) : (
              <span style={{ fontFamily: SERIF, fontSize: 44, color: accent, letterSpacing: '0.1em' }}>{d.initials}</span>
            )}
          </div>
        </div>

        <h1
          className="mt-7 mb-0 uppercase leading-[1.05]"
          style={{ fontFamily: SERIF, fontWeight: 500, fontSize: fluid(d.name.length > 18 ? 28 : 36, 22), letterSpacing: '0.14em', overflowWrap: 'anywhere' }}
        >
          {d.name}
        </h1>

        {d.jobTitle && (
          <div className="mt-3 flex items-center gap-3" style={{ color: accent }}>
            <span className="w-7 h-px shrink-0" style={{ backgroundColor: accent }} />
            <span className="text-[17px] italic" style={{ fontFamily: SERIF }}>{d.jobTitle}</span>
            <span className="w-7 h-px shrink-0" style={{ backgroundColor: accent }} />
          </div>
        )}

        {d.bio && (
          <p className="mt-4 mb-0 text-[13px] leading-[1.75] max-w-[290px]" style={{ color: onBgMuted }}>{d.bio}</p>
        )}
        {d.location && (
          <p className="mt-2 mb-0 text-[10px] uppercase tracking-[0.3em]" style={{ color: onBgMuted }}>{d.location}</p>
        )}

        {/* Liens : capitales espacées, filets fins */}
        {d.links.length > 0 && (
          <nav className="mt-8 w-full flex flex-col" aria-label="Liens">
            {d.links.map((link, i) => (
              <button
                key={`${link.trackId}-${i}`}
                type="button"
                onClick={() => trackAndOpen(link.trackId, link.url)}
                className="py-4 text-xs uppercase tracking-[0.32em] font-normal transition-colors"
                style={{ borderTop: `1px solid ${hairline}`, color: onBg }}
                onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = onBg)}
              >
                {link.label}
              </button>
            ))}
            <div style={{ borderTop: `1px solid ${hairline}` }} />
          </nav>
        )}

        {/* Contacts & réseaux : petits cercles fins */}
        {contacts.length > 0 && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {contacts.map((c, i) => (
              <button
                key={`${c.id}-${i}`}
                type="button"
                onClick={() => trackAndOpen(c.id, c.url)}
                aria-label={c.label}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ border: `1px solid ${accent}88`, color: accent }}
              >
                {c.node}
              </button>
            ))}
          </div>
        )}

        {showAddToContacts && (
          <div className="mt-9 w-full flex flex-col items-center gap-3">
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full h-[52px] rounded-none bg-transparent text-[11px] font-normal uppercase tracking-[0.4em] hover:opacity-80"
              style={{ backgroundColor: 'transparent', border: `1px solid ${accent}`, color: accent }}
            />
            <button
              type="button"
              onClick={() => setIsExchangeOpen(true)}
              className="h-11 text-[11px] uppercase tracking-[0.3em] transition-opacity hover:opacity-70"
              style={{ color: onBgMuted }}
            >
              Échanger nos coordonnées
            </button>
          </div>
        )}

        <div className="w-full mt-6 text-left">
          <PublicReviewsSection profileId={profile?.id} />
        </div>

        <div className="mt-auto pt-8">
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
