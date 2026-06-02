"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/core/ui/dialog"
import { Button } from "@/components/core/ui/button"
import { Sparkles, Smartphone, ShieldCheck, Download, ExternalLink, QrCode } from "lucide-react"
import { Profile } from "@/lib/types/database"
import { toast } from "sonner"

interface WalletHubModalProps {
  isOpen: boolean
  onClose: () => void
  profile: Profile | null
}

export function WalletHubModal({
  isOpen,
  onClose,
  profile
}: WalletHubModalProps) {
  const [downloadingApple, setDownloadingApple] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  if (!profile) return null

  const handleAppleWallet = async () => {
    setDownloadingApple(true)
    try {
      toast.success("Génération de votre carte Apple Wallet...")
      window.location.href = `/api/profiles/${profile.id}/wallet/apple`
    } catch (err) {
      console.error("Apple Wallet download failed:", err)
      toast.error("Échec du téléchargement de la carte Apple Wallet.")
    } finally {
      setTimeout(() => setDownloadingApple(false), 2000)
    }
  }

  const handleGoogleWallet = async () => {
    setLoadingGoogle(true)
    try {
      toast.success("Préparation de votre lien Google Wallet...")
      const res = await fetch(`/api/profiles/${profile.id}/wallet/google`)
      const data = await res.json()
      
      if (data.success && data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      } else {
        throw new Error("Lien invalide")
      }
    } catch (err) {
      console.error("Google Wallet failed:", err)
      toast.error("Échec du chargement du lien Google Wallet.")
    } finally {
      setLoadingGoogle(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] md:max-w-2xl rounded-[32px] border border-neutral-100 bg-white p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[95vh] md:max-h-[90vh]">
        {/* Ambient background glows */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Visual Wallet Pass Card Preview (5/12 grid cols) */}
          <div className="col-span-1 md:col-span-5 flex justify-center items-center">
            <div className="w-[210px] h-[295px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-3 flex flex-col justify-between relative overflow-hidden group select-none text-white font-sans">
              {/* Glossy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-36 h-36 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

              {/* Pass Header */}
              <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-orange-600 flex items-center justify-center font-bold text-[8px] text-white">
                    O
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-zinc-400">OFIKA</span>
                </div>
                <span className="text-[7px] font-bold text-zinc-500 tracking-wider uppercase bg-zinc-900 px-1.5 py-0.5 rounded-full">
                  PREMIUM PASS
                </span>
              </div>

              {/* Middle Profile & QR Section */}
              <div className="space-y-3 pt-2.5 flex-1 flex flex-col justify-between">
                
                {/* Avatar & Name Info Row */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden relative shrink-0 flex items-center justify-center shadow-inner">
                    {profile.image_url ? (
                      <img 
                        src={profile.image_url} 
                        alt={profile.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-450 font-extrabold text-[10px]">
                        {profile.name?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold block text-zinc-150 truncate leading-none">
                      {profile.name}
                    </span>
                    <span className="text-[8px] font-medium text-zinc-400 block truncate">
                      {profile.job_title || "Membre Ofika"}
                    </span>
                    <span className="text-[8px] font-bold text-orange-500 block truncate leading-none">
                      {profile.company || "Ofika"}
                    </span>
                  </div>
                </div>

                {/* QR Code container */}
                <div className="flex flex-col items-center justify-center bg-white rounded-xl p-2 mx-auto w-[100px] h-[100px] shadow-md relative border border-zinc-900/5">
                  <QrCode className="w-[85px] h-[85px] text-zinc-900" />
                  <div className="absolute w-4 h-4 rounded bg-orange-600 border border-white flex items-center justify-center font-bold text-[6px] text-white shadow-sm">
                    O
                  </div>
                </div>

              </div>

              {/* Pass Footer */}
              <div className="border-t border-zinc-900 pt-2 flex justify-between items-end">
                <div className="space-y-0.5">
                  <span className="text-[6px] text-zinc-500 font-bold uppercase tracking-wider block">ID CARTE</span>
                  <span className="text-[8px] font-mono text-zinc-350 block">OFK-{profile.id.substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-orange-500" />
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Certifié</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Download Actions (7/12 grid cols) */}
          <div className="col-span-1 md:col-span-7 space-y-4">
            
            {/* Pass Header Titles */}
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="bg-orange-500/10 text-orange-600 border border-orange-200/50 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Nouveau
                </span>
                <span className="text-zinc-450 text-[10px] font-bold flex items-center gap-1 select-none">
                  <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                  Cartes Wallet Virtuelles
                </span>
              </div>
              <DialogTitle className="text-xl md:text-2xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                Vos Cartes de Visite Wallet
              </DialogTitle>
              <DialogDescription className="text-neutral-500 text-xs font-semibold leading-relaxed block text-center md:text-left">
                Partagez vos coordonnées professionnelles directement depuis le Wallet de votre téléphone, même hors ligne.
              </DialogDescription>
            </div>

            {/* Micro value proposition list */}
            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-3.5 space-y-2">
              <div className="flex gap-2.5 items-start">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-neutral-600 font-semibold leading-relaxed">
                  <strong>Partage Instantané</strong> : Plus besoin d'application ou de connexion internet, affichez votre carte en un geste.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-neutral-600 font-semibold leading-relaxed">
                  <strong>Mise à jour automatique</strong> : Si vous modifiez votre profil, vos cartes Wallet se synchronisent d'elles-mêmes !
                </p>
              </div>
            </div>

            {/* Download Buttons Stack */}
            <div className="space-y-2.5">
              <Button
                onClick={handleAppleWallet}
                disabled={downloadingApple || loadingGoogle}
                className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold rounded-2xl h-11 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group text-xs"
              >
                <Download className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                <span>{downloadingApple ? "Génération..." : "Ajouter à Apple Wallet"}</span>
              </Button>

              <Button
                onClick={handleGoogleWallet}
                disabled={downloadingApple || loadingGoogle}
                variant="outline"
                className="w-full border-neutral-200 text-neutral-800 hover:bg-neutral-50 font-bold rounded-2xl h-11 shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                <span>{loadingGoogle ? "Préparation..." : "Ajouter à Google Wallet"}</span>
              </Button>
            </div>

            {/* Certified Footer */}
            <div className="flex items-center justify-center md:justify-start gap-1 text-[9px] text-neutral-450 font-bold select-none pt-1">
              <Sparkles className="w-2.5 h-2.5 text-orange-500" />
              <span>Intégration premium Ofika certifiée</span>
            </div>

          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
