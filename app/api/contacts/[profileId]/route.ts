import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SimpleLink {
  platform?: string
  title?: string
  url: string
}

/**
 * Génère un fichier vCard complet avec toutes les informations du profil
 */
function generateCompleteVCard(profile: any, baseUrl: string): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0'
  ]

  const name = profile.full_name || profile.name || profile.profile_name
  if (name) {
    lines.push(`FN:${name}`)
    lines.push(`N:${name};;;`)
  }

  const bio = profile.bio || ''
  if (bio) {
    lines.push(`NOTE:${bio.replace(/\n/g, '\\n')}`)
  }

  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`)
  }

  if (profile.phone) {
    lines.push(`TEL;TYPE=CELL:${profile.phone}`)
  }

  const photo = profile.image_url || profile.profile_photo_url || profile.logo_url
  if (photo) {
    lines.push(`PHOTO;VALUE=URL:${photo}`)
  }

  if (profile.location) {
    lines.push(`ADR;TYPE=WORK:;;${profile.location.replace(/;/g, ',')};;;;`)
  }

  if (profile.company) {
    lines.push(`ORG:${profile.company}`)
  }
  if (profile.job_title) {
    lines.push(`TITLE:${profile.job_title}`)
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
  return lines.filter(line => line).join('\n')
}

/**
 * GET /api/contacts/[profileId] - Télécharge le fichier vCard du profil
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId: profileIdOrUsername } = await params
    if (!profileIdOrUsername) return NextResponse.json({ error: 'ID ou Username manquant' }, { status: 400 })

    const supabase = await createClient()
    let profile: any = null

    // Déterminer si c'est un UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileIdOrUsername)

    // 1. Chercher dans 'profiles'
    let profileQuery = supabase.from('profiles').select('*')
    if (isUUID) {
      profileQuery = profileQuery.eq('id', profileIdOrUsername)
    } else {
      profileQuery = profileQuery.or(`username.eq.${profileIdOrUsername},custom_url.eq.${profileIdOrUsername}`)
    }
    
    const { data: profileData } = await profileQuery.eq('is_active', true).maybeSingle()

    if (profileData) {
      profile = profileData
    } else {
      // 2. Chercher dans 'digital_nfc_cards'
      let nfcQuery = supabase.from('digital_nfc_cards').select('*')
      if (isUUID) {
        nfcQuery = nfcQuery.eq('id', profileIdOrUsername)
      } else {
        nfcQuery = nfcQuery.or(`username.eq.${profileIdOrUsername},custom_url.eq.${profileIdOrUsername}`)
      }
      
      const { data: nfcData } = await nfcQuery.eq('status', 'active').maybeSingle()
      if (nfcData) profile = nfcData
    }

    if (!profile) {
      console.warn(`Profil non trouvé pour: ${profileIdOrUsername}`)
      return NextResponse.json({ error: 'Profil non trouvé ou non public' }, { status: 404 })
    }

    // Nom de fichier
    const finalName = profile.full_name || profile.name || profile.profile_name || 'contact'
    const fileName = `${finalName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.vcf`

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.app'
    const vcard = generateCompleteVCard(profile, baseUrl)

    const userAgent = request.headers.get('user-agent') || ''
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
    const disposition = isIOS ? 'inline' : 'attachment'

    return new NextResponse(vcard, {
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `${disposition}; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Erreur API contacts:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
