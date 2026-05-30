import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Admin Check (assuming business logic handles role validation)
    const { data: isAdmin } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
    if (!isAdmin) {
       // Optional: fall back to checking user role in users table if admin_users is just a list
       const { data: userRole } = await supabase.from('users').select('role').eq('id', user.id).single()
       if (userRole?.role !== 'admin') {
         return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
       }
    }

    // 1. Fetch All Analytics Events
    // We limit to last 30 days for performance in global view
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('event_type, event_data, device_type, created_at, profile_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (eventsError) throw eventsError

    // 2. Aggregate Data
    const totalEvents = events?.length || 0
    const typeBreakdown: Record<string, number> = {}
    const deviceBreakdown: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 }
    const countryBreakdown: Record<string, number> = {}
    const cityBreakdown: Record<string, number> = {}
    const browserBreakdown: Record<string, number> = {}
    const osBreakdown: Record<string, number> = {}
    const dailyStats: Record<string, { views: number; interactions: number }> = {}

    events?.forEach(event => {
      // Type
      typeBreakdown[event.event_type] = (typeBreakdown[event.event_type] || 0) + 1
      
      // Device
      if (event.device_type) {
        deviceBreakdown[event.device_type] = (deviceBreakdown[event.device_type] || 0) + 1
      }

      // Metadata (JSONB)
      const data = event.event_data || {}
      const country = data.country || 'Inconnu'
      const city = data.city || 'Inconnu'
      const browser = data.browser || 'Inconnu'
      const os = data.os || 'Inconnu'

      countryBreakdown[country] = (countryBreakdown[country] || 0) + 1
      cityBreakdown[city] = (cityBreakdown[city] || 0) + 1
      browserBreakdown[browser] = (browserBreakdown[browser] || 0) + 1
      osBreakdown[os] = (osBreakdown[os] || 0) + 1

      // Daily
      const date = event.created_at.split('T')[0]
      if (!dailyStats[date]) dailyStats[date] = { views: 0, interactions: 0 }
      if (event.event_type === 'profile_viewed') {
        dailyStats[date].views++
      } else {
        dailyStats[date].interactions++
      }
    })

    // 3. Profiles Performance
    const profileStats: Record<string, number> = {}
    events?.forEach(event => {
       profileStats[event.profile_id] = (profileStats[event.profile_id] || 0) + 1
    })

    // Fetch profile names for top 10
    const topProfileIds = Object.entries(profileStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => id)

    const { data: profileNames } = await supabase
      .from('profiles')
      .select('id, name, username')
      .in('id', topProfileIds)

    const topProfiles = topProfileIds.map(id => {
      const p = profileNames?.find(n => n.id === id)
      return {
        id,
        name: p?.name || 'Inconnu',
        username: p?.username || 'unknown',
        count: profileStats[id]
      }
    })

    // 4. Transform for Charting
    const chartData = Object.entries(dailyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({
        date: date.split('-').slice(1).reverse().join('/'), // DD/MM (partially)
        views: stats.views,
        interactions: stats.interactions
      }))

    return NextResponse.json({
      success: true,
      summary: {
        totalEvents,
        typeBreakdown,
        deviceBreakdown,
        topCountries: Object.entries(countryBreakdown).sort(([,a],[,b]) => b-a).slice(0, 5),
        topCities: Object.entries(cityBreakdown).sort(([,a],[,b]) => b-a).slice(0, 5),
        topBrowsers: Object.entries(browserBreakdown).sort(([,a],[,b]) => b-a).slice(0, 5),
        topOS: Object.entries(osBreakdown).sort(([,a],[,b]) => b-a).slice(0, 5)
      },
      chartData,
      topProfiles,
      recentEvents: events?.slice(0, 20) || []
    })

  } catch (error: any) {
    console.error('Admin Analytics API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
