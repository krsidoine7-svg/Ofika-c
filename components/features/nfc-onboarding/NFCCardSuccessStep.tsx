'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ExternalLink, ArrowRight, QrCode, Smartphone, CreditCard, Download, Copy, Check, Sparkles, LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { normalizeToFullUrl } from '@/lib/utils/qr-validation'

interface NFCCardSuccessStepProps {
  nfcProfile?: {
    id: string
    nfc_link: string
    profile_name: string
    created_at: string
    qr_code_url?: string
  }
  onViewProfiles?: () => void
}

export function NFCCardSuccessStep({ nfcProfile, onViewProfiles }: NFCCardSuccessStepProps) {
  const router = useRouter()
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    // 🎉 Effet Confettis "Wow" au chargement
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0f1115', '#f97316', '#10b981']
      })
    } catch {
      // Ignorer si indisponible
    }
  }, [])

  const handleViewProfiles = () => {
    if (onViewProfiles) {
      onViewProfiles()
    } else {
      router.push('/dashboard/profiles')
    }
  }

  const fullUrl = normalizeToFullUrl(nfcProfile?.nfc_link || '')

  const handleCopyLink = () => {
    if (fullUrl) {
      navigator.clipboard.writeText(fullUrl)
      setIsCopied(true)
      toast.success('Lien public copié dans le presse-papiers !')
      setTimeout(() => setIsCopied(false), 2500)
    }
  }

  const handleViewPublicProfile = () => {
    if (fullUrl) {
      window.open(fullUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleOrderCard = () => {
    router.push('/dashboard/orders/new')
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* En-tête de Félicitations & Badge Statutaire */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Carte connectée prête à l'emploi</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
          Félicitations ! Votre carte est active
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
          {nfcProfile?.profile_name ? (
            <>Le profil de <strong className="text-neutral-900 font-semibold">{nfcProfile.profile_name}</strong> est configuré et prêt pour vos échanges professionnels.</>
          ) : (
            'Vos coordonnées sont prêtes à être partagées instantanément sans contact.'
          )}
        </p>
      </div>

      {/* Grille Bento Récapitulative Haute Visibilité */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
        {/* Carte 1 : QR Code & Puce Connectée */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-950 font-bold text-base">
                <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
                <span>QR Code Permanent</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Actif en direct
              </span>
            </div>

            <div className="text-center py-2 flex flex-col items-center">
              {nfcProfile?.qr_code_url ? (
                <div className="p-3 bg-white rounded-2xl border border-neutral-200/90 shadow-sm inline-block">
                  <img
                    src={nfcProfile.qr_code_url}
                    alt="QR Code de la carte NFC"
                    className="w-36 h-36 object-contain"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 bg-neutral-100 rounded-2xl border border-neutral-200 flex flex-col items-center justify-center text-neutral-400 gap-2">
                  <QrCode className="w-10 h-10 text-neutral-600" />
                  <span className="text-[11px] font-medium">QR Prêt</span>
                </div>
              )}
              <p className="text-xs text-neutral-500 mt-3 max-w-xs">
                Scannable par tous les téléphones (iOS & Android) sans aucune application requise.
              </p>
            </div>
          </div>

          {nfcProfile?.qr_code_url && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement('a')
                link.href = nfcProfile.qr_code_url!
                link.download = `qrcode-${nfcProfile.profile_name || 'ofika'}.png`
                link.click()
              }}
              className="w-full h-10 text-xs font-semibold text-neutral-900 border-neutral-200 hover:bg-neutral-50 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le QR Code (PNG)</span>
            </Button>
          )}
        </div>

        {/* Carte 2 : Fiche Publique & Lien Direct */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-950 font-bold text-base">
                <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <span>Fiche Publique En Ligne</span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {nfcProfile?.created_at ? new Date(nfcProfile.created_at).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
              </span>
            </div>

            {/* Bloc Copie Directe de l'URL */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                Votre lien direct de partage
              </div>
              <div className="text-xs sm:text-sm font-mono font-medium text-neutral-900 break-all bg-white p-2.5 rounded-lg border border-neutral-200">
                {fullUrl || 'https://ofika.ci/mon-profil'}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  size="sm"
                  className="flex-1 h-9 text-xs bg-neutral-950 hover:bg-neutral-800 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Lien copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le lien</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleViewPublicProfile}
                  className="h-9 px-3 text-xs bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir</span>
                </Button>
              </div>
            </div>

            {/* Récapitulatif technique */}
            <div className="space-y-2 text-xs divide-y divide-neutral-100">
              <div className="pt-2 flex justify-between">
                <span className="text-neutral-500">Contact VCF :</span>
                <span className="font-semibold text-neutral-900">vCard 3.0 Conforme</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-neutral-500">Redirection NFC :</span>
                <span className="font-semibold text-emerald-600">Instantanée (HTTP 307)</span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleViewProfiles}
            className="w-full h-10 text-xs font-semibold text-neutral-800 border-neutral-200 hover:bg-neutral-50 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-neutral-500" />
            <span>Gérer mes profils & cartes</span>
          </Button>
        </div>
      </div>

      {/* Passerelle Clé en Main : Commander la Carte Physique Gravée au Laser */}
      <div className="bg-neutral-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-5 text-left">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-white">
            <CreditCard className="w-6 h-6 text-orange-400" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              Étape Recommandée
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Commandez votre carte physique NFC gravée
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              Recevez votre carte physique finition noir mat gravée au laser à votre nom, prête pour un partage sans contact en rendez-vous.
            </p>
            <div className="text-xs text-neutral-300 font-medium pt-1 flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold">14 600 XOF</span>
              <span>•</span>
              <span className="text-emerald-400">Livraison express gratuite sur tout Abidjan</span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleOrderCard}
          className="w-full md:w-auto h-12 px-6 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs shrink-0 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <span>Commander ma carte NFC</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Prochaines Étapes Pratiques */}
      <div className="bg-neutral-50 border border-neutral-200/70 rounded-2xl p-5 text-left space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Comment utiliser votre carte dès aujourd'hui :
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600">
          <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
            <div className="font-semibold text-neutral-900 mb-1">1. Partagez votre lien</div>
            <p className="text-neutral-500 text-[11px]">Ajoutez-le dans votre bio WhatsApp, signature email ou profil LinkedIn.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
            <div className="font-semibold text-neutral-900 mb-1">2. Montrez votre QR Code</div>
            <p className="text-neutral-500 text-[11px]">Enregistrez l'image du QR Code dans vos photos pour la faire scanner.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
            <div className="font-semibold text-neutral-900 mb-1">3. Captez des contacts</div>
            <p className="text-neutral-500 text-[11px]">Chaque scan permet à vos prospects d'enregistrer votre vCard en 1 clic.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
