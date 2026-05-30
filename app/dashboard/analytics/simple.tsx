'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Badge } from '@/components/core/ui/badge'
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  QrCode, 
  UserPlus,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { ProtectedRoute } from '@/components/core/auth/ProtectedRoute'
import { useProfiles } from '@/lib/hooks/useProfiles'
import { BetaFeatureModal, useBetaFeature } from "@/components/core/ui/beta-feature-modal"

export default function SimpleAnalyticsPage() {
  const { profiles, loading: profilesLoading } = useProfiles()
  const { isModalOpen, featureName, showBetaModal, closeModal } = useBetaFeature()
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Générer des données de test
  const generateTestData = () => {
    if (!profiles.length) return []

    return profiles.map(profile => ({
      profileId: profile.id,
      profileName: profile.name,
      totalViews: Math.floor(Math.random() * 100) + 10,
      totalClicks: Math.floor(Math.random() * 50) + 5,
      totalScans: Math.floor(Math.random() * 30) + 2,
      totalContacts: Math.floor(Math.random() * 20) + 1,
      last7Days: Math.floor(Math.random() * 15) + 1,
      last30Days: Math.floor(Math.random() * 50) + 5,
      deviceBreakdown: {
        mobile: Math.floor(Math.random() * 60) + 20,
        desktop: Math.floor(Math.random() * 40) + 10,
        tablet: Math.floor(Math.random() * 10) + 2
      }
    }))
  }

  useEffect(() => {
    if (profiles.length > 0) {
      setAnalyticsData(generateTestData())
      setLoading(false)
    } else if (!profilesLoading) {
      setLoading(false)
    }
  }, [profiles, profilesLoading])

  const refreshData = () => {
    showBetaModal('Analytics et Données')
  }

  // Calculer les totaux
  const totals = analyticsData.reduce((acc, data) => ({
    totalViews: acc.totalViews + data.totalViews,
    totalClicks: acc.totalClicks + data.totalClicks,
    totalScans: acc.totalScans + data.totalScans,
    totalContacts: acc.totalContacts + data.totalContacts,
    mobile: acc.mobile + data.deviceBreakdown.mobile,
    desktop: acc.desktop + data.deviceBreakdown.desktop,
    tablet: acc.tablet + data.deviceBreakdown.tablet
  }), { totalViews: 0, totalClicks: 0, totalScans: 0, totalContacts: 0, mobile: 0, desktop: 0, tablet: 0 })

  if (profilesLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500" />
            <p className="text-gray-600">Chargement des analytics...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-orange-500" />
                Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Analysez les performances de vos profils et cartes
              </p>
            </div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {analyticsData.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Aucun profil trouvé</h3>
                <p className="text-gray-600">Créez votre premier profil pour voir les analytics</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.totalViews}</div>
                    <p className="text-xs text-muted-foreground">
                      +{totals.totalViews} depuis le début
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clics sur liens</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.totalClicks}</div>
                    <p className="text-xs text-muted-foreground">
                      {totals.totalViews > 0 ? Math.round((totals.totalClicks / totals.totalViews) * 100) : 0}% de taux de clic
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scans QR</CardTitle>
                    <QrCode className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.totalScans}</div>
                    <p className="text-xs text-muted-foreground">
                      {totals.totalViews > 0 ? Math.round((totals.totalScans / totals.totalViews) * 100) : 0}% de taux de scan
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Actions contacts</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.totalContacts}</div>
                    <p className="text-xs text-muted-foreground">
                      Téléchargements + partages
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Détails par profil */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyticsData.map((data) => (
                  <Card key={data.profileId}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                        {data.profileName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Statistiques principales */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{data.totalViews}</div>
                          <div className="text-xs text-gray-500">Vues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{data.totalClicks}</div>
                          <div className="text-xs text-gray-500">Clics</div>
                        </div>
                      </div>

                      {/* Actions récentes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Cette semaine</span>
                          <Badge variant="secondary">{data.last7Days}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ce mois</span>
                          <Badge variant="outline">{data.last30Days}</Badge>
                        </div>
                      </div>

                      {/* Actions contacts */}
                      {data.totalContacts > 0 && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <UserPlus className="w-4 h-4 mr-1" />
                              Actions contacts
                            </div>
                            <Badge variant="outline">{data.totalContacts}</Badge>
                          </div>
                        </div>
                      )}

                      {/* Scans QR */}
                      {data.totalScans > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <QrCode className="w-4 h-4 mr-1" />
                            Scans QR
                          </div>
                          <Badge variant="outline">{data.totalScans}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      <BetaFeatureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        featureName={featureName}
      />
    </ProtectedRoute>
  )
}
