'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Badge } from '@/components/core/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/core/ui/select'
import { Calendar } from '@/components/core/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/core/ui/popover'
import {
  TrendingUp,
  Eye,
  MousePointer,
  QrCode,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Calendar as CalendarIcon,
  Filter,
  BarChart3,
  PieChart,
  RefreshCw,
  UserPlus,
  MapPin,
  Cpu,
  History
} from 'lucide-react'
import { ProtectedRoute } from '@/components/core/auth/ProtectedRoute'
import { useProfiles } from '@/lib/hooks/useProfiles'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getProfileAnalytics } from '@/lib/services/profile-analytics'
import { AnalyticsChart } from '@/components/features/analytics/AnalyticsChart'

interface AnalyticsData {
  profileId: string
  profileName: string
  totalViews: number
  totalLinkClicks: number
  totalQRScans: number
  totalContactActions: number
  deviceBreakdown: {
    mobile: number
    desktop: number
    tablet: number
  }
  countries: Record<string, number>
  cities: Record<string, number>
  browsers: Record<string, number>
  oss: Record<string, number>
  last30Days: number
  last7Days: number
  recentEvents: any[]
}

export default function AnalyticsPage() {
  const { profiles, loading: profilesLoading } = useProfiles()
  const [selectedProfile, setSelectedProfile] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  const loadAnalytics = async () => {
    if (!profiles.length) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data: AnalyticsData[] = []
      let aggregatedDaily: Record<string, { views: number; scans: number; clicks: number; contacts: number }> = {}

      for (const profile of profiles) {
        const result = await getProfileAnalytics(profile.id)

        if (result.success && result.data) {
          data.push({
            profileId: profile.id,
            profileName: profile.name,
            totalViews: result.data.total_views,
            totalLinkClicks: result.data.total_link_clicks,
            totalQRScans: result.data.total_qr_scans,
            totalContactActions: result.data.total_contact_actions,
            deviceBreakdown: result.data.device_breakdown,
            countries: result.data.countries,
            cities: result.data.cities,
            browsers: result.data.browsers,
            oss: result.data.oss,
            last30Days: result.data.last_30_days,
            last7Days: result.data.last_7_days,
            recentEvents: result.data.recent_events || []
          })

          result.data.daily_data.forEach(day => {
            if (!aggregatedDaily[day.date]) {
              aggregatedDaily[day.date] = { views: 0, scans: 0, clicks: 0, contacts: 0 }
            }
            aggregatedDaily[day.date].views += day.views
            aggregatedDaily[day.date].scans += day.scans
            aggregatedDaily[day.date].clicks += day.clicks
            aggregatedDaily[day.date].contacts += day.contacts
          })
        }
      }

      setAnalyticsData(data)

      const chartValues = Object.entries(aggregatedDaily).map(([date, counts]) => ({
          date,
          views: counts.views,
          scans: counts.scans,
          clicks: counts.clicks,
          contacts: counts.contacts
      }))

      if (chartValues.length === 0) {
        const emptyChart = Array.from({ length: 30 }).map((_, i) => ({
          date: format(subDays(new Date(), 29 - i), 'dd/MM'),
          views: 0,
          scans: 0,
          clicks: 0,
          contacts: 0
        }))
        setChartData(emptyChart)
      } else {
        setChartData(chartValues)
      }

    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Erreur lors du chargement des analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [profiles])

  const filteredData = selectedProfile === 'all'
    ? analyticsData
    : analyticsData.filter(data => data.profileId === selectedProfile)

  const totals = filteredData.reduce((acc, data) => {
    // Calculer les totaux globaux et fusionner les dictionnaires Record
    const mergeDict = (target: Record<string, number>, source: Record<string, number>) => {
      Object.entries(source).forEach(([key, val]) => {
        target[key] = (target[key] || 0) + val
      })
      return target
    }

    return {
      totalViews: acc.totalViews + data.totalViews,
      totalLinkClicks: acc.totalLinkClicks + data.totalLinkClicks,
      totalQRScans: acc.totalQRScans + data.totalQRScans,
      totalContactActions: acc.totalContactActions + data.totalContactActions,
      mobile: acc.mobile + data.deviceBreakdown.mobile,
      desktop: acc.desktop + data.deviceBreakdown.desktop,
      tablet: acc.tablet + data.deviceBreakdown.tablet,
      countries: mergeDict(acc.countries, data.countries),
      cities: mergeDict(acc.cities, data.cities),
      browsers: mergeDict(acc.browsers, data.browsers),
      oss: mergeDict(acc.oss, data.oss),
      recentEvents: [...acc.recentEvents, ...data.recentEvents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50)
    }
  }, { 
    totalViews: 0, totalLinkClicks: 0, totalQRScans: 0, totalContactActions: 0, 
    mobile: 0, desktop: 0, tablet: 0, 
    countries: {} as Record<string, number>, 
    cities: {} as Record<string, number>,
    browsers: {} as Record<string, number>,
    oss: {} as Record<string, number>,
    recentEvents: [] as any[]
  })

  // Helper to sort and slice dictionary for top lists
  const getTopList = (dict: Record<string, number>, limit = 5) => {
    return Object.entries(dict)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
  }

  if (profilesLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500" />
            <p className="text-gray-600">Calcul des statistiques détaillées...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  <BarChart3 className="w-8 h-8 mr-3 inline text-orange-500" />
                  Tableau de Bord Analytics
                </h1>
                <p className="text-gray-600 mt-1">Données en temps réel de vos interactions physiques et digitales.</p>
              </div>
              <Button onClick={loadAnalytics} variant="outline" className="h-11 shadow-sm"><RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser</Button>
            </div>
          </div>

          {/* Filtres & Stats Rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
             <Card className="col-span-1 md:col-span-1">
                <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-gray-500 tracking-widest">Filtre Profil</CardTitle></CardHeader>
                <CardContent>
                  <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                    <SelectTrigger className="border-none bg-gray-100"><SelectValue placeholder="Tous les profils" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Global</SelectItem>
                      {profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
             </Card>
             
             {/* Key Metrics Cards */}
             {[
               { label: 'Visites', value: totals.totalViews, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
               { label: 'Scans QR', value: totals.totalQRScans, icon: QrCode, color: 'text-orange-600', bg: 'bg-orange-50' },
               { label: 'Clics Liens', value: totals.totalLinkClicks, icon: MousePointer, color: 'text-green-600', bg: 'bg-green-50' }
             ].map((stat, i) => (
               <Card key={i} className="group hover:shadow-md transition-shadow">
                 <CardContent className="p-6 flex items-center justify-between">
                   <div>
                     <p className="text-xs font-bold uppercase text-gray-500 mb-1">{stat.label}</p>
                     <p className={`text-3xl font-black ${stat.color}`}>{stat.value.toLocaleString()}</p>
                   </div>
                   <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                     <stat.icon className="w-6 h-6" />
                   </div>
                 </CardContent>
               </Card>
             ))}
          </div>

          {/* Graphique Main */}
          <div className="mb-8">
            <AnalyticsChart data={chartData} loading={loading} title="Volume d'interactions" description="Vues vs Scans sur les 30 derniers jours" />
          </div>

          {/* NOUVELLES STATS: GEO & TECH */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* GÉOGRAPHIE */}
            <Card className="border-none shadow-sm overflow-hidden">
               <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-6 pt-6">
                 <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5"/> Top Géographie</CardTitle>
                 <CardDescription className="text-blue-100">Origine de vos visiteurs</CardDescription>
               </CardHeader>
               <CardContent className="p-0">
                 <div className="p-6 space-y-4">
                   <div className="space-y-3">
                     <p className="text-xs font-bold uppercase text-gray-400 border-b pb-2">Pays</p>
                     {getTopList(totals.countries).map(([name, count]) => (
                       <div key={name} className="flex justify-between items-center group">
                         <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-3 h-3 text-gray-400"/> {name}</span>
                         <Badge variant="secondary" className="px-2">{count}</Badge>
                       </div>
                     ))}
                   </div>
                   <div className="space-y-3 pt-4">
                     <p className="text-xs font-bold uppercase text-gray-400 border-b pb-2">Villes</p>
                     {getTopList(totals.cities).map(([name, count]) => (
                       <div key={name} className="flex justify-between items-center">
                         <span className="text-sm text-gray-600">{name}</span>
                         <span className="text-xs font-bold">{Math.round((count/totals.totalViews)*100)}%</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </CardContent>
            </Card>

            {/* APPAREILS */}
            <Card className="border-none shadow-sm overflow-hidden">
               <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white pb-6 pt-6">
                 <CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5"/> Appareils</CardTitle>
                 <CardDescription className="text-orange-100">Supports de consultation</CardDescription>
               </CardHeader>
               <CardContent className="p-6">
                 <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Monitor className="text-blue-500"/> <span className="font-bold">Ordinateur</span></div>
                      <span className="font-black text-xl">{totals.desktop}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Smartphone className="text-green-500"/> <span className="font-bold">Mobile</span></div>
                      <span className="font-black text-xl">{totals.mobile}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Tablet className="text-purple-500"/> <span className="font-bold">Tablette</span></div>
                      <span className="font-black text-xl">{totals.tablet}</span>
                   </div>
                   
                   <div className="pt-6 border-t">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">Top Systèmes</p>
                      <div className="grid grid-cols-2 gap-2">
                        {getTopList(totals.oss, 4).map(([os, count]) => (
                          <div key={os} className="bg-gray-50 p-2 rounded-lg text-center">
                            <p className="text-[10px] text-gray-400 uppercase font-black">{os}</p>
                            <p className="font-bold text-sm">{count}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                 </div>
               </CardContent>
            </Card>

            {/* NAVIGATEURS */}
            <Card className="border-none shadow-sm overflow-hidden">
               <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-6 pt-6">
                 <CardTitle className="flex items-center gap-2"><Cpu className="w-5 h-5"/> Technologie</CardTitle>
                 <CardDescription className="text-gray-400">Navigateurs utilisés</CardDescription>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="space-y-4">
                     {getTopList(totals.browsers).map(([browser, count]) => (
                       <div key={browser} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold group">
                            <span className="text-gray-600 group-hover:text-orange-500 transition-colors">{browser}</span>
                            <span>{Math.round((count/totals.totalViews)*100)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(count/totals.totalViews)*100}%` }}></div>
                          </div>
                       </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* HISTORIQUE DÉTAILLÉ (LOGS) */}
          <Card className="border-none shadow-sm overflow-hidden mb-8">
             <CardHeader className="border-b bg-white">
                <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-gray-400"/> Dernières Activités</CardTitle>
                <CardDescription>Journal des 50 dernières interactions sur vos profils</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                         <tr>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Localisation</th>
                            <th className="px-6 py-4">Appareil & OS</th>
                            <th className="px-6 py-4">IP</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                         {totals.recentEvents.map((ev, i) => (
                           <tr key={ev.id || i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                 <Badge variant={ev.event_type === 'profile_viewed' ? 'outline' : 'secondary'} className="capitalize whitespace-nowrap">
                                    {ev.event_type.replace('_', ' ')}
                                 </Badge>
                              </td>
                              <td className="px-6 py-4 text-gray-500 tabular-nums">
                                 {format(new Date(ev.created_at), 'dd MMM HH:mm', { locale: fr })}
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col">
                                    <span className="font-bold">{ev.event_data?.city || 'Inconnu'}</span>
                                    <span className="text-[10px] text-gray-400">{ev.event_data?.country || 'Inconnu'}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col">
                                    <span className="text-xs">{ev.event_data?.browser || ev.device_type}</span>
                                    <span className="text-[10px] text-gray-400 uppercase">{ev.event_data?.os || 'N/A'}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-blue-500">
                                 {ev.event_data?.ip || 'Particulier'}
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                {totals.recentEvents.length === 0 && (
                   <div className="p-12 text-center text-gray-400">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      <p>Aucune activité enregistrée pour le moment.</p>
                   </div>
                )}
             </CardContent>
          </Card>

        </div>
      </div>
    </ProtectedRoute>
  )
}
