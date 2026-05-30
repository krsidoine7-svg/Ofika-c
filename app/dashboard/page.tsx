"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Button } from "@/components/core/ui/button"
import { Badge } from "@/components/core/ui/badge"
import { Alert, AlertDescription } from "@/components/core/ui/alert"
import { useAuth } from "@/lib/hooks/useAuth"
import { useProfiles } from "@/lib/hooks/useProfiles"
import { useCardLogic } from "@/lib/hooks/useNFCCards"
import { User, CreditCard, QrCode, Users, AlertCircle, Info, CheckCircle, TrendingUp, BarChart3, Image as ImageIcon, Upload, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { BetaFeatureModal, useBetaFeature } from "@/components/core/ui/beta-feature-modal"
import { AnalyticsSummary } from "@/components/features/analytics/AnalyticsSummary"
import { useDashboardAnalytics } from "@/lib/hooks/useDashboardAnalytics"
import { useStatsAutoReset } from "@/lib/hooks/useStatsAutoReset"
import { RecentActivity } from "@/components/features/dashboard/RecentActivity"
import { useOrders } from "@/lib/hooks/usePayments"
import { OrderPromptModal } from "@/components/features/card-ordering/OrderPromptModal"


export default function DashboardPage() {
  const { user } = useAuth()
  const { profiles, loading: profilesLoading } = useProfiles()
  const { status: cardLogicStatus, loading: cardLogicLoading } = useCardLogic()
  const router = useRouter()
  const { isModalOpen, featureName, showBetaModal, closeModal } = useBetaFeature()
  const { orders, loading: ordersLoading } = useOrders()

  // Reset automatique des stats tous les 40 jours
  useStatsAutoReset()

  // Récupérer les analytics du dashboard
  const profileIds = useMemo(() => profiles.map(p => p.id), [profiles])
  const { totalScans, loading: analyticsLoading } = useDashboardAnalytics(profileIds)

  // Commande de carte physique
  const handleOrderCard = () => {
    router.push('/dashboard/orders/new')
  }

  // Afficher un loader pendant le chargement
  if (profilesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue sur votre dashboard Ofika
        </h2>
        <p className="text-gray-600">
          Gérez vos profils et commandez vos cartes NFC/QR intelligentes
        </p>
      </div>

      {/* 🎯 ALERTE INFORMATIVE SELON LE STATUT */}
      {!cardLogicLoading && (
        <>
          {/* Notification pour images manquantes */}
          {profiles.length > 0 && profiles.some(p => !p.image_url || !p.cover_image_url) && (
            <Alert className="border-blue-200 bg-blue-50 mb-4">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Améliorez votre profil :</strong> Ajoutez une photo de profil et une photo de couverture pour rendre votre page plus attrayante.
                <div className="flex gap-2 mt-2">
                  {profiles.filter(p => !p.image_url || !p.cover_image_url).map(profile => (
                    <Button
                      key={profile.id}
                      size="sm"
                      variant="outline"
                      className="bg-white hover:bg-blue-100 border-blue-300"
                      onClick={() => router.push(`/dashboard/profiles/${profile.id}/add-images`)}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {profile.name}
                    </Button>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {cardLogicStatus.nextRequiredAction === 'create_profile' && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Première étape :</strong> Créez votre profil professionnel pour commencer à utiliser Ofika.
                <Button
                  size="sm"
                  className="ml-4 bg-orange-500 hover:bg-orange-600"
                  onClick={() => router.push('/dashboard/profiles/create')}
                >
                  Créer mon profil
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {cardLogicStatus.nextRequiredAction === 'create_digital_card' && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Étape suivante :</strong> Créez votre carte numérique avant de pouvoir commander une version physique.
                <Button
                  size="sm"
                  className="ml-4 bg-blue-500 hover:bg-blue-600"
                  onClick={() => router.push('/onboarding/nfc-card')}
                >
                  Créer ma carte numérique
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {cardLogicStatus.nextRequiredAction === 'can_order_physical' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Prêt à commander !</strong> Vous pouvez maintenant commander votre carte physique.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profils créés</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
            <p className="text-xs text-muted-foreground">
              Maximum 3 profils
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartes numériques</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cardLogicLoading ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                cardLogicStatus.digitalCardsCount
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Virtuelles & prêtes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scans totaux</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                totalScans
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Depuis la création
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {profiles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              Analytics de vos profils
            </h3>
            <Link href="/dashboard/analytics">
              <Button
                variant="outline"
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Voir tous les analytics
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <AnalyticsSummary
                key={profile.id}
                profileId={profile.id}
                profileName={profile.name}
                className="h-fit"
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Gauche (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Actions principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Gérer mes profils</CardTitle>
                <CardDescription>
                  Vos liens, bios et designs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => router.push('/dashboard/profiles')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Accéder à mes profils
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Commander une carte</CardTitle>
                <CardDescription>
                  NFC + QR Code physique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleOrderCard}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Commander maintenant
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <RecentActivity />
        </div>

        {/* Colonne Droite (1/3) */}
        <div className="space-y-8">
          {/* Générateur QR Code */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Générateur QR Code</CardTitle>
              <CardDescription>
                Pour vos supports marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => router.push('/dashboard/qr-codes/new')}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Créer un QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Astuce Pro */}
          <Card className="bg-slate-900 text-white border-none relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/50 text-[10px] uppercase tracking-wider">
                Bientôt
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                Astuce Pro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 leading-relaxed">
                Ajoutez votre carte Ofika à votre Apple Wallet ou Google Wallet pour un partage encore plus rapide.
              </p>
              <Button
                variant="link"
                className="text-white p-0 mt-3 h-auto text-sm hover:text-yellow-400 transition-colors"
                onClick={() => showBetaModal('Apple/Google Wallet')}
              >
                Bientôt disponible →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <BetaFeatureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        featureName={featureName}
      />

      <OrderPromptModal 
        hasOrders={orders && orders.length > 0} 
        isLoading={ordersLoading} 
      />
    </div>
  )
}
