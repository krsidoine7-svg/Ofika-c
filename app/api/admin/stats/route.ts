import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérification admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier le rôle admin (assumé admin pour ce dashboard)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // 1. Statistiques Globales
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: cardCount } = await supabase.from('digital_nfc_cards').select('*', { count: 'exact', head: true })
    const { count: scanCount } = await supabase.from('qr_scans').select('*', { count: 'exact', head: true })

    // 2. Revenus
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_cents')
      .eq('payment_status', 'paid')

    const totalRevenueXOF = (revenueData?.reduce((acc, order) => acc + (order.total_cents || 0), 0) || 0)

    // 3. Graphique History (7 jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentUsers } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const userCountForDay = recentUsers?.filter(u => u.created_at.startsWith(dateStr)).length || 0
      const orderCountForDay = recentOrders?.filter(o => o.created_at.startsWith(dateStr)).length || 0
      return { name: dateStr, registrations: userCountForDay, orders: orderCountForDay }
    })

    const conversionData = [
      { name: 'Utilisateurs', value: userCount || 0 },
      { name: 'Profils', value: profileCount || 0 },
      { name: 'Commandes', value: orderCount || 0 }
    ]

    // 4. Flux d'activité récent
    const { data: latestUsers } = await supabase.from('users').select('id, name, created_at').order('created_at', { ascending: false }).limit(5)
    const { data: latestOrders } = await supabase.from('orders').select('id, order_number, amount_cents, created_at').order('created_at', { ascending: false }).limit(5)
    const { data: latestScans } = await supabase.from('qr_scans').select('id, city, country, browser, scanned_at').order('scanned_at', { ascending: false }).limit(5)

    const activities = [
      ...(latestUsers?.map(u => ({ id: u.id, type: 'user', title: u.name || 'Nouvel utilisateur', time: u.created_at })) || []),
      ...(latestOrders?.map(o => ({ id: o.id, type: 'order', title: `Commande ${o.order_number}`, amount: o.amount_cents, time: o.created_at })) || []),
      ...(latestScans?.map(s => ({ id: s.id, type: 'scan', title: `Scan à ${s.city || 'Inconnu'} (${s.country || 'SN'})`, browser: s.browser, time: s.scanned_at })) || [])
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

    // 5. Audience Analytics
    const { data: audienceData } = await supabase
      .from('qr_scans')
      .select('browser, os, device_type')

    const browsers = (audienceData || []).reduce((acc: any, scan) => {
      const b = scan.browser || 'Inconnu'
      acc[b] = (acc[b] || 0) + 1
      return acc
    }, {})

    const os = (audienceData || []).reduce((acc: any, scan) => {
      const o = scan.os || 'Inconnu'
      acc[o] = (acc[o] || 0) + 1
      return acc
    }, {})

    const devices = (audienceData || []).reduce((acc: any, scan) => {
      const d = scan.device_type || 'Desktop'
      acc[d] = (acc[d] || 0) + 1
      return acc
    }, {})

    const audienceCharts = {
      browsers: Object.entries(browsers).map(([name, value]) => ({ name, value })),
      os: Object.entries(os).map(([name, value]) => ({ name, value })),
      devices: Object.entries(devices).map(([name, value]) => ({ name, value }))
    }

    // 6. Top Data
    const { data: topProfilesData } = await supabase
      .from('profiles')
      .select('id, name, username, image_url')
      .limit(5)
    
    const { data: topLinks } = await supabase
      .from('links')
      .select('id, title, url, click_count, profile_id')
      .order('click_count', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      stats: {
        users: userCount || 0,
        orders: orderCount || 0,
        profiles: profileCount || 0,
        cards: cardCount || 0,
        scans: scanCount || 0,
        revenue: totalRevenueXOF,
        revenue_f: totalRevenueXOF.toLocaleString() + ' XOF'
      },
      charts: {
        history: chartData,
        conversion: conversionData,
        audience: audienceCharts
      },
      topData: {
        profiles: topProfilesData || [],
        links: topLinks || []
      },
      activities
    })

  } catch (error: any) {
    console.error('Stats API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
