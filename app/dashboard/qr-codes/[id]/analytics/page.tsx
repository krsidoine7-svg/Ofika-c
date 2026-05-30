'use client'

// =====================================================
// PAGE ANALYTICS AVANCÉS POUR UN QR CODE
// Dashboard complet avec métriques, graphiques, exports
// =====================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Badge } from '@/components/core/ui/badge'
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Globe,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Calendar,
  Users,
  Eye,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'
import { getQRAnalytics, getQRScans, exportScansToCSV, type QRAnalytics } from '@/lib/services/qr-analytics'
import {
  ScansTimelineChart,
  ScansHourlyChart,
  DeviceDistributionChart,
  WeeklyDistributionChart,
  CountriesChart
} from '@/components/qr/analytics/AnalyticsCharts'

interface PageProps {
  params: {
    id: string
  }
}

export default function QRAnalyticsPage({ params }: PageProps) {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<QRAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrTitle, setQRTitle] = useState('QR Code')

  useEffect(() => {
    loadAnalytics()
  }, [params.id])

  const loadAnalytics = async () => {
    setLoading(true)
    const result = await getQRAnalytics(params.id)

    if (result.success && result.data) {
      setAnalytics(result.data)
    } else {
      toast.error(result.error || 'Erreur lors du chargement')
    }
    setLoading(false)
  }

  // Export CSV
  const handleExportCSV = async () => {
    try {
      toast.loading('Préparation de l\'export...')

      // Récupérer les scans bruts
      const result = await getQRScans(params.id)

      if (!result.success || !result.data) {
        toast.dismiss()
        toast.error('Erreur lors de la récupération des données')
        return
      }

      const csv = exportScansToCSV(result.data)

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-analytics-${params.id}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast.dismiss()
      toast.success('Export CSV téléchargé')
    } catch (error) {
      console.error('Export error:', error)
      toast.dismiss()
      toast.error('Erreur lors de l\'export')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-orange-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Aucune donnée disponible</p>
          <Button onClick={() => router.back()} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/qr-codes')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-orange-600" />
                Analytics Avancés
              </h1>
              <p className="text-gray-600 mt-1">{qrTitle}</p>
            </div>
          </div>

          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Scans */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Scans</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.total_scans}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.avg_scans_per_day.toFixed(1)} /jour
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visiteurs Uniques */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Visiteurs Uniques</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.unique_visitors}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    IPs distinctes
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aujourd'hui */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aujourd'hui</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.scans_today}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.growth_rate_daily >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <p className={`text-xs ${analytics.growth_rate_daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.growth_rate_daily >= 0 ? '+' : ''}{analytics.growth_rate_daily}% vs hier
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cette Semaine */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cette Semaine</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.scans_this_week}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.growth_rate_weekly >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <p className={`text-xs ${analytics.growth_rate_weekly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.growth_rate_weekly >= 0 ? '+' : ''}{analytics.growth_rate_weekly}% vs semaine dernière
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Évolution des Scans (30 derniers jours)</CardTitle>
              <CardDescription>Tendance quotidienne</CardDescription>
            </CardHeader>
            <CardContent>
              <ScansTimelineChart data={analytics.scans_by_day} />
            </CardContent>
          </Card>

          {/* Distribution horaire */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution par Heure</CardTitle>
              <CardDescription>Pics d'activité</CardDescription>
            </CardHeader>
            <CardContent>
              <ScansHourlyChart data={analytics.scans_by_hour} />
            </CardContent>
          </Card>

          {/* Distribution hebdomadaire */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution par Jour</CardTitle>
              <CardDescription>Jours de la semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyDistributionChart data={analytics.scans_by_day_of_week} />
            </CardContent>
          </Card>

          {/* Devices */}
          <Card>
            <CardHeader>
              <CardTitle>Appareils</CardTitle>
              <CardDescription>Répartition par type</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.top_devices.length > 0 ? (
                <DeviceDistributionChart data={analytics.top_devices} />
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">Aucune donnée</p>
              )}
            </CardContent>
          </Card>

          {/* Top Pays */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pays</CardTitle>
              <CardDescription>Localisation géographique</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.top_countries.length > 0 ? (
                <CountriesChart data={analytics.top_countries} />
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">Aucune donnée géographique</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Systèmes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Top Systèmes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.top_os.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.os || 'Inconnu'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
                {analytics.top_os.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune donnée</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Navigateurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Top Navigateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.top_browsers.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.browser || 'Inconnu'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
                {analytics.top_browsers.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune donnée</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Villes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top Villes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.top_cities.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.city || 'Inconnu'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
                {analytics.top_cities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune donnée géographique</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
