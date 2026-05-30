'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Badge } from '@/components/core/ui/badge'
import { 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet, 
  RefreshCw, 
  MapPin, 
  Cpu, 
  History,
  Eye,
  MousePointer,
  QrCode,
  Zap,
  ArrowUpRight,
  Filter
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminGlobalAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/analytics')
      const json = await res.json()
      if (json.success) {
        setData(json)
      } else {
        toast.error(json.error || 'Erreur chargement analytics')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Agrégation des données SaaS...</p>
      </div>
    )
  }

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444']

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-orange-500/10 transition-all duration-1000"></div>
        <div className="relative z-10">
          <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[10px] tracking-[0.2em] px-3 py-1 mb-4 uppercase">
             Global Traffic Insight
          </Badge>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tendances de Trafic SaaS</h1>
          <p className="text-gray-500 mt-2 font-medium max-w-xl">
            Analyse consolidée des interactions physiques (NFC/QR) et digitales sur l'ensemble de la plateforme Ofika.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Button onClick={fetchAnalytics} variant="outline" className="rounded-2xl h-12 border-gray-200 hover:bg-orange-50 hover:text-orange-600 transition-all">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 rounded-2xl h-12 shadow-lg shadow-orange-600/20 font-bold">
             <Filter className="w-4 h-4 mr-2" />
             Filtres Avancés
          </Button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-3xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Eye className="w-6 h-6"/></div>
               <Badge variant="outline" className="border-green-100 text-green-600 bg-green-50 flex items-center gap-1 font-bold"><TrendingUp className="w-3 h-3"/> +24%</Badge>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Interactions (30j)</p>
            <p className="text-4xl font-black text-gray-900 tabular-nums">{data.summary.totalEvents.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform"><QrCode className="w-6 h-6"/></div>
               <Badge variant="outline" className="border-orange-100 text-orange-600 bg-orange-50 font-bold">LIVE</Badge>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Vues de Profils</p>
            <p className="text-4xl font-black text-gray-900 tabular-nums">{data.summary.typeBreakdown.profile_viewed?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform"><MousePointer className="w-6 h-6"/></div>
               <span className="text-[10px] font-bold text-gray-400">CTR {Math.round((data.summary.typeBreakdown.link_clicked / data.summary.totalEvents) * 100 || 0)}%</span>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Clics sur Liens</p>
            <p className="text-4xl font-black text-gray-900 tabular-nums">{data.summary.typeBreakdown.link_clicked?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl group hover:shadow-xl transition-all duration-300 bg-slate-900 text-white overflow-hidden relative">
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-white/10 text-orange-400 rounded-2xl"><Zap className="w-6 h-6"/></div>
               <ArrowUpRight className="text-orange-400 w-5 h-5" />
            </div>
            <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-1">Conversion vCard</p>
            <p className="text-4xl font-black tabular-nums">{data.summary.typeBreakdown.contact_added?.toLocaleString() || 0}</p>
          </CardContent>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -mr-16 -mb-16"></div>
        </Card>
      </div>

      {/* Traffic Growth Chart */}
      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-10">
        <div className="flex items-center justify-between mb-10">
           <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Flux de Trafic Quotidien</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Comparatif Vues vs Actions</p>
           </div>
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                 <span className="text-xs font-bold text-gray-500 underline decoration-orange-500/30 decoration-2 underline-offset-4 uppercase tracking-tighter">Vues</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                 <span className="text-xs font-bold text-gray-500 underline decoration-blue-500/30 decoration-2 underline-offset-4 uppercase tracking-tighter">Interactions</span>
              </div>
           </div>
        </div>
        <div className="h-[400px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                 <defs>
                   <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                     <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="interGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                 <XAxis 
                   dataKey="date" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} 
                   dy={10}
                 />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                 <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                    itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase'}}
                 />
                 <Area type="monotone" dataKey="views" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#viewsGrad)" />
                 <Area type="monotone" dataKey="interactions" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#interGrad)" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </Card>

      {/* Breakdowns Tech & Geo */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* GEO MAP Data simulation */}
         <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden flex flex-col">
            <CardHeader className="p-8 pb-4">
               <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500"/> Géographie Active</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 flex-1 space-y-6">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Top Pays</p>
                 {data.summary.topCountries.map(([name, count]: any, i: number) => (
                   <div key={name} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-black text-gray-200">#0{i+1}</span>
                         <span className="text-sm font-bold text-gray-700">{name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black px-2">{count}</Badge>
                   </div>
                 ))}
              </div>
              <div className="space-y-4 pt-6">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Concentration Villes</p>
                 {data.summary.topCities.map(([name, count]: any) => (
                   <div key={name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                         <span className="text-gray-500">{name}</span>
                         <span>{Math.round((count/data.summary.totalEvents)*100)}%</span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: `${(count/data.summary.totalEvents)*100}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
            </CardContent>
         </Card>

         {/* Device Breakdown */}
         <Card className="border-none shadow-sm rounded-[2.5rem] bg-indigo-900 text-white overflow-hidden p-10 flex flex-col justify-between">
            <div>
               <h3 className="text-xl font-black tracking-tight mb-8">Répartition Appareils</h3>
               <div className="space-y-8">
                  <div className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform"><Smartphone className="w-6 h-6"/></div>
                        <div>
                           <p className="font-black text-sm uppercase tracking-widest">Mobile</p>
                           <p className="text-xs text-white/50">{data.summary.deviceBreakdown.mobile} hits</p>
                        </div>
                     </div>
                     <span className="text-3xl font-black">{Math.round((data.summary.deviceBreakdown.mobile / data.summary.totalEvents) * 100 || 0)}%</span>
                  </div>
                  <div className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform"><Monitor className="w-6 h-6"/></div>
                        <div>
                           <p className="font-black text-sm uppercase tracking-widest">Desktop</p>
                           <p className="text-xs text-white/50">{data.summary.deviceBreakdown.desktop} hits</p>
                        </div>
                     </div>
                     <span className="text-3xl font-black">{Math.round((data.summary.deviceBreakdown.desktop / data.summary.totalEvents) * 100 || 0)}%</span>
                  </div>
                  <div className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform"><Tablet className="w-6 h-6"/></div>
                        <div>
                           <p className="font-black text-sm uppercase tracking-widest">Tablet</p>
                           <p className="text-xs text-white/50">{data.summary.deviceBreakdown.tablet} hits</p>
                        </div>
                     </div>
                     <span className="text-3xl font-black">{Math.round((data.summary.deviceBreakdown.tablet / data.summary.totalEvents) * 100 || 0)}%</span>
                  </div>
               </div>
            </div>
            <div className="pt-10 border-t border-white/10">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 text-center">Top Browser Engine</p>
               <div className="flex justify-center gap-3">
                  {data.summary.topBrowsers.slice(0, 3).map(([name]: any) => (
                    <Badge key={name} className="bg-white/10 hover:bg-white text-white hover:text-indigo-900 border-none font-bold transition-all px-4 py-1.5 rounded-full">{name}</Badge>
                  ))}
               </div>
            </div>
         </Card>

         {/* Top Performing Profiles */}
         <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden p-2 flex flex-col">
            <CardHeader className="p-8 pb-4">
               <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-500"/> Leaders d'Abonnement</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-1 overflow-y-auto">
               {data.topProfiles.map((profile: any, i: number) => (
                 <div key={profile.id} className="p-4 hover:bg-gray-50 rounded-2xl flex items-center justify-between transition-all group">
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-black text-gray-200">0{i+1}</span>
                       <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-sm shrink-0">
                          {profile.name.charAt(0)}
                       </div>
                       <div className="min-w-0">
                          <p className="font-black text-sm truncate text-gray-800">{profile.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">@{profile.username}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-sm text-gray-900">{profile.count}</p>
                       <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Events</p>
                    </div>
                 </div>
               ))}
            </CardContent>
         </Card>
      </div>

      {/* Global Activity Feed */}
      <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden">
         <CardHeader className="p-10 pb-6 border-b border-gray-50 flex flex-row items-center justify-between bg-gray-50/50">
            <div>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">Flux de Trafic Global</h3>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Dernières interactions agrégées</p>
            </div>
            <Badge className="bg-orange-50 text-orange-600 border-none font-black px-4 py-2 rounded-2xl flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"/> LIVE FEED</Badge>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                     <tr>
                        <th className="px-10 py-5">Action</th>
                        <th className="px-10 py-5">Horodatage</th>
                        <th className="px-10 py-5">Localisation</th>
                        <th className="px-10 py-5">Technologie</th>
                        <th className="px-10 py-5 text-right">Adresse IP</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {data.recentEvents.map((ev: any, i: number) => (
                       <tr key={ev.id || i} className="hover:bg-orange-50/30 transition-colors group">
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-3">
                                <span className={cn(
                                  "w-2 h-2 rounded-full",
                                  ev.event_type === 'profile_viewed' ? "bg-orange-500" : "bg-blue-500"
                                )}></span>
                                <span className="font-black text-xs uppercase tracking-tight text-gray-700">{ev.event_type.replace('_', ' ')}</span>
                             </div>
                          </td>
                          <td className="px-10 py-6 text-xs font-bold text-gray-500 tabular-nums">
                             {format(new Date(ev.created_at), 'dd/MM HH:mm:ss')}
                          </td>
                          <td className="px-10 py-6">
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-800">{ev.event_data?.city || 'Inconnu'}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{ev.event_data?.country || 'Inconnu'}</span>
                             </div>
                          </td>
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-2">
                                <div className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{ev.event_data?.browser || 'Browser'}</div>
                                <div className="text-[10px] font-black uppercase text-white bg-slate-800 px-2 py-1 rounded-md">{ev.event_data?.os || 'OS'}</div>
                             </div>
                          </td>
                          <td className="px-10 py-6 text-right tabular-nums font-mono text-[11px] text-blue-600 font-bold">
                             {ev.event_data?.ip || 'MASQUÉ'}
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}
