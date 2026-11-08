'use client'

import { useState } from 'react'
import { Space_Grotesk } from 'next/font/google'
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

const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-bento', display: 'swap' })

interface LinkInBioBentoProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

/**
 * Template "Bento" : grille de tuiles de tailles différentes, une couleur vive en accent.
 * Les tuiles n'apparaissent que si l'information existe.
 */
export function LinkInBioBento({ profile, showAddToContacts = true, isPreview = false }: LinkInBioBentoProps) {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile?.id)
  const d = useTemplateData(profile)
  const { bg, accent, onBg, onBgMuted, onAccent, isDarkBg } = getThemeColors(profile, { bg: '#f2f2ef', accent: '#c8f169' })

  // Tuiles : blanches sur fond clair, légèrement éclaircies sur fond sombre
  const tile = isDarkBg ? 'rgba(255,255,255,0.07)' : '#ffffff'
  const tileBorder = isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
  const ink = isDarkBg ? '#ffffff' : '#111111'
  const inverse = isDarkBg ? '#ffffff' : '#111111'
  const onInverse = isDarkBg ? '#111111' : '#ffffff'

  const tileClass = 'rounded-3xl p-4 flex flex-col justify-between min-h-[86px] text-left transition-transform active:scale-[0.98]'
  const tileStyle = { backgroundColor: tile, border: `1px solid ${tileBorder}`, color: ink }

  const [featured, ...otherLinks] = d.links
  const quickActions = [
    d.phoneUrl && { id: 'phone', label: 'Appeler', url: d.phoneUrl, Icon: Phone },
    d.emailUrl && { id: 'email', label: 'E-mail', url: d.emailUrl, Icon: Mail },
    d.mapsUrl && { id: 'maps', label: 'Itinéraire', url: d.mapsUrl, Icon: MapPin },
  ].filter(Boolean) as { id: string; label: string; url: string; Icon: typeof Phone }[]
  const socials = d.socials.filter((s) => s.platform !== 'whatsapp')

  return (
    <TemplateShell
      isPreview={isPreview}
      background={bg}
      className={grotesk.variable}
      style={{ fontFamily: 'var(--font-bento), system-ui, sans-serif' }}
    >
      <div className="grid grid-cols-2 gap-2.5 p-[18px] min-h-full content-start" style={{ color: onBg, gridAutoFlow: 'row dense' }}>
        {/* Tuile identité */}
        <div className="col-span-2 rounded-3xl p-5 flex flex-col gap-6" style={tileStyle}>
          <div className="flex items-start justify-between gap-3">
            <div className="w-[84px] h-[84px] rounded-[22px] overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}55` }}>
              {d.imageUrl ? (
                <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold" style={{ color: ink }}>{d.initials}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {d.location && (
                <span className="hidden min-[360px]:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: inverse, color: onInverse }}>
                  <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: accent }} />
                  {d.location}
                </span>
              )}
              <ProfileShareButton profileName={d.name} profileSlug={d.slug || ''} theme={isDarkBg ? 'dark' : 'light'} />
            </div>
          </div>
          <div>
            <h1 className="m-0 font-bold leading-none tracking-[-0.03em] [overflow-wrap:anywhere]" style={{ fontSize: fluid(d.name.length > 18 ? 28 : 34, 22) }}>{d.name}</h1>
            {(d.jobTitle || d.company) && (
              <p className="mt-1.5 text-sm" style={{ color: onBgMuted }}>{[d.jobTitle, d.company].filter(Boolean).join(' · ')}</p>
            )}
          </div>
        </div>

        {/* Enregistrer + Échanger */}
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="!h-auto min-h-[86px] rounded-3xl text-base font-bold hover:opacity-90"
              style={{ backgroundColor: accent, color: onAccent }}
            />
            <button
              type="button"
              onClick={() => setIsExchangeOpen(true)}
              className={tileClass}
              style={{ backgroundColor: inverse, color: onInverse }}
            >
              <Mail className="w-[22px] h-[22px]" />
              <span className="text-sm font-medium">Échanger</span>
            </button>
          </>
        )}

        {/* Lien à la une (le premier lien) */}
        {featured && (
          <button
            type="button"
            onClick={() => trackAndOpen(featured.trackId, featured.url)}
            className="col-span-2 rounded-3xl p-[18px] min-h-[150px] flex flex-col justify-between text-left transition-transform active:scale-[0.99]"
            style={tileStyle}
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.1em]" style={{ color: onBgMuted }}>À la une</span>
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: inverse, color: onInverse }}>
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-[-0.02em] leading-tight">{featured.label}</div>
              {featured.description && <div className="text-[13px] mt-1" style={{ color: onBgMuted }}>{featured.description}</div>}
            </div>
          </button>
        )}

        {/* WhatsApp en tuile sombre */}
        {d.whatsappUrl && (
          <button type="button" onClick={() => trackAndOpen('whatsapp', d.whatsappUrl!)} className={tileClass} style={{ backgroundColor: inverse, color: onInverse }}>
            <MessageCircle className="w-[22px] h-[22px]" />
            <span className="text-sm font-medium">WhatsApp</span>
          </button>
        )}

        {quickActions.map(({ id, label, url, Icon }, i) => (
          <button key={`${id}-${i}`} type="button" onClick={() => trackAndOpen(id, url)} className={tileClass} style={tileStyle}>
            <Icon className="w-[22px] h-[22px]" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}

        {socials.map((s, i) => (
          <button key={`${s.platform}-${i}`} type="button" onClick={() => trackAndOpen(s.platform, s.url)} className={tileClass} style={tileStyle}>
            <SocialIcon platform={s.platform} className="w-[22px] h-[22px]" />
            <span className="text-sm font-medium">{s.label}</span>
          </button>
        ))}

        {otherLinks.map((link, i) => (
          <button key={`${link.trackId}-${i}`} type="button" onClick={() => trackAndOpen(link.trackId, link.url)} className={tileClass} style={tileStyle}>
            <ArrowUpRight className="w-[22px] h-[22px]" />
            <span className="text-sm font-medium leading-tight line-clamp-2">{link.label}</span>
          </button>
        ))}

        {d.bio && (
          <div className="col-span-2 rounded-3xl p-5 text-sm leading-relaxed" style={{ ...tileStyle, color: onBgMuted }}>
            {d.bio}
          </div>
        )}

        <div className="col-span-2">
          <PublicReviewsSection profileId={profile?.id} />
        </div>

        <div className="col-span-2 pt-4 pb-2 text-center">
          <a href="/onboarding/public-page" className="inline-block hover:scale-105 transition-transform">
            <OfikaBlinkingLogo fontSize="text-lg" isDark={isDarkBg} />
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
