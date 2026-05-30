// =====================================================
// Types: Système dynamique de réseaux sociaux
// =====================================================

export type SocialLinkType = 
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'youtube'
  | 'tiktok'
  | 'linkedin'
  | 'github'
  | 'website'
  | 'shop'
  | 'other'

export interface SocialLink {
  type: SocialLinkType
  url: string
  label?: string // Label personnalisé pour "other"
}

export interface SocialLinkOption {
  value: SocialLinkType
  label: string
  icon?: string
  placeholder: string
  pattern?: RegExp
  example: string
}

export const SOCIAL_LINK_OPTIONS: SocialLinkOption[] = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    placeholder: '+33 6 12 34 56 78',
    example: '+33 6 12 34 56 78'
  },
  {
    value: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/...',
    pattern: /^https?:\/\/(www\.)?facebook\.com\/.+/,
    example: 'https://facebook.com/moncompte'
  },
  {
    value: 'instagram',
    label: 'Instagram',
    placeholder: '@moncompte ou URL',
    example: '@moncompte ou https://instagram.com/moncompte'
  },
  {
    value: 'twitter',
    label: 'Twitter / X',
    placeholder: '@moncompte ou URL',
    example: '@moncompte ou https://twitter.com/moncompte'
  },
  {
    value: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@...',
    pattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
    example: 'https://youtube.com/@moncompte'
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    placeholder: '@moncompte ou URL',
    example: '@moncompte ou https://tiktok.com/@moncompte'
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/...',
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/.+/,
    example: 'https://linkedin.com/in/moncompte'
  },
  {
    value: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/...',
    pattern: /^https?:\/\/(www\.)?github\.com\/.+/,
    example: 'https://github.com/moncompte'
  },
  {
    value: 'website',
    label: 'Site web',
    placeholder: 'https://monsite.com',
    pattern: /^https?:\/\/.+/,
    example: 'https://monsite.com'
  },
  {
    value: 'shop',
    label: 'Boutique',
    placeholder: 'https://maboutique.com',
    pattern: /^https?:\/\/.+/,
    example: 'https://maboutique.com'
  },
  {
    value: 'other',
    label: 'Autre',
    placeholder: 'URL complète',
    example: 'https://example.com'
  }
]

export const MAX_SOCIAL_LINKS = 4

export function getSocialLinkOption(type: SocialLinkType): SocialLinkOption | undefined {
  return SOCIAL_LINK_OPTIONS.find(opt => opt.value === type)
}

export function validateSocialLink(link: SocialLink): { valid: boolean; error?: string } {
  const option = getSocialLinkOption(link.type)
  
  if (!option) {
    return { valid: false, error: 'Type de réseau social invalide' }
  }
  
  if (!link.url || link.url.trim() === '') {
    return { valid: false, error: 'URL requise' }
  }
  
  if (option.pattern && !option.pattern.test(link.url)) {
    return { valid: false, error: `Format invalide. Exemple: ${option.example}` }
  }
  
  return { valid: true }
}
