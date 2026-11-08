'use client'

import { useState } from 'react'
import { Fraunces } from 'next/font/google'
import { ArrowUpRight, Mail } from 'lucide-react'
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

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '600'],
  variable: '--font-editorial-serif',
  display: 'swap',
})

const SERIF = 'var(--font-editorial-serif), Georgia, serif'

interface LinkInBioEditorialProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

/**
 * Template "Éditorial" : grande photo façon couverture de magazine, nom en serif,
 * liens numérotés séparés par des filets fins.
 */
export function LinkInBioEditorial({ profile, showAddToContacts = true, isPreview = false }: LinkInBioEditorialProps) {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile?.id)
  const d = useTemplateData(profile)
  const { bg, accent, onBg, onBgMuted, isDarkBg } = getThemeColors(profile, {
    bg: '#f6f3ee',
    accent: '#9a5b34',
  })

  const hairline = isDarkBg ? 'rgba(255,255,255,0.16)' : 'rgba(22,20,18,0.14)'
  const heroImage = d.imageUrl || d.coverUrl
  // Les noms longs passent sur une taille plus petite pour rester sur 2 lignes
  const nameSize = d.name.length > 22 ? 40 : d.name.length > 14 ? 48 : 56

  const contactLinks = [
    d.phoneUrl && { id: 'phone', label: 'Appeler', url: d.phoneUrl },
    d.whatsappUrl && { id: 'whatsapp', label: 'WhatsApp', url: d.whatsappUrl },
    d.emailUrl && { id: 'email', label: 'E-mail', url: d.emailUrl },
    d.mapsUrl && { id: 'maps', label: 'Itinéraire', url: d.mapsUrl },
  ].filter(Boolean) as { id: string; label: string; url: string }[]

  const socials = d.socials.filter((s) => s.platform !== 'whatsapp')

  return (
    <TemplateShell isPreview={isPreview} background={bg} className={fraunces.variable}>
      <div className="flex flex-col min-h-full" style={{ color: onBg }}>
        {/* Couverture : photo plein cadre qui se fond dans le fond de page */}
        <div className="relative h-[420px] overflow-hidden" style={{ backgroundColor: `${accent}22` }}>
          {heroImage ? (
            <img src={heroImage} alt={d.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center select-none"
              style={{ fontFamily: SERIF, fontSize: 180, color: `${accent}55`, fontStyle: 'italic' }}
              aria-hidden="true"
            >
              {d.initials}
            </div>
          )}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
          <div className="absolute top-5 left-6 right-4 flex items-center justify-between text-white">
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium drop-shadow">
              {d.location || d.company || 'Portfolio'}
            </span>
            <ProfileShareButton profileName={d.name} profileSlug={d.slug || ''} theme="dark" />
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-36"
            style={{ background: `linear-gradient(to top, ${bg}, ${bg}00)` }}
          />
        </div>

        {/* Identité */}
        <div className="relative -mt-16 px-7">
          <h1 className="m-0 leading-[0.95] tracking-[-0.02em] [overflow-wrap:anywhere]" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: fluid(nameSize, 30) }}>
            {d.firstName}
            {d.lastName && (
              <>
                <br />
                <span style={{ fontStyle: 'italic', color: accent }}>{d.lastName}</span>
              </>
            )}
          </h1>
          {(d.jobTitle || d.company) && (
            <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: onBg }}>
              {[d.jobTitle, d.company].filter(Boolean).join(' — ')}
            </p>
          )}
          {d.bio && (
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: onBgMuted }}>
              {d.bio}
            </p>
          )}
        </div>

        {/* Liens numérotés */}
        {d.links.length > 0 && (
          <nav className="mt-7 px-7 flex flex-col" aria-label="Liens">
            {d.links.map((link, i) => (
              <button
                key={`${link.trackId}-${i}`}
                type="button"
                onClick={() => trackAndOpen(link.trackId, link.url)}
                className="group flex items-baseline gap-4 py-4 text-left transition-opacity hover:opacity-70"
                style={{ borderTop: `1px solid ${hairline}` }}
              >
                <span className="text-[13px] tabular-nums" style={{ fontFamily: SERIF, color: accent }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[16px] font-medium truncate">{link.label}</span>
                  {link.description && (
                    <span className="block text-[12px] mt-0.5 truncate" style={{ color: onBgMuted }}>
                      {link.description}
                    </span>
                  )}
                </span>
                <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            ))}
            <div style={{ borderTop: `1px solid ${hairline}` }} />
          </nav>
        )}

        {/* Contact & réseaux en texte souligné, façon colophon */}
        {(contactLinks.length > 0 || socials.length > 0) && (
          <div className="mt-6 px-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium">
            {[...contactLinks.map((c) => ({ key: c.id, label: c.label, url: c.url, track: c.id })),
              ...socials.map((s) => ({ key: s.platform, label: s.label, url: s.url, track: s.platform }))].map((item, i) => (
              <button
                key={`${item.key}-${i}`}
                type="button"
                onClick={() => trackAndOpen(item.track, item.url)}
                className="pb-0.5 transition-opacity hover:opacity-70"
                style={{ borderBottom: `1px solid ${onBg}` }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        {showAddToContacts && (
          <div className="mt-8 px-7 flex gap-2.5">
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="flex-1 h-[52px] rounded-none text-[13px] font-semibold uppercase tracking-[0.06em] hover:opacity-90"
              style={{ backgroundColor: onBg, color: bg }}
            />
            <button
              type="button"
              onClick={() => setIsExchangeOpen(true)}
              aria-label="Échanger les coordonnées"
              className="w-[52px] h-[52px] flex items-center justify-center transition-colors"
              style={{ border: `1px solid ${onBg}`, color: onBg }}
            >
              <Mail className="w-[18px] h-[18px]" />
            </button>
          </div>
        )}

        <div className="px-7 mt-6">
          <PublicReviewsSection profileId={profile?.id} className="mb-2" />
        </div>

        <div className="mt-auto pt-8 pb-8 text-center">
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
