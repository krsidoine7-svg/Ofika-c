'use client'

// =====================================================
// PAGE GESTION DES CAMPAGNES QR
// Vue complète avec statistiques
// =====================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Folder, ArrowLeft, Plus, QrCode, BarChart3, TrendingUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import CampaignManager from '@/components/qr/CampaignManager'
import { getUserCampaigns, getCampaignStats, type QRCampaign } from '@/lib/services/qr-campaigns'

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<QRCampaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<QRCampaign | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Charger les campagnes
  const loadCampaigns = async () => {
    setLoading(true)
    const result = await getUserCampaigns()
    if (result.success && result.data) {
      setCampaigns(result.data)
    } else {
      toast.error(result.error || 'Erreur lors du chargement')
    }
    setLoading(false)
  }

  // Charger les stats d'une campagne
  const loadStats = async (campaignId: string) => {
    const result = await getCampaignStats(campaignId)
    if (result.success && result.data) {
      setStats(result.data)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  useEffect(() => {
    if (selectedCampaign) {
      loadStats(selectedCampaign.id)
    } else {
      setStats(null)
    }
  }, [selectedCampaign])

  // Stats globales
  const totalQRCodes = campaigns.reduce((sum, c) => sum + c.total_qr_codes, 0)
  const totalScans = campaigns.reduce((sum, c) => sum + c.total_scans, 0)

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
                <Folder className="w-8 h-8 text-orange-600" />
                Campagnes QR
              </h1>
              <p className="text-gray-600 mt-1">Organisez vos QR codes par projet</p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/dashboard/qr-codes/new')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau QR Code
          </Button>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Campagnes</p>
                  <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Folder className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">QR Codes</p>
                  <p className="text-3xl font-bold text-gray-900">{totalQRCodes}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Scans</p>
                  <p className="text-3xl font-bold text-gray-900">{totalScans}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layout 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche: Gestionnaire de campagnes */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <CampaignManager
                  selectedCampaignId={selectedCampaign?.id}
                  onSelectCampaign={(id) => {
                    if (id) {
                      const campaign = campaigns.find(c => c.id === id)
                      setSelectedCampaign(campaign || null)
                    } else {
                      setSelectedCampaign(null)
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite: Détails de la campagne sélectionnée */}
          <div className="lg:col-span-2">
            {selectedCampaign ? (
              <div className="space-y-6">
                {/* Header campagne */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: selectedCampaign.color }}
                      >
                        <Folder className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{selectedCampaign.name}</CardTitle>
                        {selectedCampaign.description && (
                          <p className="text-gray-600 mt-1">{selectedCampaign.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <Calendar className="w-3 h-3" />
                          Créée le {new Date(selectedCampaign.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Stats détaillées */}
                {stats && (
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">QR Codes Actifs</p>
                            <p className="text-2xl font-bold text-green-600">
                              {stats.active_qr_codes}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              sur {stats.total_qr_codes} total
                            </p>
                          </div>
                          <QrCode className="w-8 h-8 text-gray-300" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Scans (7j)</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {stats.recent_scans}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {stats.total_scans} total
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-gray-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Actions */}
                <Card>
                  <CardContent className="p-6 space-y-3">
                    <p className="font-semibold text-gray-900 mb-4">Actions rapides</p>
                    
                    <Button
                      onClick={() => router.push(`/dashboard/qr-codes?campaign=${selectedCampaign.id}`)}
                      variant="outline"
                      className="w-full justify-start gap-3"
                    >
                      <QrCode className="w-4 h-4" />
                      Voir les QR codes de cette campagne
                    </Button>

                    <Button
                      onClick={() => router.push('/dashboard/qr-codes/new')}
                      className="w-full justify-start gap-3"
                    >
                      <Plus className="w-4 h-4" />
                      Créer un QR code dans cette campagne
                    </Button>
                  </CardContent>
                </Card>

                {/* Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Astuce:</strong> Les campagnes vous permettent d'organiser vos QR codes par projet, 
                      événement ou client. Les statistiques sont automatiquement agrégées par campagne.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // État vide
              <Card className="h-full">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <Folder className="w-20 h-20 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Sélectionnez une campagne
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Cliquez sur une campagne à gauche pour voir ses détails et statistiques
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard/qr-codes/new')}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Créer un QR Code
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
