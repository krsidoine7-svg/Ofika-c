"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/hooks/useAuth"
import { useUser } from "@/lib/hooks/useUser"
import { useProfiles } from "@/lib/hooks/useProfiles"
import { useCardLogic } from "@/lib/hooks/useNFCCards"
import { 
  User, 
  CreditCard, 
  QrCode, 
  Users, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  TrendingUp, 
  BarChart3, 
  ImageIcon, 
  Upload, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Smartphone, 
  Wifi,
  ChevronRight,
  Eye,
  Settings,
  Activity,
  Calendar as CalendarIcon,
  Bell
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useEffect } from "react"
import { BetaFeatureModal, useBetaFeature } from "@/components/ui/beta-feature-modal"
import { AnalyticsSummary } from "@/components/features/analytics/AnalyticsSummary"
import { useDashboardAnalytics } from "@/lib/hooks/useDashboardAnalytics"
import { useStatsAutoReset } from "@/lib/hooks/useStatsAutoReset"
import { RecentActivity } from "@/components/features/dashboard/RecentActivity"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { getProfileAnalytics } from '@/lib/services/profile-analytics'
import { MousePointer, Loader2 } from "lucide-react"
import { useOrders } from "@/lib/hooks/usePayments"
import { OrderPromptModal } from "@/components/features/card-ordering/OrderPromptModal"
import { ProfileWithLinks, Profile } from "@/lib/types/database"
import { ProfileVisualsBanner } from "@/components/features/dashboard/ProfileVisualsBanner"
import { WalletHubModal } from "@/components/features/dashboard/WalletHubModal"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"

interface ProfileRowProps {
  profile: ProfileWithLinks
  index: number
  onEdit: (profileId: string) => void
  onView: (profile: ProfileWithLinks) => void
}

