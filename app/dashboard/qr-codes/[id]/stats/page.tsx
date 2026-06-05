'use client'

// =====================================================
// PAGE DES STATISTIQUES D'UN QR CODE
// =====================================================

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  QrCode, 
  BarChart3, 
  Smartphone, 
  Globe, 
  Calendar,
  TrendingUp,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { getQRCodeURL, getQRRedirectStats } from '@/lib/services/qr-redirect-client'
import type { QRRedirectStats } from '@/lib/types/qr-redirect'
import Link from 'next/link'

export default function QRCodeStatsPage() {
  const params = useParams()
  const router = useRouter()
  const qrId = params.id as string

  const [stats, setStats] = useState<QRRedirectStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [qrId])

  const loadStats = async () => {
    setLoading(true)
    const result = await getQRRedirectStats(qrId)
    if (result.success && result.data) {
      setStats(result.data)
    } else {
      toast.error(result.error || 'Erreur lors du chargement des statistiques')
      router.push('/dashboard/qr-codes')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/qr-codes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux QR codes
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistiques du QR Code</h1>
        <p className="text-gray-600">Analyse détaillée des scans et de l'utilisation</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total_scans.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <QrCode className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {stats.scans_today.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cette semaine</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.scans_this_week.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ce mois</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {stats.scans_this_month.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Appareils */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Top Appareils
            </CardTitle>
            <CardDescription>Répartition par type d'appareil</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.top_devices.length > 0 ? (
              <div className="space-y-4">
                {stats.top_devices.map((device, index) => {
                  const percentage = stats.total_scans > 0 
                    ? ((device.count / stats.total_scans) * 100).toFixed(1)
                    : 0
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{device.device}</span>
                        <span className="text-sm text-gray-600">
                          {device.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Top Pays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Top Pays
            </CardTitle>
            <CardDescription>Origine géographique des scans</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.top_countries.length > 0 ? (
              <div className="space-y-4">
                {stats.top_countries.map((country, index) => {
                  const percentage = stats.total_scans > 0 
                    ? ((country.count / stats.total_scans) * 100).toFixed(1)
                    : 0
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{country.country}</span>
                        <span className="text-sm text-gray-600">
                          {country.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graphique des scans par jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Évolution des scans (30 derniers jours)
          </CardTitle>
          <CardDescription>Nombre de scans par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1">
            {stats.scans_by_day.map((day, index) => {
              const maxScans = Math.max(...stats.scans_by_day.map(d => d.count), 1)
              const height = (day.count / maxScans) * 100
              
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div className="relative w-full">
                    <div
                      className="w-full bg-orange-500 rounded-t hover:bg-orange-600 transition-all cursor-pointer"
                      style={{ height: `${height * 2}px`, minHeight: day.count > 0 ? '4px' : '0' }}
                      title={`${new Date(day.date).toLocaleDateString('fr-FR')} : ${day.count} scans`}
                    />
                  </div>
                  {index % 5 === 0 && (
                    <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dernier scan */}
      {stats.last_scan && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dernier scan</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(stats.last_scan).toLocaleString('fr-FR', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Actif
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
