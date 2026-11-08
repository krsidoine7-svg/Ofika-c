'use client'

import { useState } from 'react'
import { Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import { AddToContactsAuto } from '@/components/AddToContactsAuto'
import { ContactExchangeForm } from '@/components/features/contacts/ContactExchangeForm'
import { PublicReviewsSection } from '@/components/features/reviews/PublicReviewsSection'
import { OfikaBlinkingLogo } from '@/components/brand/OfikaBlinkingLogo'
import { useLinkTracker } from '@/lib/hooks/useLinkTracker'
import { getThemeColors } from '@/lib/utils/theme-colors'
import { ProfileShareButton } from '../ProfileShareButton'
import { TemplateShell, fluid } from './TemplateShell'
import { useTemplateData } from './useTemplateData'

const sans = Inter_Tight({ subsets: ['latin'], weight: ['400', '500', '600', '800'], variable: '--font-suisse-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-suisse-mono', display: 'swap' })

const MONO = 'var(--font-suisse-mono), ui-monospace, monospace'

interface LinkInBioSuisseProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

/**
 * Template "Suisse" : style typographique international — nom géant aligné à gauche,
 * liste numérotée sur grille, petites mentions en police machine, un seul point de couleur.
 */
export function LinkInBioSuisse({ profile, showAddToContacts = true, isPreview = false }: LinkInBioSuisseProps) {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile?.id)
  const d = useTemplateData(profile)
  const { bg, accent, onBg, onBgMuted, onAccent, isDarkBg } = getThemeColors(profile, { bg: '#ffffff', accent: '#d6371f' })

  const rule = isDarkBg ? 'rgba(255,255,255,0.14)' : 'rgba(10,10,10,0.12)'
  const photoBg = isDarkBg ? 'rgba(255,255,255,0.08)' : '#e7e7e7'

  // Bouton de droite : un lien de rendez-vous, sinon WhatsApp, sinon échange de coordonnées
  const booking = d.links.find((l) => l.kind === 'appointment')
  const secondary = booking
    ? { label: 'Prendre RDV', run: () => trackAndOpen(booking.trackId, booking.url) }
    : d.whatsappUrl
      ? { label: 'WhatsApp', run: () => trackAndOpen('whatsapp', d.whatsappUrl!) }
      : { label: 'Échanger', run: () => setIsExchangeOpen(true) }

  const textLinks = [
    d.phoneUrl && { id: 'phone', label: 'Téléphone', url: d.phoneUrl },
    d.emailUrl && { id: 'email', label: 'E-mail', url: d.emailUrl },
    d.mapsUrl && { id: 'maps', label: 'Plan', url: d.mapsUrl },
    ...d.socials
      .filter((s) => !(s.platform === 'whatsapp' && secondary.label === 'WhatsApp'))
      .map((s) => ({ id: s.platform, label: s.label, url: s.url })),
  ].filter(Boolean) as { id: string; label: string; url: string }[]

  // Le nom passe sur deux lignes (prénom / nom) pour l'effet affiche
  const nameSize = d.name.length > 20 ? 40 : 52

  return (
    <TemplateShell
      isPreview={isPreview}
      background={bg}
      className={`${sans.variable} ${mono.variable}`}
      style={{ fontFamily: 'var(--font-suisse-sans), system-ui, sans-serif' }}
    >
      <div className="flex flex-col min-h-full px-6 pt-[26px] pb-6" style={{ color: onBg }}>
        <div className="flex items-start justify-between gap-4">
          <div className="w-16 h-16 overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: photoBg }}>
            {d.imageUrl ? (
              <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold">{d.initials}</span>
            )}
          </div>
          <div className="flex items-start gap-3">
            <div className="text-[10px] text-right leading-relaxed uppercase" style={{ fontFamily: MONO, color: onBgMuted }}>
              {d.location && <div>{d.location}</div>}
              {d.company && <div>{d.company}</div>}
            </div>
            <ProfileShareButton profileName={d.name} profileSlug={d.slug || ''} theme={isDarkBg ? 'dark' : 'light'} />
          </div>
        </div>

        <h1 className="mt-7 mb-0 font-extrabold leading-[0.92] tracking-[-0.045em] [overflow-wrap:anywhere]" style={{ fontSize: fluid(nameSize, 32) }}>
          {d.firstName}
          {d.lastName && (
            <>
              <br />
              {d.lastName}
            </>
          )}
          <span style={{ color: accent }}>.</span>
        </h1>

        {d.jobTitle && <p className="mt-3.5 mb-0 text-[15px] font-semibold">{d.jobTitle}</p>}
        {d.bio && (
          <p className="mt-2 mb-0 text-[15px] leading-[1.45] max-w-[320px]" style={{ color: onBgMuted }}>{d.bio}</p>
        )}

        {d.links.length > 0 && (
          <>
            <div className="mt-7 text-[10px] tracking-[0.08em] uppercase" style={{ fontFamily: MONO, color: onBgMuted }}>Liens</div>
            <div className="mt-2" style={{ borderTop: `2px solid ${onBg}` }}>
              {d.links.map((link, i) => (
                <button
                  key={`${link.trackId}-${i}`}
                  type="button"
                  onClick={() => trackAndOpen(link.trackId, link.url)}
                  className="group w-full grid grid-cols-[28px_minmax(0,1fr)_auto] items-baseline gap-2 py-3.5 text-left"
                  style={{ borderBottom: `1px solid ${rule}` }}
                >
                  <span className="text-[11px]" style={{ fontFamily: MONO, color: onBgMuted }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0">
                    <span className="block text-base font-semibold truncate group-hover:underline underline-offset-4">{link.label}</span>
                    {link.description && <span className="block text-xs truncate mt-0.5" style={{ color: onBgMuted }}>{link.description}</span>}
                  </span>
                  <ArrowUpRight className="w-4 h-4 self-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ))}
            </div>
          </>
        )}

        {textLinks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-x-[18px] gap-y-2 text-[13px] font-medium">
            {textLinks.map((t, i) => (
              <button
                key={`${t.id}-${i}`}
                type="button"
                onClick={() => trackAndOpen(t.id, t.url)}
                className="pb-px transition-opacity hover:opacity-60"
                style={{ borderBottom: `1px solid ${onBg}` }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {showAddToContacts && (
          <div className="mt-8 grid grid-cols-2 gap-2">
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="h-[52px] rounded-none text-sm font-bold hover:opacity-90"
              style={{ backgroundColor: onBg, color: bg }}
            />
            <button
              type="button"
              onClick={secondary.run}
              className="h-[52px] text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: accent, color: onAccent }}
            >
              {secondary.label}
            </button>
          </div>
        )}

        <div className="mt-6">
          <PublicReviewsSection profileId={profile?.id} />
        </div>

        <div className="mt-auto pt-6 flex items-center justify-between">
          <a href="/onboarding/public-page" className="inline-block hover:opacity-70 transition-opacity">
            <OfikaBlinkingLogo fontSize="text-sm" isDark={isDarkBg} />
          </a>
          {showAddToContacts && secondary.label !== 'Échanger' && (
            <button
              type="button"
              onClick={() => setIsExchangeOpen(true)}
              className="text-[11px] uppercase tracking-[0.06em] h-11"
              style={{ fontFamily: MONO, color: onBgMuted }}
            >
              Échanger ↗
            </button>
          )}
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