function ProfileRow({ profile, index, onEdit, onView }: ProfileRowProps) {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalClicks: 0,
    last7Days: 0,
    last30Days: 0
  })

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const result = await getProfileAnalytics(profile.id)
        if (result.success && result.data) {
          setAnalytics({
            totalViews: result.data.total_views || 0,
            totalClicks: result.data.total_link_clicks || 0,
            last7Days: result.data.last_7_days || 0,
            last30Days: result.data.last_30_days || 0
          })
        }
      } catch (err) {
        console.error("Error loading inline analytics:", err)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [profile.id])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition-all duration-200 gap-4 group/prof">
      {/* 1. Left Column: Avatar + Profile Name & Username */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden relative shrink-0 flex items-center justify-center">
          {profile.image_url ? (
            <img 
              src={profile.image_url} 
              alt={profile.name} 
              className="w-full h-full object-cover group-hover/prof:scale-105 transition-transform duration-300"
            />
          ) : (
            <User className="w-5 h-5 text-gray-300" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-gray-900 truncate leading-tight group-hover/prof:text-orange-600 transition-colors">
              {profile.name}
            </h4>
            {profile.is_public && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-medium shrink-0">
                Public
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-400 font-normal truncate mt-0.5">
            ofika.ci/{profile.custom_url || profile.username || profile.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* 2. Middle Column: Inline Mini Analytics Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {!loading && (
          <>
            {/* Total Vues badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-700 text-xs shrink-0">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-400 font-normal">Vues :</span>
              <span className="font-semibold text-gray-900">{analytics.totalViews}</span>
            </div>

            {/* Cette semaine badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50/70 border border-amber-100/70 text-amber-800 text-xs shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-600/80 font-normal">7j :</span>
              <span className="font-semibold text-amber-900">{analytics.last7Days}</span>
            </div>

            {/* Ce mois badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50/70 border border-purple-100/70 text-purple-800 text-xs shrink-0">
              <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-purple-600/80 font-normal">30j :</span>
              <span className="font-semibold text-purple-900">{analytics.last30Days}</span>
            </div>
          </>
        )}
      </div>

      {/* 3. Right Column: Action Buttons & Analytics Link */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50 shrink-0">
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-600 hover:text-gray-950 hover:bg-gray-50 text-xs font-medium rounded-lg h-8 px-3 transition-colors"
            onClick={() => onEdit(profile.id)}
          >
            Gérer
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-gray-200 text-gray-700 hover:text-gray-950 hover:bg-gray-50 text-xs font-medium rounded-lg h-8 px-3 flex items-center justify-center gap-1 transition-all"
            onClick={() => onView(profile)}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Voir</span>
          </Button>
        </div>

        <Link href="/dashboard/analytics" className="transition-transform hover:scale-[1.02]">
          <span className="text-[10px] font-medium bg-orange-50 hover:bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md border border-orange-100 transition-all flex items-center gap-1 cursor-pointer">
            Analytics
            <ArrowRight className="w-3 h-3 text-orange-500" />
          </span>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { getUserData } = useUser()
  const { profiles, loading: profilesLoading } = useProfiles()
  const { status: cardLogicStatus, loading: cardLogicLoading } = useCardLogic()
  const router = useRouter()
  const { isModalOpen, featureName, showBetaModal, closeModal } = useBetaFeature()
  const { orders, loading: ordersLoading } = useOrders()
  const [showWalletHubModal, setShowWalletHubModal] = useState(false)
  const [selectedProfileForWallet, setSelectedProfileForWallet] = useState<Profile | null>(null)
  const [dashboardDate, setDashboardDate] = useState<Date | undefined>(new Date())
  const [firstName, setFirstName] = useState<string | null>(null)

  useEffect(() => {
    getUserData().then((res: any) => {
      const data = res?.data || res
      if (data?.first_name) {
        setFirstName(data.first_name)
      } else if (data?.name) {
        setFirstName(data.name.split(' ')[0])
      }
    })
  }, [getUserData])

  // Reset automatique des stats tous les 40 jours
  useStatsAutoReset()

  // Récupérer les analytics du dashboard
  const profileIds = useMemo(() => profiles.map(p => p.id), [profiles])
  const { totalScans, loading: analyticsLoading } = useDashboardAnalytics(profileIds)

  // Commande de carte physique
  const handleOrderCard = () => {
    router.push('/dashboard/orders/new')
  }

  // Prévisualisation/Visualisation de profil
  const handleViewProfile = (profile: ProfileWithLinks) => {
    if (profile.custom_url || profile.username) {
      window.open(`/${profile.custom_url || profile.username}`, '_blank', 'noopener,noreferrer')
    }
  }

  // Afficher un loader pendant le chargement
  if (profilesLoading) {
    return (
      <div className="h-full min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-neutral-500 font-medium text-sm animate-pulse">Chargement de votre espace Ofika...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-white max-w-7xl mx-auto overflow-hidden pb-12">
      {/* 🌟 Bannière incitative visuels Signature Ofika tout en haut */}
      <ProfileVisualsBanner incompleteProfiles={profiles.filter(p => !p.image_url || !p.cover_image_url)} />

      {/* En-tête de bienvenue moderne et épuré blanc */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Espace Client</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-950">
            Bonjour, {firstName || user?.user_metadata?.first_name || user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos profils, analysez vos partages et configurez vos cartes intelligentes NFC.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" asChild className="h-9 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-950 text-xs">
            <Link href="/dashboard/profiles" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>Mes Profils</span>
            </Link>
          </Button>
          <Button 
            size="sm"
            onClick={handleOrderCard}
            className="h-9 bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs px-3.5 flex items-center gap-1.5 transition-all shadow-none"
          >
            <CreditCard className="w-4 h-4" />
            <span>Commander NFC</span>
          </Button>
        </div>
      </div>

      {/* Alertes d'onboarding épurées */}
      {!cardLogicLoading && (
        <div className="space-y-3">
          {cardLogicStatus.nextRequiredAction === 'create_profile' && (
            <div className="border border-orange-100 bg-orange-50/40 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Activez votre présence Ofika</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Créez votre tout premier profil professionnel pour commencer à le partager.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs h-8 px-3 rounded-lg shrink-0"
                onClick={() => router.push('/dashboard/profiles/create')}
              >
                Créer mon profil
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          )}

          {cardLogicStatus.nextRequiredAction === 'create_digital_card' && (
            <div className="border border-gray-200 bg-gray-50/60 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Configurez votre carte numérique</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Préparez votre profil Ofika avant de commander votre carte physique NFC.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-black text-white font-medium text-xs h-8 px-3 rounded-lg shrink-0"
                onClick={() => router.push('/onboarding/nfc-card')}
              >
                Créer ma carte
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          )}

          {cardLogicStatus.nextRequiredAction === 'can_order_physical' && (
            <div className="border border-emerald-100 bg-emerald-50/40 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Profil complet et prêt !</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Associez une carte connectée NFC physique haut de gamme à votre profil.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs h-8 px-3 rounded-lg shrink-0"
                onClick={handleOrderCard}
              >
                Commander la carte NFC
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Grille de statistiques 100% Blanc Pur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-300 transition-all bg-white p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Profils Actifs</span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:text-orange-600 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
              <User className="h-4 w-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-gray-950 tracking-tight">{profiles.length}</div>
          <p className="text-xs text-gray-400 mt-2">
            Limite : 3 profils
          </p>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-300 transition-all bg-white p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Cartes Virtuelles</span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:text-orange-600 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
              <CreditCard className="h-4 w-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-gray-950 tracking-tight">
            {cardLogicLoading ? "..." : cardLogicStatus.digitalCardsCount}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Cartes numériques prêtes
          </p>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-300 transition-all bg-white p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Partages & Scans</span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:text-orange-600 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
              <QrCode className="h-4 w-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-gray-950 tracking-tight">
            {analyticsLoading ? "..." : totalScans}
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Analytics temps réel
          </p>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-300 transition-all bg-white p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Commandes NFC</span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:text-orange-600 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
              <Shield className="h-4 w-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-gray-950 tracking-tight">
            {ordersLoading ? "..." : (orders ? orders.length : 0)}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {orders && orders.length > 0 ? "Livraison en cours" : "Aucune commande active"}
          </p>
        </Card>
      </div>

      {/* Section des Services & Fonctionnalités (3 Blocs Épurés) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Création de Profil */}
        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all p-5 bg-white space-y-4 flex flex-col justify-between group">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-gray-950">Création de Profil</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Concevez des pages bio élégantes pour centraliser vos réseaux et coordonnées.
            </p>
          </div>
          <Button
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium rounded-lg text-xs h-9 flex items-center justify-center gap-2 transition-all shadow-none"
            onClick={() => router.push('/dashboard/profiles/create')}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Nouveau Profil
          </Button>
        </Card>

        {/* Card 2: Générateur QR Code */}
        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all p-5 bg-white space-y-4 flex flex-col justify-between group">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
                <QrCode className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-gray-950">Générateur QR Code</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Créez des QR codes dynamiques personnalisés et suivis pour vos supports physiques.
            </p>
          </div>
          <Button
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium rounded-lg text-xs h-9 flex items-center justify-center gap-2 transition-all shadow-none"
            onClick={() => router.push('/dashboard/qr-codes/new')}
          >
            <QrCode className="w-3.5 h-3.5 text-gray-500" />
            Créer un QR Code
          </Button>
        </Card>

        {/* Card 3: Avis Clients & NFC */}
        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all p-5 bg-white space-y-4 flex flex-col justify-between group">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-gray-950">Avis & Cartes NFC</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Collectez instantanément des avis vérifiés et reliez vos cartes physiques NFC.
            </p>
          </div>
          <Button
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium rounded-lg text-xs h-9 flex items-center justify-center gap-2 transition-all shadow-none"
            onClick={handleOrderCard}
          >
            <CreditCard className="w-3.5 h-3.5 text-gray-500" />
            Associer ou Commander
          </Button>
        </Card>
      </div>

      {/* Grille principale interactive double colonne */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche (2/3) : Profils & Analytics & Activité */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section Graphique Interactif Principal */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Partages & Scans
            </h3>
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden p-2">
              <ChartAreaInteractive />
            </div>
          </div>
          
          {/* Section Profils */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                Vos Profils
              </h3>
              <Link href="/dashboard/profiles">
                <Button variant="ghost" className="text-xs font-medium text-gray-500 hover:text-gray-950 h-8 flex items-center gap-1">
                  <span>Tous mes profils</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {profiles.length === 0 ? (
              <Card className="rounded-xl border border-dashed border-gray-200 p-8 text-center space-y-3 bg-white shadow-none">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 border border-gray-100">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Aucun profil créé</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Créez votre page de profil pour centraliser vos réseaux et vos coordonnées.
                  </p>
                </div>
                <div className="pt-1">
                  <Button 
                    onClick={() => router.push('/dashboard/profiles/create')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg text-xs h-8 px-3.5 shadow-none"
                  >
                    Créer un profil
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {profiles.map((profile, index) => (
                  <ProfileRow 
                    key={profile.id}
                    profile={profile}
                    index={index}
                    onEdit={(id) => router.push(`/dashboard/profiles/${id}/edit`)}
                    onView={handleViewProfile}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section Activité Récente */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-950 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-600" />
              Activité Récente
            </h3>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <RecentActivity />
            </div>
          </div>
        </div>

        {/* Colonne de droite (1/3) : Outils de carte, QR Code, Agenda */}
        <div className="space-y-6">
          {/* Card: Commande NFC physique Luxe */}
          <Card className="bg-gray-950 text-white border border-gray-900 rounded-xl overflow-hidden relative shadow-none p-5 group">
            <div className="space-y-3">
              <Badge className="w-fit bg-white/10 text-amber-300 border border-amber-500/20 text-[9px] uppercase tracking-wider font-semibold rounded px-2 py-0.5">
                Édition Signature
              </Badge>
              <div>
                <h4 className="text-lg font-semibold tracking-tight text-white">Carte NFC Connectée</h4>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  Partagez vos coordonnées d'un simple contact sans contact. Fabrication premium.
                </p>
              </div>

              {/* Rendu miniature réaliste */}
              <div className="h-24 bg-gray-900/60 border border-gray-800 rounded-lg flex items-center justify-center overflow-hidden my-3">
                <div className="w-32 h-18 rounded-md bg-gradient-to-br from-neutral-800 to-neutral-950 p-2.5 shadow-sm border border-neutral-700/40 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-4 h-3 rounded-[2px] bg-gradient-to-br from-yellow-300 to-amber-500" />
                    <Wifi className="w-3 h-3 text-neutral-400 transform rotate-90" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[6px] tracking-wider text-neutral-500 font-mono">PREMIUM</div>
                    <div className="text-[8px] tracking-[0.2em] text-amber-200 font-bold uppercase">OFIKA</div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleOrderCard}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg h-9 text-xs flex items-center justify-center gap-1.5 shadow-none"
              >
                Commander ma carte
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>

          {/* Outil 2: Astuce Pro Wallet */}
          <Card className="bg-white border border-gray-100 rounded-xl p-5 shadow-none space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Apple & Google Wallet
              </h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Ajoutez votre profil directement au portefeuille de votre smartphone pour partager sans connexion.
            </p>
            <Button
              variant="outline"
              className="w-full h-8 text-xs font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-1"
              onClick={() => {
                if (profiles.length > 0) {
                  setSelectedProfileForWallet(profiles[0])
                  setShowWalletHubModal(true)
                } else {
                  toast.error("Veuillez d'abord créer un profil pour l'ajouter à votre Wallet.")
                }
              }}
            >
              <span>Générer mes cartes Wallet</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </Button>
          </Card>

          {/* Outil 3: Agenda Widget */}
          <Card className="bg-white border border-gray-100 rounded-xl p-5 shadow-none space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                <CalendarIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-900">Agenda & Planification</h4>
              </div>
            </div>
            <div className="flex justify-center pt-1">
              <Calendar
                mode="single"
                selected={dashboardDate}
                onSelect={setDashboardDate}
                className="rounded-lg border border-gray-100 bg-white"
              />
            </div>
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

      <WalletHubModal 
        isOpen={showWalletHubModal}
        onClose={() => setShowWalletHubModal(false)}
        profile={selectedProfileForWallet}
      />
    </div>
  )
}
