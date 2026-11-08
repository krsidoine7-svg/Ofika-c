'use client'

import { useState } from 'react'
import { DM_Serif_Display, Manrope } from 'next/font/google'
import { ChevronRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { AddToContactsAuto } from '@/components/AddToContactsAuto'
import { ContactExchangeForm } from '@/components/features/contacts/ContactExchangeForm'
import { PublicReviewsSection } from '@/components/features/reviews/PublicReviewsSection'
import { OfikaBlinkingLogo } from '@/components/brand/OfikaBlinkingLogo'
import { SocialIcon } from '@/components/ui/social-icons'
import { useLinkTracker } from '@/lib/hooks/useLinkTracker'
import { getThemeColors, isDarkColor, readableTextOn } from '@/lib/utils/theme-colors'
import { ProfileShareButton } from '../ProfileShareButton'
import { TemplateShell, fluid } from './TemplateShell'
import { useTemplateData } from './useTemplateData'

const serif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-carte-serif', display: 'swap' })
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-carte-sans', display: 'swap' })

const SERIF = 'var(--font-carte-serif), Georgia, serif'
const SANS = 'var(--font-carte-sans), system-ui, sans-serif'

/** Mélange une couleur hexa avec du blanc (t = part de la couleur, 0 à 1). */
function tint(hex: string, t: number): string {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  const mix = (c: number) => Math.round(c * t + 255 * (1 - t)).toString(16).padStart(2, '0')
  return `#${mix((n >> 16) & 255)}${mix((n >> 8) & 255)}${mix(n & 255)}`
}

interface LinkInBioCarteProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

/**
 * Template "Carte de visite" : une vraie carte de visite premium en haut,
 * 4 actions rapides (appeler, WhatsApp, e-mail, itinéraire), puis les liens.
 */
export function LinkInBioCarte({ profile, showAddToContacts = true, isPreview = false }: LinkInBioCarteProps) {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile?.id)
  const d = useTemplateData(profile)

  // primary_color = couleur de la carte, secondary_color = accent
  const { bg: card, accent, onBg: onCard, onAccent } = getThemeColors(profile, { bg: '#0e1a2b', accent: '#c9a45c' })
  const cardIsDark = isDarkColor(card)
  const pageBg = cardIsDark ? tint(card, 0.07) : '#f4f4f2'
  const ink = cardIsDark ? card : '#111827'
  const muted = 'rgba(17,24,39,0.6)'
  const cardMuted = cardIsDark ? 'rgba(255,255,255,0.68)' : 'rgba(17,24,39,0.62)'
  const iconOnInk = readableTextOn(ink) === '#ffffff' ? accent : '#ffffff'

  const quickActions = [
    d.phoneUrl && { id: 'phone', label: 'Appeler', url: d.phoneUrl, Icon: Phone },
    d.whatsappUrl && { id: 'whatsapp', label: 'WhatsApp', url: d.whatsappUrl, Icon: MessageCircle },
    d.emailUrl && { id: 'email', label: 'E-mail', url: d.emailUrl, Icon: Mail },
    d.mapsUrl && { id: 'maps', label: 'Itinéraire', url: d.mapsUrl, Icon: MapPin },
  ].filter(Boolean) as { id: string; label: string; url: string; Icon: typeof Phone }[]

  const socials = d.socials.filter((s) => s.platform !== 'whatsapp')

  return (
    <TemplateShell
      isPreview={isPreview}
      background={pageBg}
      className={`${serif.variable} ${sans.variable}`}
      style={{ fontFamily: SANS }}
    >
      <div className="flex flex-col gap-5 min-h-full px-[22px] pt-7 pb-6" style={{ color: ink }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: muted }}>{d.company || 'Carte de visite'}</span>
          <ProfileShareButton profileName={d.name} profileSlug={d.slug || ''} theme="light" />
        </div>

        {/* La carte de visite */}
        <div
          className="relative overflow-hidden rounded-[18px] p-[22px] min-h-[214px] flex flex-col justify-between gap-6"
          style={{ backgroundColor: card, color: onCard, boxShadow: `0 24px 40px -18px ${card}aa` }}
        >
          <div className="absolute -right-10 -top-10 w-[180px] h-[180px] rounded-full opacity-35" style={{ border: `1px solid ${accent}` }} aria-hidden="true" />
          <div className="absolute -right-2.5 -top-2.5 w-[120px] h-[120px] rounded-full opacity-35" style={{ border: `1px solid ${accent}` }} aria-hidden="true" />

          <div className="relative flex items-center gap-3">
            <div
              className="w-[52px] h-[52px] rounded-xl overflow-hidden flex items-center justify-center shrink-0"
              style={{ border: `1px solid ${accent}`, backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              {d.imageUrl ? (
                <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontFamily: SERIF, fontSize: 22, color: accent }}>{d.initials}</span>
              )}
            </div>
            <div className="min-w-0">
              {d.company && (
                <div className="text-[10px] uppercase tracking-[0.2em] truncate" style={{ color: accent }}>{d.company}</div>
              )}
              {d.jobTitle && <div className="text-xs truncate" style={{ color: cardMuted }}>{d.jobTitle}</div>}
            </div>
          </div>

          <div className="relative">
            <h1 className="m-0 leading-[1.05] [overflow-wrap:anywhere]" style={{ fontFamily: SERIF, fontSize: fluid(d.name.length > 20 ? 25 : 30, 21), fontWeight: 400 }}>
              {d.name}
            </h1>
            {d.location && (
              <div className="mt-1.5 text-[10px] uppercase tracking-[0.14em]" style={{ color: cardMuted }}>{d.location}</div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        {quickActions.length > 0 && (
          <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${quickActions.length}, minmax(0, 1fr))` }}>
            {quickActions.map(({ id, label, url, Icon }, i) => (
              <button
                key={`${id}-${i}`}
                type="button"
                onClick={() => trackAndOpen(id, url)}
                className="flex flex-col items-center gap-2 pt-3.5 pb-3 rounded-2xl bg-white border border-black/[0.07] text-[11px] font-semibold transition-transform active:scale-95"
                style={{ color: ink }}
              >
                <span className="w-[34px] h-[34px] rounded-full flex items-center justify-center" style={{ backgroundColor: ink, color: iconOnInk }}>
                  <Icon className="w-4 h-4" />
                </span>
                {label}
              </button>
            ))}
          </div>
        )}

        {showAddToContacts && (
          <div className="flex flex-col gap-2">
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full h-[54px] rounded-2xl text-sm font-bold hover:opacity-90"
              style={{ backgroundColor: accent, color: onAccent }}
            />
            <button
              type="button"
              onClick={() => setIsExchangeOpen(true)}
              className="h-11 text-[13px] font-semibold underline underline-offset-4"
              style={{ color: ink }}
            >
              Échanger mes coordonnées
            </button>
          </div>
        )}

        {d.bio && (
          <p className="m-0 bg-white rounded-2xl border border-black/[0.07] p-4 text-[13px] leading-relaxed" style={{ color: muted }}>
            {d.bio}
          </p>
        )}

        {d.links.length > 0 && (
          <div className="bg-white rounded-2xl border border-black/[0.07] overflow-hidden">
            {d.links.map((link, i) => (
              <button
                key={`${link.trackId}-${i}`}
                type="button"
                onClick={() => trackAndOpen(link.trackId, link.url)}
                className="w-full flex items-center justify-between gap-3 px-[18px] py-4 text-left text-sm font-semibold hover:bg-black/[0.02] border-b border-black/[0.05] last:border-b-0"
                style={{ color: ink }}
              >
                <span className="min-w-0">
                  <span className="block truncate">{link.label}</span>
                  {link.description && (
                    <span className="block text-xs font-normal truncate mt-0.5" style={{ color: muted }}>{link.description}</span>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: muted }} />
              </button>
            ))}
          </div>
        )}

        {socials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2.5">
            {socials.map((s, i) => (
              <button
                key={`${s.platform}-${i}`}
                type="button"
                onClick={() => trackAndOpen(s.platform, s.url)}
                aria-label={s.label}
                className="w-11 h-11 rounded-full bg-white border border-black/[0.07] flex items-center justify-center hover:scale-105 transition-transform"
                style={{ color: ink }}
              >
                <SocialIcon platform={s.platform} className="w-[18px] h-[18px]" />
              </button>
            ))}
          </div>
        )}

        <PublicReviewsSection profileId={profile?.id} />

        <div className="mt-auto pt-4 text-center">
          <a href="/onboarding/public-page" className="inline-block hover:scale-105 transition-transform">
            <OfikaBlinkingLogo fontSize="text-lg" />
          </a>
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
