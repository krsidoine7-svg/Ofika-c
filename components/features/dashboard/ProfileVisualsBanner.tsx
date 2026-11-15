"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Camera } from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"

interface ProfileVisualsBannerProps {
  incompleteProfiles: ProfileWithLinks[]
  onComplete?: (profileId: string) => void
  className?: string
}

export function ProfileVisualsBanner({
  incompleteProfiles,
  onComplete,
  className = ""
}: ProfileVisualsBannerProps) {
  const router = useRouter()

  if (!incompleteProfiles || incompleteProfiles.length === 0) {
    return null
  }

  const count = incompleteProfiles.length
  const firstProfile = incompleteProfiles[0]

  const handleAction = (profileId: string) => {
    if (onComplete) {
      onComplete(profileId)
    } else {
      router.push(`/dashboard/profiles/${profileId}/add-images`)
    }
  }

  return (
    <div className={`relative mb-6 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Contenu textuel */}
        <div className="space-y-1 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/80">
              <Camera className="w-3 h-3 text-neutral-600" />
              Visuels recommandés
            </span>
            <span className="text-xs font-semibold text-neutral-900">
              {count === 1 ? `Complétez le profil de ${firstProfile.name}` : `${count} profils en attente de visuels`}
            </span>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed">
            Ajoutez votre photo de profil et votre bannière pour maximiser la mémorisation et le taux d'enregistrement de vos coordonnées.
          </p>
        </div>

        {/* Bouton d'action */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={() => handleAction(firstProfile.id)}
            className="rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium px-4 h-9 text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>Ajouter les photos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
