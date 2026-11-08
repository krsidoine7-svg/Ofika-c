import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompleteVCard, type VCardPhoto } from '@/lib/utils/vcard'

export const dynamic = 'force-dynamic'

// Store en mémoire pour le Rate Limiting basique
const rateLimitMap = new Map<string, number[]>()

/**
 * Récupère l'image et l'encode en base64 pour affichage direct dans Apple/Google Contacts
 */
async function fetchPhotoAsBase64(url: string): Promise<VCardPhoto | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const type = contentType.includes('png') ? 'PNG' : 'JPEG'
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    // Limite à 300KB pour que le vCard reste léger et s'ouvre instantanément sur mobile
    if (buffer.length > 300 * 1024) return null
    return {
      base64: buffer.toString('base64'),
      type
    }
  } catch {
    return null
  }
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
    
    // 1. Validation de base
    if (!profileIdOrUsername) return NextResponse.json({ error: 'ID ou Username manquant' }, { status: 400 })
    
    // 2. Sécurité : Sanitization de l'entrée (empêche les injections SQL ou vCard)
    const sanitizedId = profileIdOrUsername.trim().replace(/[^a-zA-Z0-9\-_]/g, '')
    if (sanitizedId !== profileIdOrUsername) {
      return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
    }

    // 3. Rate Limiting très basique en mémoire (Anti-Spam / DDoS)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    if (ip !== 'unknown') {
      const userRequests = rateLimitMap.get(ip) || []
      const recentRequests = userRequests.filter(time => now - time < 60000) // Requêtes dans la dernière minute
      
      if (recentRequests.length >= 20) { // Max 20 vCards générées par minute par IP
        return NextResponse.json({ error: 'Trop de requêtes, veuillez patienter.' }, { status: 429 })
      }
      
      recentRequests.push(now)
      rateLimitMap.set(ip, recentRequests)
    }

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

    // Récupérer et convertir la photo en base64 pour affichage direct dans Apple Contacts et Android
    const photoUrl = profile.image_url || profile.profile_photo_url || profile.logo_url
    let base64Photo: VCardPhoto | null = null
    if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('http')) {
      base64Photo = await fetchPhotoAsBase64(photoUrl)
    }

    const vcard = generateCompleteVCard(profile, baseUrl, base64Photo)

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
