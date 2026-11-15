'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useUser } from '@/lib/hooks/useUser'
import { UserProfileForm } from '@/components/features/users/UserProfileForm'
import { ChangePasswordForm } from '@/components/features/users/ChangePasswordForm'
import { DeleteAccountButton } from '@/components/features/users/DeleteAccountButton'
import {
  Loader2,
  User,
  Shield,
  AlertTriangle,
  Mail,
  Calendar,
  Sparkles,
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'security' | 'danger'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const { getUserData } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      getUserData().then(res => {
        if (res) {
          setUserData(res.data || res)
        }
      })
    }
  }, [user, getUserData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-neutral-400 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-neutral-900" />
        <p className="text-xs font-semibold text-neutral-500">Chargement de vos paramètres...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = userData?.name || [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Utilisateur'
  const email = userData?.email || user?.email || ''
  const avatarUrl = userData?.image || user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const subscriptionTier = userData?.subscription_tier || 'free'

  const getSubscriptionLabel = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'pro': return 'Formule Pro'
      case 'enterprise': return 'Formule Entreprise'
      case 'lifetime': return 'Membre à Vie'
      case 'free':
      default: return 'Compte Gratuit'
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 px-2 sm:px-4 overflow-x-hidden font-sans">
      {/* Fil d'Ariane & Bouton retour */}
      <div className="flex items-center gap-2 mb-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au tableau de bord</span>
        </Link>
      </div>

      {/* ==================================================================== */}
      {/* 1. EN-TÊTE ÉPURÉ APPLE / LINEAR                                     */}
      {/* ==================================================================== */}
      <div className="space-y-1.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-neutral-700 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <SettingsIcon className="w-3 h-3 text-neutral-700" />
          <span>Configuration & Profil Personnel</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Paramètres du Compte
        </h1>
        <p className="text-neutral-500 text-xs sm:text-sm max-w-xl leading-relaxed">
          Gérez votre profil public, sécurisez vos accès avec un mot de passe robuste et configurez vos informations.
        </p>
      </div>

      {/* ==================================================================== */}
      {/* 2. CARTE IDENTITÉ BENTO (RÉCAPITULATIF STATUTAIRE)                   */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border border-neutral-200 shadow-xs">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-neutral-950 text-white font-bold text-sm sm:text-base rounded-2xl">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight truncate">
                {displayName}
              </h2>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0 border-neutral-200 bg-neutral-50 text-neutral-700">
                {getSubscriptionLabel(subscriptionTier)}
              </Badge>
            </div>

            <p className="text-xs text-neutral-500 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-neutral-500 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl font-medium border border-emerald-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Compte Vérifié</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. BARRE D'ONGLETS SEGMENTÉE SANS SCROLLBAR NATIVE                  */}
      {/* ==================================================================== */}
      <div className="w-full overflow-x-auto no-scrollbar scrollbar-none py-0.5">
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/80 gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={cn(
              "h-8 px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              activeTab === 'profile'
                ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
            )}
          >
            <User className={cn("w-3 h-3", activeTab === 'profile' ? "text-orange-400" : "text-neutral-400")} />
            <span>Profil & Identité</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={cn(
              "h-8 px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              activeTab === 'security'
                ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
            )}
          >
            <Shield className={cn("w-3 h-3", activeTab === 'security' ? "text-emerald-400" : "text-neutral-400")} />
            <span>Sécurité & Mot de passe</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('danger')}
            className={cn(
              "h-8 px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              activeTab === 'danger'
                ? "bg-rose-600 text-white shadow-sm ring-1 ring-rose-700 scale-[1.01]"
                : "text-neutral-600 hover:text-rose-700 hover:bg-rose-50"
            )}
          >
            <AlertTriangle className={cn("w-3 h-3", activeTab === 'danger' ? "text-white" : "text-rose-500")} />
            <span>Zone Critique</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. CONTENU DE L'ONGLET SÉLECTIONNÉ                                  */}
      {/* ==================================================================== */}
      <div className="pt-1">
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-neutral-900">Informations personnelles</h3>
              <p className="text-xs text-neutral-500">Mettez à jour votre nom, votre photo et vos coordonnées de contact.</p>
            </div>
            <UserProfileForm />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-neutral-900">Sécurité & Authentification</h3>
              <p className="text-xs text-neutral-500">Modifiez votre mot de passe pour garantir la protection de vos cartes et données.</p>
            </div>
            <ChangePasswordForm />
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-rose-700">Suppression définitive du compte</h3>
              <p className="text-xs text-neutral-500">Cette opération est irréversible et supprimera l'ensemble de vos données.</p>
            </div>
            <DeleteAccountButton />
          </div>
        )}
      </div>
    </div>
  )
}
