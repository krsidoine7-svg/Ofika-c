import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLocationFromIP } from '@/lib/services/ip-geolocation'

export const dynamic = 'force-dynamic'

// Stockage en mémoire pour le Rate Limiting (survit entre les appels sur la même instance Vercel/Next)
const rateLimitStore = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { profile_id, event_type, event_data, device_type } = body

    if (!profile_id || !event_type) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // Récupérer l'IP réelle du visiteur
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'

    // --- RATE LIMITING BASIQUE (Anti-Spam) ---
    const now = Date.now()
    const rateLimitKey = `${ip}_${profile_id}_${event_type}`
    const lastRequestTime = rateLimitStore.get(rateLimitKey)

    // Limiter à 1 événement identique toutes les 3 secondes par IP
    if (lastRequestTime && (now - lastRequestTime) < 3000) {
      return NextResponse.json({ error: 'Too many requests (Rate Limited)' }, { status: 429 })
    }
    rateLimitStore.set(rateLimitKey, now)
    // Nettoyage périodique simple
    if (rateLimitStore.size > 10000) rateLimitStore.clear()
    // -----------------------------------------

    // Validation des formats UUID pour la sécurité
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(profile_id)) {
      return NextResponse.json({ error: 'Invalid profile_id format' }, { status: 400 })
    }

    const validEvents = ['profile_viewed', 'link_clicked', 'qr_scanned', 'contact_added', 'share_clicked', 'time_spent']
    if (!validEvents.includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    // L'IP a déjà été récupérée plus haut pour le rate limiting

    // Obtenir la géo via le service serveur existant
    const geo = await getLocationFromIP(ip)
    
    // Fusionner les données envoyées par le client (browser, os) avec les données serveur (ip, geo)
    const finalEventData = {
      ...event_data,
      ip: ip,
      city: geo.city || (geo as any).city_name || 'Inconnu',
      country: geo.country || (geo as any).country_name || 'Inconnu',
    }

    const { error } = await supabase.from('analytics_events').insert({
      profile_id,
      event_type,
      event_data: finalEventData,
      user_agent: request.headers.get('user-agent') || '',
      device_type: device_type || 'desktop'
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Tracking API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
