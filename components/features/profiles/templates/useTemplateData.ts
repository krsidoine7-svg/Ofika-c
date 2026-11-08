'use client'

import { useMemo } from 'react'

/**
 * Données d'un profil, préparées une fois pour toutes pour les templates "nouvelle génération".
 * Chaque template ne s'occupe que de l'apparence ; la logique (filtrage des liens, libellés,
 * liens téléphone / WhatsApp / itinéraire) est ici.
 */

export interface TemplateLink {
  /** Identifiant utilisé pour les statistiques de clics */
  trackId: string
  label: string
  url: string
  description?: string
  /** Type de lien (website, shop, portfolio, appointment, contact…) ou plateforme */
  kind: string
}

export interface TemplateSocial {
  platform: string
  url: string
  label: string
}

const SPECIAL_PLATFORMS = ['shop', 'website', 'other']

const SPECIAL_LABELS: Record<string, string> = {
  shop: 'Boutique en ligne',
  website: 'Site web',
  other: 'Lien',
}

const PLATFORM_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitter: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  telegram: 'Telegram',
  github: 'GitHub',
}

function whatsappUrlFrom(value: string): string {
  if (value.startsWith('http')) return value
  return `https://wa.me/${value.replace(/[^0-9]/g, '')}`
}

export function useTemplateData(profile: any) {
  return useMemo(() => {
    const name: string = profile?.name || profile?.full_name || 'Votre nom'
    const parts = name.trim().split(/\s+/)
    const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : name
    const lastName = parts.length > 1 ? parts[parts.length - 1] : ''
    const initials = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('')

    const rawSocials: any[] = Array.isArray(profile?.social_links) ? profile.social_links : []
    const activeSocials = rawSocials.filter((l) => l?.url && l.is_active !== false)

    const socials: TemplateSocial[] = activeSocials
      .filter((l) => !SPECIAL_PLATFORMS.includes(l.platform))
      .map((l) => ({ platform: l.platform, url: l.url, label: PLATFORM_LABELS[l.platform] || l.platform }))

    const specialLinks: TemplateLink[] = activeSocials
      .filter((l) => SPECIAL_PLATFORMS.includes(l.platform))
      .map((l) => ({ trackId: l.platform, label: SPECIAL_LABELS[l.platform] || 'Lien', url: l.url, kind: l.platform }))

    const customLinks: TemplateLink[] = (Array.isArray(profile?.custom_links) ? profile.custom_links : [])
      .filter((l: any) => l?.url && l.is_active !== false)
      .map((l: any) => ({
        trackId: l.title || l.url,
        label: l.title || 'Lien',
        url: l.url,
        description: l.description || undefined,
        kind: l.type || 'other',
      }))

    // Ordre : liens personnalisés d'abord (ordre choisi par l'utilisateur), puis boutique / site
    const links = [...customLinks, ...specialLinks]

    const whatsappSocial = socials.find((s) => s.platform === 'whatsapp')
    const whatsappRaw: string | undefined = whatsappSocial?.url || profile?.whatsapp || undefined
    const phone: string | undefined = profile?.phone || undefined
    const email: string | undefined = profile?.email || undefined
    const location: string | undefined = profile?.location || undefined

    return {
      name,
      firstName,
      lastName,
      initials,
      jobTitle: (profile?.job_title as string | undefined) || undefined,
      company: (profile?.company as string | undefined) || undefined,
      bio: (profile?.bio as string | undefined) || undefined,
      location,
      imageUrl: (profile?.image_url as string | undefined) || undefined,
      coverUrl: (profile?.cover_image_url as string | undefined) || undefined,
      slug: (profile?.custom_url || profile?.username) as string | undefined,
      socials,
      links,
      phone,
      email,
      phoneUrl: phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined,
      emailUrl: email ? `mailto:${email}` : undefined,
      whatsappUrl: whatsappRaw ? whatsappUrlFrom(whatsappRaw) : undefined,
      mapsUrl: location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}` : undefined,
    }
  }, [profile])
}

export type TemplateData = ReturnType<typeof useTemplateData>
