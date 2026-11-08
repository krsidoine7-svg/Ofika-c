'use client'

import { useState, type ReactNode } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import {
  ArrowRight, Briefcase, Calendar, ExternalLink, Globe, Mail, MapPin, MessageCircle, Phone, ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'
import { AddToContactsAuto } from '@/components/AddToContactsAuto'
import { ContactExchangeForm } from '@/components/features/contacts/ContactExchangeForm'
import { PublicReviewsSection } from '@/components/features/reviews/PublicReviewsSection'
import { OfikaBlinkingLogo } from '@/components/brand/OfikaBlinkingLogo'
import { SocialIcon } from '@/components/ui/social-icons'
import { useLinkTracker } from '@/lib/hooks/useLinkTracker'
import { getThemeColors, isDarkColor } from '@/lib/utils/theme-colors'
import { ProfileShareButton } from '../ProfileShareButton'
import { TemplateShell } from './TemplateShell'
import { useTemplateData } from './useTemplateData'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-boutique', display: 'swap' })

/** Mélange une couleur hexa avec du blanc (t = part de la couleur). */
function tint(hex: string, t: number): string {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  const mix = (c: number) => Math.round(c * t + 255 * (1 - t)).toString(16).padStart(2, '0')
  return `#${mix((n >> 16) & 255)}${mix((n >> 8) & 255)}${mix(n & 255)}`
}

const KIND_ICONS: Record<string, typeof Globe> = {
  shop: ShoppingBag,
  website: Globe,
  portfolio: Briefcase,
  appointment: Calendar,
  contact: Phone,
}

interface LinkInBioBoutiqueProps {
  profile: any
  showAddToContacts?: boolean
  isPreview?: boolean
}

/**
 * Template "Boutique" : bandeau de marque + logo, raccourcis pratiques, liens présentés
 * comme une vitrine, et un bouton "Commander" toujours visible en bas de l'écran.
 */
export function LinkInBioBoutique({ profile, showAddToContacts = true, isPreview = false }: LinkInBioBoutiqueProps) {
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile?.id)
  const d = useTemplateData(profile)

  // primary_color = couleur de la marque, secondary_color = bouton Commander
  const { bg: brand, accent: cta, onBg: onBrand, onAccent: onCta } = getThemeColors(profile, { bg: '#c2562d', accent: '#1f7a45' })
  const pageBg = tint(brand, 0.05)
  const ink = '#2a1d14'
  const muted = '#6b5a4d'
  const brandText = isDarkColor(brand) ? brand : ink // couleur de marque lisible sur fond clair

  const shopName = d.company || d.name
  const subtitle = d.company ? [d.name, d.jobTitle].filter(Boolean).join(' · ') : d.jobTitle

  // Bouton principal : WhatsApp en priorité, sinon appel, sinon échange de coordonnées
  const primaryAction = d.whatsappUrl
    ? { label: 'Commander sur WhatsApp', icon: <MessageCircle className="w-5 h-5" />, run: () => trackAndOpen('whatsapp', d.whatsappUrl!) }
    : d.phoneUrl
      ? { label: 'Appeler la boutique', icon: <Phone className="w-5 h-5" />, run: () => trackAndOpen('phone', d.phoneUrl!) }
      : { label: 'Nous contacter', icon: <Mail className="w-5 h-5" />, run: () => setIsExchangeOpen(true) }

  const chips = [
    d.phoneUrl && d.whatsappUrl && { id: 'phone', label: 'Appeler', url: d.phoneUrl, node: <Phone className="w-3.5 h-3.5" /> },
    d.mapsUrl && { id: 'maps', label: 'Itinéraire', url: d.mapsUrl, node: <MapPin className="w-3.5 h-3.5" /> },
    d.emailUrl && { id: 'email', label: 'E-mail', url: d.emailUrl, node: <Mail className="w-3.5 h-3.5" /> },
    ...d.socials
      .filter((s) => s.platform !== 'whatsapp')
      .map((s) => ({ id: s.platform, label: s.label, url: s.url, node: <SocialIcon platform={s.platform} className="w-3.5 h-3.5" /> })),
  ].filter(Boolean) as { id: string; label: string; url: string; node: ReactNode }[]

  return (
    <TemplateShell
      isPreview={isPreview}
      background={pageBg}
      className={jakarta.variable}
      style={{ fontFamily: 'var(--font-boutique), system-ui, sans-serif' }}
    >
      <div className="relative min-h-full flex flex-col" style={{ color: ink }}>
        {/* Bandeau + logo */}
        <div className="relative h-[132px] shrink-0" style={{ backgroundColor: brand }}>
          {d.coverUrl ? (
            <img src={d.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: `radial-gradient(${onBrand} 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
              aria-hidden="true"
            />
          )}
          <div className="absolute top-3 right-3">
            <ProfileShareButton profileName={shopName} profileSlug={d.slug || ''} theme={isDarkColor(brand) ? 'dark' : 'light'} />
          </div>
          <div
            className="absolute left-5 -bottom-[34px] w-[76px] h-[76px] rounded-[20px] bg-white overflow-hidden flex items-center justify-center text-[22px] font-extrabold"
            style={{ border: `4px solid ${pageBg}`, color: brandText }}
          >
            {d.imageUrl ? <img src={d.imageUrl} alt={shopName} className="w-full h-full object-cover" /> : d.initials}
          </div>
        </div>

        <div className="px-5 pt-11 flex flex-col gap-4 pb-4">
          <div>
            <h1 className="m-0 text-[22px] font-extrabold tracking-[-0.02em] leading-tight [overflow-wrap:anywhere]">{shopName}</h1>
            {subtitle && <p className="mt-1 mb-0 text-[13px]" style={{ color: muted }}>{subtitle}</p>}
            {d.location && (
              <p className="mt-1.5 mb-0 inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: muted }}>
                <MapPin className="w-3.5 h-3.5" />
                {d.location}
              </p>
            )}
          </div>

          {/* Raccourcis */}
          {chips.length > 0 && (
            <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 [scrollbar-width:none]">
              {chips.map((c, i) => (
                <button
                  key={`${c.id}-${i}`}
                  type="button"
                  onClick={() => trackAndOpen(c.id, c.url)}
                  className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white text-xs font-semibold border border-[#e7ddd2] hover:border-[#cdbfae]"
                  style={{ color: ink }}
                >
                  {c.node}
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Vitrine de liens */}
          {d.links.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {d.links.map((link, i) => {
                const Icon = KIND_ICONS[link.kind] || ExternalLink
                const wide = d.links.length % 2 === 1 && i === 0
                return (
                  <button
                    key={`${link.trackId}-${i}`}
                    type="button"
                    onClick={() => trackAndOpen(link.trackId, link.url)}
                    className={`bg-white rounded-[18px] border border-[#eee4d9] overflow-hidden text-left flex flex-col transition-transform active:scale-[0.98] ${wide ? 'col-span-2' : ''}`}
                  >
                    <div className={`${wide ? 'h-[96px]' : 'h-[84px]'} flex items-center justify-center`} style={{ backgroundColor: tint(brand, 0.12), color: brandText }}>
                      <Icon className="w-7 h-7" strokeWidth={1.6} />
                    </div>
                    <div className="px-3 pt-2.5 pb-3">
                      <div className="text-[13px] font-bold leading-snug line-clamp-2">{link.label}</div>
                      <div className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: brandText }}>
                        {link.description || 'Découvrir'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {d.bio && (
            <div className="bg-white rounded-[18px] border border-[#eee4d9] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: brandText }}>À propos</div>
              <p className="m-0 text-[13px] leading-relaxed" style={{ color: muted }}>{d.bio}</p>
            </div>
          )}

          <PublicReviewsSection profileId={profile?.id} />

          <div className="pt-2 text-center">
            <a href="/onboarding/public-page" className="inline-block hover:scale-105 transition-transform">
              <OfikaBlinkingLogo fontSize="text-base" />
            </a>
          </div>
        </div>

        {/* Barre d'action fixée en bas */}
        <div
          className="sticky bottom-0 mt-auto px-5 pt-3.5 pb-5 flex gap-2.5"
          style={{ background: `linear-gradient(to top, ${pageBg} 72%, ${pageBg}00)` }}
        >
          {showAddToContacts && (
            <div className="w-[54px] h-[54px] shrink-0" title="Ajouter aux contacts">
              <AddToContactsAuto
                profile={profile}
                variant="auto"
                size="lg"
                className="!w-[54px] !h-[54px] !p-0 rounded-2xl text-[0px] bg-white border border-[#e0d4c6] [&_svg]:!w-5 [&_svg]:!h-5"
                style={{ backgroundColor: '#ffffff', color: ink }}
              />
            </div>
          )}
          <button
            type="button"
            onClick={primaryAction.run}
            className="flex-1 h-[54px] rounded-2xl flex items-center justify-center gap-2.5 text-[15px] font-bold shadow-lg transition-transform active:scale-[0.98]"
            style={{ backgroundColor: cta, color: onCta, boxShadow: `0 10px 24px -10px ${cta}` }}
          >
            {primaryAction.icon}
            {primaryAction.label}
          </button>
        </div>
      </div>

      <ContactExchangeForm
        profileId={profile?.id}
        profileName={shopName}
        isOpen={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
        onSuccess={() => toast.success('Coordonnées envoyées avec succès')}
      />
    </TemplateShell>
  )
}
