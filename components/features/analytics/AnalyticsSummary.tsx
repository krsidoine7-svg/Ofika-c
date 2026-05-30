'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Badge } from '@/components/core/ui/badge'
import { Button } from '@/components/core/ui/button'
import { TrendingUp, Eye, MousePointer, QrCode, UserPlus, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getProfileAnalytics } from '@/lib/services/profile-analytics'

interface AnalyticsSummaryProps {
  profileId: string
  profileName: string
  className?: string
}

export function AnalyticsSummary({ profileId, profileName, className }: AnalyticsSummaryProps) {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalClicks: 0,
    totalScans: 0,
    totalContacts: 0,
    last7Days: 0,
    last30Days: 0
  })

  // Charger les vraies données depuis Supabase
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      const result = await getProfileAnalytics(profileId)

      if (result.success && result.data) {
        setAnalytics({
          totalViews: result.data.total_views,
          totalClicks: result.data.total_link_clicks,
          totalScans: result.data.total_qr_scans,
          totalContacts: 0, // À implémenter si besoin
          last7Days: result.data.last_7_days,
          last30Days: result.data.last_30_days
        })
      }
      setLoading(false)
    }

    loadAnalytics()
  }, [profileId])

  const { totalViews, totalClicks, totalScans, totalContacts, last7Days, last30Days } = analytics

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm text-gray-500">Chargement des analytics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Analytics - {profileName}
          </CardTitle>
          <Link href="/dashboard/analytics">
            <Button
              variant="ghost"
              size="sm"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Eye className="w-3 h-3 mr-1" />
              Vues
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalClicks}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <MousePointer className="w-3 h-3 mr-1" />
              Clics
            </div>
          </div>
        </div>

        {/* Actions récentes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cette semaine</span>
            <Badge variant="secondary">{last7Days}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Ce mois</span>
            <Badge variant="outline">{last30Days}</Badge>
          </div>
        </div>

        {/* Actions contacts */}
        {totalContacts > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <UserPlus className="w-4 h-4 mr-1" />
                Actions contacts
              </div>
              <Badge variant="outline">{totalContacts}</Badge>
            </div>
          </div>
        )}

        {/* Scans QR */}
        {totalScans > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <QrCode className="w-4 h-4 mr-1" />
              Scans QR
            </div>
            <Badge variant="outline">{totalScans}</Badge>
          </div>
        )}

        {/* Lien vers analytics détaillées */}
        <div className="pt-3 border-t">
          <Link href="/dashboard/analytics" className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
            >
              Voir tous les analytics
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
