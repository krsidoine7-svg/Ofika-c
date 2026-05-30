import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLocationFromIP } from '@/lib/services/ip-geolocation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { profile_id, event_type, event_data, device_type } = body

    if (!profile_id || !event_type) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // Récupérer l'IP réelle du visiteur
    // Sur Vercel/Next, x-forwarded-for est la norme
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'

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
