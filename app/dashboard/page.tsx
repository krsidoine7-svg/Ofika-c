"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/hooks/useAuth"
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
import { ProfileImagesPromptModal } from "@/components/features/dashboard/ProfileImagesPromptModal"
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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-md rounded-2xl transition-all duration-300 gap-4 group/prof">
      {/* 1. Left Column: Avatar + Profile Name & Username */}
      <div className="flex items-center gap-4 min-w-[240px] shrink-0">
        <div className="w-12 h-12 rounded-xl border border-neutral-100 bg-neutral-50 overflow-hidden relative shrink-0 shadow-sm flex items-center justify-center">
          {profile.image_url ? (
            <img 
              src={profile.image_url} 
              alt={profile.name} 
              className="w-full h-full object-cover group-hover/prof:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold bg-neutral-100 text-xs">
              {profile.name?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-neutral-800 tracking-tight truncate max-w-[160px]">
              {profile.name}
            </span>
            {index === 0 && (
              <Badge className="bg-amber-50 text-amber-600 border border-amber-200/50 hover:bg-amber-50 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                Principal
              </Badge>
            )}
          </div>
          <span className="text-xs text-neutral-400 font-medium leading-none block truncate">
            ofika.ci/{profile.username || 'username'}
          </span>
        </div>
      </div>

      {/* 2. Middle Column: Real-time Analytics Cards/Pills */}
      <div className="flex items-center flex-wrap gap-2.5 flex-1 min-w-0 lg:px-6 lg:border-l lg:border-r lg:border-neutral-100">
        {loading ? (
          // Premium loading skeleton badges
          <div className="flex items-center flex-wrap gap-2.5 w-full animate-pulse">
            <div className="h-8 w-24 bg-neutral-100 rounded-full" />
            <div className="h-8 w-24 bg-neutral-100 rounded-full" />
            <div className="h-8 w-32 bg-neutral-100 rounded-full" />
            <div className="h-8 w-28 bg-neutral-100 rounded-full" />
          </div>
        ) : (
          <>
            {/* Vues badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/70 border border-blue-100/80 text-blue-700 text-xs font-semibold shrink-0">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-bold text-[13px]">{analytics.totalViews}</span>
              <span className="text-blue-600/80 font-medium">Vues</span>
            </div>

            {/* Clics badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/70 border border-emerald-100/80 text-emerald-700 text-xs font-semibold shrink-0">
              <MousePointer className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-bold text-[13px]">{analytics.totalClicks}</span>
              <span className="text-emerald-600/80 font-medium">Clics</span>
            </div>

            {/* Cette semaine badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50/60 border border-amber-100/60 text-amber-800 text-xs font-semibold shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-neutral-500 font-medium">Semaine :</span>
              <span className="font-bold text-[13px] text-amber-700">{analytics.last7Days}</span>
            </div>

            {/* Ce mois badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50/60 border border-purple-100/60 text-purple-800 text-xs font-semibold shrink-0">
              <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-neutral-500 font-medium">Mois :</span>
              <span className="font-bold text-[13px] text-purple-700">{analytics.last30Days}</span>
            </div>
          </>
        )}
      </div>

      {/* 3. Right Column: Action Buttons & Analytics Link */}
      <div className="flex flex-col items-end gap-2 shrink-0 justify-center">
        {/* Top: Primary actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-bold rounded-xl h-9 px-4 transition-colors"
            onClick={() => onEdit(profile.id)}
          >
            Gérer
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-bold rounded-xl h-9 px-3 flex items-center justify-center gap-1 shadow-sm transition-all"
            onClick={() => onView(profile)}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Voir</span>
          </Button>
        </div>

        {/* Bottom: Secondary action (Tous les analytics) */}
        <Link href="/dashboard/analytics" className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <span className="text-[11px] font-bold bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 px-3.5 py-1.5 rounded-full border border-orange-100 hover:border-orange-200 transition-all duration-300 flex items-center gap-1 cursor-pointer">
            Tous les analytics
            <ArrowRight className="w-3 h-3 transition-transform group-hover/prof:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { profiles, loading: profilesLoading } = useProfiles()
  const { status: cardLogicStatus, loading: cardLogicLoading } = useCardLogic()
  const router = useRouter()
  const { isModalOpen, featureName, showBetaModal, closeModal } = useBetaFeature()
  const { orders, loading: ordersLoading } = useOrders()
  const [showImagePromptModal, setShowImagePromptModal] = useState(true)
  const [showWalletHubModal, setShowWalletHubModal] = useState(false)
  const [selectedProfileForWallet, setSelectedProfileForWallet] = useState<Profile | null>(null)
  const [dashboardDate, setDashboardDate] = useState<Date | undefined>(new Date())

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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* En-tête de bienvenue moderne et raffiné */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
            Ravi de vous revoir, <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">{user?.user_metadata?.name || user?.email?.split('@')[0]}</span>
          </h2>
          <p className="text-neutral-500 text-sm mt-1 font-medium text-balance">
            Gérez vos profils, analysez vos partages et commandez vos cartes intelligentes NFC.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-50 h-11 w-11 shadow-sm transition-all">
            <Bell className="w-5 h-5" />
          </Button>
          <Link href="/dashboard/profiles">
            <Button variant="outline" className="rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold h-11 px-5 shadow-sm transition-all">
              Mes Profils
            </Button>
          </Link>
          <Button 
            onClick={handleOrderCard}
            className="rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white font-bold h-11 px-5 shadow-md hover:shadow-neutral-300 transition-all flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Commander une carte
          </Button>
        </div>
      </div>

      {/* 🎯 SECTIONS ALERTES DYNAMIQUES HAUT DE GAMME */}
      {!cardLogicLoading && (
        <div className="space-y-4">

          {cardLogicStatus.nextRequiredAction === 'create_profile' && (
            <div className="relative overflow-hidden border border-orange-100 bg-gradient-to-r from-orange-50/50 to-amber-50/20 p-4 rounded-2xl shadow-sm flex items-start gap-4 animate-pulse [animation-duration:3s]">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-100/80 text-orange-600 border border-orange-200/50 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 sm:flex sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-orange-950">Activez votre présence Ofika</h4>
                  <p className="text-xs text-orange-800 font-medium">
                    Créez votre tout premier profil professionnel pour pouvoir commencer à le partager.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="mt-3 sm:mt-0 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                  onClick={() => router.push('/dashboard/profiles/create')}
                >
                  Créer mon profil
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {cardLogicStatus.nextRequiredAction === 'create_digital_card' && (
            <div className="relative overflow-hidden border border-violet-100 bg-gradient-to-r from-violet-50/50 to-fuchsia-50/20 p-4 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100/80 text-violet-600 border border-violet-200/50 shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div className="flex-1 sm:flex sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-violet-950">Générez votre carte de visite</h4>
                  <p className="text-xs text-violet-800 font-medium">
                    Configurez votre carte numérique Ofika avant de commander votre version physique haut de gamme.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="mt-3 sm:mt-0 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl"
                  onClick={() => router.push('/onboarding/nfc-card')}
                >
                  Créer ma carte numérique
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {cardLogicStatus.nextRequiredAction === 'can_order_physical' && (
            <div className="relative overflow-hidden border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/20 p-4 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-600 border border-emerald-200/50 shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 sm:flex sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-950 font-sans">Prêt à passer au physique !</h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    Félicitations, vous disposez de profils complets. Commandez votre carte physique NFC dès aujourd'hui.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="mt-3 sm:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                  onClick={handleOrderCard}
                >
                  Commander ma carte NFC
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grille de statistiques Premium (Style Dashboard-01) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Profils Actifs</CardDescription>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <User className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">{profiles.length}</div>
            <p className="text-xs text-neutral-400 font-medium mt-1">
              Limite autorisée : 3 profils
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Cartes Virtuelles</CardDescription>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {cardLogicLoading ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                cardLogicStatus.digitalCardsCount
              )}
            </div>
            <p className="text-xs text-neutral-400 font-medium mt-1">
              Cartes numériques prêtes
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Partages & Scans</CardDescription>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <QrCode className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {analyticsLoading ? (
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalScans
              )}
            </div>
            <p className="text-xs text-neutral-400 font-medium mt-1 flex items-center gap-1.5">
              <span className="flex w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Analytics temps réel actif
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Commandes NFC</CardDescription>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {ordersLoading ? (
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                orders ? orders.length : 0
              )}
            </div>
            <p className="text-xs text-neutral-400 font-medium mt-1">
              {orders && orders.length > 0 ? "Livraison en cours" : "Aucune commande active"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 🛠️ Section des Services & Fonctionnalités (3 Blocs Inline & Responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Création de Profil */}
        <Card className="rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 bg-white space-y-4 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">Création de Profil</h4>
            </div>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
              Concevez des pages de profils bio élégantes pour centraliser tous vos réseaux, liens et coordonnées professionnelles.
            </p>
          </div>
          <Button
            className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-100 font-bold rounded-2xl text-xs h-11 flex items-center justify-center gap-2 transition-all"
            onClick={() => router.push('/dashboard/profiles/create')}
          >
            <Sparkles className="w-4 h-4" />
            Créer un Nouveau Profil
          </Button>
        </Card>

        {/* Card 2: Générateur QR Code */}
        <Card className="rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 bg-white space-y-4 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">Générateur QR Code</h4>
            </div>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
              Créez des QR codes dynamiques personnalisés et suivis pour vos cartes de visite imprimées, flyers ou stands.
            </p>
          </div>
          <Button
            className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 font-bold rounded-2xl text-xs h-11 flex items-center justify-center gap-2 transition-all"
            onClick={() => router.push('/dashboard/qr-codes/new')}
          >
            <QrCode className="w-4 h-4" />
            Créer un QR Code Dynamique
          </Button>
        </Card>

        {/* Card 3: Avis Clients & NFC */}
        <Card className="rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 bg-white space-y-4 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">Avis Clients & NFC</h4>
            </div>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
              Associez vos profils à des cartes physiques NFC pour collecter instantanément des avis clients Google et booster votre visibilité.
            </p>
          </div>
          <Button
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 font-bold rounded-2xl text-xs h-11 flex items-center justify-center gap-2 transition-all"
            onClick={handleOrderCard}
          >
            <CreditCard className="w-4 h-4" />
            Associer ou Commander NFC
          </Button>
        </Card>

      </div>

      {/* Grille principale interactive double colonne */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne de gauche (2/3) : Profils & Analytics & Activité */}
        <div className="lg:col-span-2 space-y-8">

          {/* Section Graphique Interactif Principal */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Vue d'ensemble des Partages & Scans
            </h3>
            <ChartAreaInteractive />
          </div>
          
          {/* Section Profils avec Rendu Visuel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Vos Profils Ofika
              </h3>
              <Link href="/dashboard/profiles">
                <Button variant="ghost" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  Tous mes profils
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {profiles.length === 0 ? (
              <Card className="rounded-3xl border border-dashed border-neutral-200 p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-800">Aucun profil créé</h4>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                    Créez votre page de profil en bio pour centraliser vos réseaux et vos coordonnées.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button 
                    onClick={() => router.push('/dashboard/profiles/create')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs h-10 px-4"
                  >
                    Créer un profil
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
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

          {/* Section Historique d'Activité Récente */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              Activité Récente
            </h3>
            <RecentActivity />
          </div>

        </div>

        {/* Colonne de droite (1/3) : Outils de carte, QR Code, Conseils */}
        <div className="space-y-8">
          
          {/* Card: Commande NFC physique en mode VIP */}
          <Card className="bg-neutral-950 text-white border-none rounded-3xl overflow-hidden relative shadow-lg group">
            {/* Glow effect */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-600/30 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-600/40 transition-all duration-500" />
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

            <CardHeader className="pb-2">
              <Badge className="w-fit bg-white/10 hover:bg-white/15 text-amber-300 border border-amber-500/30 text-[9px] uppercase tracking-wider font-bold rounded-lg px-2 py-0.5">
                PROMO EXCLUSIVE
              </Badge>
              <CardTitle className="text-xl font-bold mt-2 tracking-tight">Votre Carte NFC Physique</CardTitle>
              <CardDescription className="text-neutral-400 text-xs font-medium leading-relaxed">
                Partagez vos coordonnées professionnelles en un seul contact. Conçue pour durer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {/* Rendu CSS d'une carte NFC miniature réaliste */}
              <div className="relative h-28 bg-neutral-900/50 border border-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="w-36 h-20 rounded-xl bg-gradient-to-br from-neutral-800 via-neutral-850 to-neutral-950 p-3 shadow-lg border border-neutral-700/40 flex flex-col justify-between transform -rotate-3 group-hover:rotate-1 group-hover:scale-105 transition-all duration-500 select-none">
                  <div className="flex justify-between items-start">
                    <div className="w-5 h-4 rounded-[3px] bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 shadow-sm" />
                    <Wifi className="w-3.5 h-3.5 text-neutral-400 transform rotate-90" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[6px] tracking-wider text-neutral-500 font-mono">★★★★ PREMIUM</div>
                    <div className="text-[8px] tracking-[0.2em] text-amber-200 font-bold uppercase">OFIKA</div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleOrderCard}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold rounded-xl h-11 shadow-md shadow-orange-950/20 flex items-center justify-center gap-1.5 group/btn"
              >
                Commander ma carte
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Button>
            </CardContent>
          </Card>



          {/* Outil 3: Astuce Pro */}
          <Card className="bg-neutral-900 text-white border-none rounded-3xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-4 right-4">
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-[9px] uppercase tracking-wider font-bold">
                Disponible
              </Badge>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-yellow-400">
                <Sparkles className="w-4 h-4" />
                Astuce Pro
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Ajoutez votre carte de visite Ofika directement à votre Apple Wallet ou Google Wallet pour un partage en direct instantané, même hors ligne.
              </p>
              <Button
                variant="link"
                className="text-white p-0 h-auto text-xs font-bold hover:text-yellow-400 transition-colors flex items-center gap-1 pt-1"
                onClick={() => {
                  if (profiles.length > 0) {
                    setSelectedProfileForWallet(profiles[0])
                    setShowWalletHubModal(true)
                  } else {
                    toast.error("Veuillez d'abord créer un profil pour l'ajouter à votre Wallet.")
                  }
                }}
              >
                Générer mes cartes Wallet
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </Card>

          {/* Outil 4: Agenda Widget */}
          <Card className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Mon Organisateur</h4>
                <p className="text-[10px] text-neutral-400 font-medium">Planifiez vos partages</p>
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <Calendar
                mode="single"
                selected={dashboardDate}
                onSelect={setDashboardDate}
                className="rounded-lg border bg-white shadow-sm"
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

      <ProfileImagesPromptModal 
        isOpen={showImagePromptModal && profiles.some(p => !p.image_url || !p.cover_image_url)}
        onClose={() => setShowImagePromptModal(false)}
        profiles={profiles.filter(p => !p.image_url || !p.cover_image_url)}
      />

      <WalletHubModal 
        isOpen={showWalletHubModal}
        onClose={() => setShowWalletHubModal(false)}
        profile={selectedProfileForWallet}
      />
    </div>
  )
}
