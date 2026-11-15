"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Sparkles, 
  ArrowRight, 
  Wifi,
  ChevronRight,
  Eye,
  Activity,
  Calendar as CalendarIcon,
  Loader2,
  ExternalLink,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useEffect } from "react"
import { BetaFeatureModal, useBetaFeature } from "@/components/ui/beta-feature-modal"
import { useDashboardAnalytics } from "@/lib/hooks/useDashboardAnalytics"
import { useStatsAutoReset } from "@/lib/hooks/useStatsAutoReset"
import { RecentActivity } from "@/components/features/dashboard/RecentActivity"
import { DashboardActivityChart } from "@/components/features/dashboard/DashboardActivityChart"
import { getProfileAnalytics } from '@/lib/services/profile-analytics'
import { useOrders } from "@/lib/hooks/usePayments"
import { OrderPromptModal } from "@/components/features/card-ordering/OrderPromptModal"
import { ProfileWithLinks, Profile } from "@/lib/types/database"
import { ProfileVisualsBanner } from "@/components/features/dashboard/ProfileVisualsBanner"
import { OfikaEmblem } from "@/components/features/card-creator/CardVisual"
import { WalletHubModal } from "@/components/features/dashboard/WalletHubModal"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
    let isMounted = true
    const loadAnalytics = async () => {
      try {
        const result = await getProfileAnalytics(profile.id)
        if (isMounted && result.success && result.data) {
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
        if (isMounted) setLoading(false)
      }
    }
    loadAnalytics()
    return () => { isMounted = false }
  }, [profile.id])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 hover:border-gray-200 rounded-xl transition-all duration-200 gap-4 group/prof">
      {/* 1. Colonne gauche : Photo / Initiales + Nom & URL */}
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
            <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate leading-tight group-hover/prof:text-gray-950 transition-colors">
              {profile.name}
            </h4>
            {profile.is_public && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                Public
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
            ofika.ci/{profile.custom_url || profile.username || profile.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* 2. Colonne centrale : Mini Badges Analytics */}
      <div className="flex flex-wrap items-center gap-2">
        {!loading && (
          <>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-700 text-xs shrink-0">
              <Eye className="w-3 h-3 text-gray-400" />
              <span className="text-[11px] text-gray-400 font-normal">Vues :</span>
              <span className="font-mono font-semibold text-gray-900 tabular-nums">{analytics.totalViews}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-700 text-xs shrink-0">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <span className="text-[11px] text-gray-400 font-normal">7j :</span>
              <span className="font-mono font-semibold text-gray-900 tabular-nums">{analytics.last7Days}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-700 text-xs shrink-0">
              <BarChart3 className="w-3 h-3 text-gray-400" />
              <span className="text-[11px] text-gray-400 font-normal">30j :</span>
              <span className="font-mono font-semibold text-gray-900 tabular-nums">{analytics.last30Days}</span>
            </div>
          </>
        )}
      </div>

      {/* 3. Colonne droite : Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-600 hover:text-gray-950 hover:bg-gray-100 text-xs font-medium rounded-lg h-7 px-2.5 transition-colors"
          onClick={() => onEdit(profile.id)}
        >
          Gérer
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-200 text-gray-700 hover:text-gray-950 hover:bg-gray-50 text-xs font-medium rounded-lg h-7 px-2.5 gap-1 shadow-2xs"
          onClick={() => onView(profile)}
        >
          <ExternalLink className="w-3 h-3 text-gray-400" />
          <span>Voir</span>
        </Button>
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
    let isMounted = true
    getUserData().then((res: any) => {
      if (!isMounted) return
      const data = res?.data || res
      if (data?.first_name) {
        setFirstName(data.first_name)
      } else if (data?.name) {
        setFirstName(data.name.split(' ')[0])
      }
    })
    return () => { isMounted = false }
  }, [getUserData])

  // Reset automatique des stats tous les 40 jours
  useStatsAutoReset()

  // Récupérer les analytics du dashboard
  const profileIds = useMemo(() => profiles.map(p => p.id), [profiles])
  const { totalScans, totalContacts, dailyData, loading: analyticsLoading } = useDashboardAnalytics(profileIds)

  const handleOrderCard = () => {
    router.push('/dashboard/orders/new')
  }

  const handleViewProfile = (profile: ProfileWithLinks) => {
    if (profile.custom_url || profile.username) {
      window.open(`/${profile.custom_url || profile.username}`, '_blank', 'noopener,noreferrer')
    }
  }

  // Écran de chargement minimaliste et silencieux
  if (profilesLoading) {
    return (
      <div className="h-full min-h-[50vh] flex flex-col items-center justify-center gap-2.5">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="text-xs text-gray-400 font-medium tracking-tight">Chargement de votre espace...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 bg-white max-w-7xl mx-auto overflow-hidden pb-16">
      {/* 1. Bannière d'optimisation des visuels de profil */}
      <ProfileVisualsBanner incompleteProfiles={profiles.filter(p => !p.image_url || !p.cover_image_url)} />

      {/* 2. En-tête Exécutif Client (Style Linear) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Espace Membre</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
            Bonjour, {firstName || user?.user_metadata?.first_name || user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Gérez vos profils, analysez vos partages et configurez vos cartes connectées NFC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-950 text-xs font-medium rounded-lg"
          >
            <Link href="/dashboard/profiles" className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>Mes Profils</span>
            </Link>
          </Button>

          <Button 
            size="sm"
            onClick={handleOrderCard}
            className="h-8 bg-gray-950 hover:bg-black text-white font-medium text-xs px-3.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Commander NFC</span>
          </Button>
        </div>
      </div>

      {/* 3. Alertes d'onboarding structurées */}
      {!cardLogicLoading && (
        <div className="space-y-3">
          {cardLogicStatus.nextRequiredAction === 'create_profile' && (
            <div className="border border-amber-200/80 bg-amber-50/50 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Activez votre présence Ofika</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Créez votre tout premier profil professionnel pour commencer à le partager.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gray-950 hover:bg-black text-white text-xs font-medium h-8 px-3 rounded-lg shrink-0"
                onClick={() => router.push('/dashboard/profiles/create')}
              >
                <span>Créer mon profil</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}

          {cardLogicStatus.nextRequiredAction === 'create_digital_card' && (
            <div className="border border-gray-200 bg-gray-50/70 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Configurez votre carte numérique</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Préparez votre profil Ofika avant de commander votre carte physique NFC.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gray-950 hover:bg-black text-white text-xs font-medium h-8 px-3 rounded-lg shrink-0"
                onClick={() => router.push('/onboarding/nfc-card')}
              >
                <span>Créer ma carte</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}

          {cardLogicStatus.nextRequiredAction === 'can_order_physical' && (
            <div className="border border-emerald-200/70 bg-emerald-50/40 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Profil complet et prêt !</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Associez une carte connectée NFC physique haut de gamme à votre profil.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium h-8 px-3 rounded-lg shrink-0"
                onClick={handleOrderCard}
              >
                <span>Commander la carte</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 4. Grille 4 KPIs Bento Box */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Profils Actifs</span>
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-950 tracking-tight font-mono tabular-nums">
            {profiles.length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Limite : 3 profils
          </p>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Contacts Captés</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-950 tracking-tight font-mono tabular-nums">
            {analyticsLoading ? "..." : (totalContacts || 0)}
          </div>
          <Link href="/dashboard/contacts" className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1 group">
            <span>Carnet de leads</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Partages & Scans</span>
            <QrCode className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-950 tracking-tight font-mono tabular-nums">
            {analyticsLoading ? "..." : totalScans}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Temps réel</span>
          </p>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Commandes NFC</span>
            <ShieldCheck className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-950 tracking-tight font-mono tabular-nums">
            {ordersLoading ? "..." : (orders ? orders.length : 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {orders && orders.length > 0 ? "Fabrication / Livraison" : "Aucune commande en cours"}
          </p>
        </Card>
      </div>

      {/* 5. Services & Outils Rapides (3 Cartes Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Nouveau Profil */}
        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all p-4 bg-white space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-gray-950">Création de Profil</h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Concevez des pages bio élégantes pour centraliser vos réseaux et coordonnées.
            </p>
          </div>
          <Button
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium rounded-lg text-xs h-8 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            onClick={() => router.push('/dashboard/profiles/create')}
          >
            <span>Nouveau Profil</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </Button>
        </Card>

        {/* Générateur QR Code */}
        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all p-4 bg-white space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                <QrCode className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-gray-950">Générateur QR Code</h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Créez des QR codes dynamiques personnalisés pour vos supports physiques.
            </p>
          </div>
          <Button
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium rounded-lg text-xs h-8 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            onClick={() => router.push('/dashboard/qr-codes/new')}
          >
            <span>Créer un QR Code</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </Button>
        </Card>

        {/* Avis & Cartes NFC */}
        <Card className="rounded-xl border border-gray-100 shadow-none hover:border-gray-200 transition-all p-4 bg-white space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-gray-950">Carte Connectée NFC</h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Collectez instantanément des avis vérifiés et reliez vos cartes sans contact.
            </p>
          </div>
          <Button
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium rounded-lg text-xs h-8 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            onClick={handleOrderCard}
          >
            <span>Associer ou Commander</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </Button>
        </Card>
      </div>

      {/* 6. Grille Principale (2/3 & 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Graphique Partages & Scans (Données Réelles) */}
          <DashboardActivityChart data={dailyData} loading={analyticsLoading} />
          
          {/* Liste des Profils */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                Vos Profils ({profiles.length})
              </h3>
              <Link href="/dashboard/profiles">
                <Button variant="ghost" size="sm" className="text-xs font-medium text-gray-500 hover:text-gray-950 h-7 px-2 flex items-center gap-1">
                  <span>Tous mes profils</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Button>
              </Link>
            </div>

            {profiles.length === 0 ? (
              <Card className="rounded-xl border border-dashed border-gray-200 p-8 text-center space-y-2.5 bg-white shadow-none">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center mx-auto text-gray-400 border border-gray-100">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900">Aucun profil créé</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Créez votre page de profil pour centraliser vos réseaux et vos coordonnées.
                  </p>
                </div>
                <div className="pt-1">
                  <Button 
                    onClick={() => router.push('/dashboard/profiles/create')}
                    className="bg-gray-950 hover:bg-black text-white font-medium rounded-lg text-xs h-7 px-3 shadow-xs"
                  >
                    Créer un profil
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
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

          {/* Activité Récente */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-gray-500" />
                <span>Activité Récente</span>
              </h3>
              <span className="text-[11px] text-gray-400">Flux d'interactions</span>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-white p-4 sm:p-5 shadow-xs">
              <RecentActivity />
            </div>
          </div>
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-5">
          {/* Carte NFC Connectée - Showcase Studio */}
          <Card className="bg-[#0a0d14] text-white border border-gray-900 rounded-2xl overflow-hidden relative shadow-none p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-amber-300/90 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Édition Signature
              </span>
              <span className="text-[10px] text-gray-400 font-mono">1 Tap = 1 Contact</span>
            </div>

            <div>
              <h4 className="text-sm font-bold tracking-tight text-white">Carte NFC Connectée</h4>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                Partagez votre profil d'un simple contact sans contact. Carte physique en PVC finition mate.
              </p>
            </div>

            {/* Rendu miniature carte NFC de Luxe */}
            <div className="h-28 bg-gradient-to-b from-[#14171f] to-[#0a0d14] border border-gray-800 rounded-2xl flex items-center justify-center overflow-hidden my-2 p-2">
              <div className="w-44 h-24 rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-3 shadow-lg border border-neutral-700/50 flex flex-col justify-between relative group hover:scale-[1.02] transition-transform">
                {/* Logo & NFC wave */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <OfikaEmblem color="#f97316" className="w-4 h-4" />
                    <span className="text-[9px] tracking-[0.2em] font-bold text-white uppercase font-sans">OFIKA</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Wifi className="w-3 h-3 rotate-90 text-orange-400" />
                  </div>
                </div>

                {/* Nom du titulaire gravé */}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-neutral-200 tracking-tight truncate max-w-[140px]">
                    {firstName || user?.user_metadata?.first_name || user?.user_metadata?.name || 'Votre Nom'}
                  </p>
                  <div className="flex items-center justify-between text-[7px] text-neutral-500 font-mono">
                    <span>NFC CONNECT</span>
                    <span className="text-orange-400/90 font-semibold">NTAG216</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleOrderCard}
              className="w-full bg-white hover:bg-gray-100 text-gray-950 font-medium rounded-lg h-8 text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Commander ma carte</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Card>

          {/* Apple & Google Wallet */}
          <Card className="bg-white border border-gray-100 rounded-xl p-4 shadow-none space-y-2.5">
            <h4 className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gray-500" />
              Apple & Google Wallet
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Ajoutez votre profil au portefeuille de votre smartphone pour partager sans connexion Internet.
            </p>
            <Button
              variant="outline"
              size="sm"
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
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </Button>
          </Card>

          {/* Agenda & Planification */}
          <Card className="bg-white border border-gray-100 rounded-xl p-4 shadow-none space-y-2.5">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
              <h4 className="text-xs font-bold text-gray-950">Agenda</h4>
            </div>
            <div className="flex justify-center pt-0.5">
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
