export interface SimpleLink {
  platform?: string
  title?: string
  url: string
}

export interface VCardPhoto {
  base64: string
  type: string
}

/**
 * Échappe les caractères spéciaux pour éviter les injections de commandes vCard
 */
export function escapeVCard(text: string | null | undefined): string {
  if (!text) return ''
  return text.replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n')
}

/**
 * Génère un fichier vCard complet avec toutes les informations du profil
 */
export function generateCompleteVCard(profile: any, baseUrl: string, photoData?: VCardPhoto | null): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0'
  ]

  const name = escapeVCard(profile.full_name || profile.name || profile.profile_name)
  if (name) {
    lines.push(`FN;CHARSET=UTF-8:${name}`)
    // Découpage propre Prénom / Nom pour affichage parfait dans le répertoire Apple Contacts et Google Contacts
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length > 1) {
      const lastName = nameParts[nameParts.length - 1]
      const firstName = nameParts.slice(0, -1).join(' ')
      lines.push(`N;CHARSET=UTF-8:${lastName};${firstName};;;`)
    } else {
      lines.push(`N;CHARSET=UTF-8:${name};;;;`)
    }
  }

  const bio = escapeVCard(profile.bio)
  if (bio) {
    lines.push(`NOTE;CHARSET=UTF-8:${bio}`)
  }

  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${profile.email}`)
  }

  if (profile.phone) {
    // Format CELL + VOICE universel pour appel 1-clic et WhatsApp sur iOS et Android
    lines.push(`TEL;TYPE=CELL,VOICE,PREF:${profile.phone}`)
  }

  // Intégration de la photo : base64 en priorité pour affichage dans le répertoire mobile
  if (photoData?.base64) {
    const photoType = photoData.type?.toUpperCase().includes('PNG') ? 'PNG' : 'JPEG'
    lines.push(`PHOTO;ENCODING=b;TYPE=${photoType}:${photoData.base64}`)
  } else {
    const photo = profile.image_url || profile.profile_photo_url || profile.logo_url
    if (photo) {
      lines.push(`PHOTO;VALUE=URL:${photo}`)
    }
  }

  if (profile.location) {
    const loc = escapeVCard(profile.location.replace(/;/g, ','))
    lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${loc};;;;`)
  }

  if (profile.company) {
    lines.push(`ORG;CHARSET=UTF-8:${escapeVCard(profile.company)}`)
  }
  if (profile.job_title) {
    lines.push(`TITLE;CHARSET=UTF-8:${escapeVCard(profile.job_title)}`)
  }

  // Collecter tous les liens
  const allLinks: SimpleLink[] = []

  // 1. Social Links (JSON de profiles)
  if (profile.social_links && Array.isArray(profile.social_links)) {
    profile.social_links.forEach((l: any) => {
      if (l.url) allLinks.push({ platform: l.platform, url: l.url })
    })
  }

  // 2. Custom Links (JSON de profiles ou digital_nfc_cards)
  if (profile.custom_links && Array.isArray(profile.custom_links)) {
    profile.custom_links.forEach((l: any) => {
      if (l.url) allLinks.push({ title: l.title, url: l.url })
    })
  }

  // 3. Champs explicites (de digital_nfc_cards ou extraits)
  const platforms = ['instagram', 'twitter', 'facebook', 'whatsapp', 'youtube', 'tiktok', 'linkedin']
  platforms.forEach(p => {
    const val = profile[p]
    if (val && typeof val === 'string' && val.length > 0) {
      let url = val
      if (!url.startsWith('http')) {
        if (p === 'instagram') url = `https://instagram.com/${url}`
        else if (p === 'twitter') url = `https://twitter.com/${url}`
        else if (p === 'facebook') url = `https://facebook.com/${url}`
        else if (p === 'tiktok') url = `https://tiktok.com/@${url}`
        else if (p === 'whatsapp') url = `https://wa.me/${url.replace(/\+/g, '').replace(/\s/g, '')}`
        else if (p === 'youtube') url = `https://youtube.com/@${url}`
        else if (p === 'linkedin') url = `https://linkedin.com/in/${url}`
      }
      allLinks.push({ platform: p, url })
    }
  })
  
  if (profile.other_links) {
    allLinks.push({ title: 'Website', url: profile.other_links })
  }

  // Déduplication des liens par URL
  const uniqueLinksMap = new Map<string, SimpleLink>()
  allLinks.forEach(l => {
    if (l.url) uniqueLinksMap.set(l.url, l)
  })

  // Ajouter tous les liens au vCard
  Array.from(uniqueLinksMap.values()).forEach((link, index) => {
    const label = link.platform || link.title || `Lien_${index + 1}`
    const safeLabel = label.replace(/[^a-zA-Z0-9]/g, '_')
    // URL classique
    lines.push(`URL;TYPE=${safeLabel}:${link.url}`)
    // Format social pour iPhone
    if (link.platform) {
      lines.push(`X-SOCIALPROFILE;TYPE=${link.platform.toLowerCase()}:${link.url}`)
    }
  });

  // URL du profil public (lien vers la page Ofika)
  const username = profile.custom_url || profile.username
  if (username) {
    const profileUrl = `${baseUrl}/${username}`
    lines.push(`URL;TYPE=Profil_Ofika:${profileUrl}`)
  }

  const createdAt = profile.created_at
  if (createdAt) {
    const createdDate = new Date(createdAt).toISOString().split('T')[0]
    lines.push(`REV:${createdDate}`)
  }

  lines.push('END:VCARD')
  // Délimiteur de fin de ligne CRLF (\r\n) obligatoire selon la norme RFC 2426 (vCard 3.0)
  return lines.filter(line => line).join('\r\n') + '\r\n'
}
