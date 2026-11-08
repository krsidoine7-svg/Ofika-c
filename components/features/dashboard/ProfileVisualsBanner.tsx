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
    <div className={`relative mb-6 overflow-hidden rounded-2xl border border-orange-200/90 bg-gradient-to-r from-orange-50/90 via-amber-50/40 to-white p-5 md:p-6 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Contenu textuel avec typographie & couleurs Ofika */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 tracking-tight leading-snug">
              Donnez vie à votre profil <span className="text-orange-500">Ofika</span>
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-700 border border-orange-200/90 shadow-2xs">
              <Sparkles className="w-3 h-3 text-orange-500" />
              3x plus de clics
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Une photo de profil et une bannière professionnelles multiplient instantanément votre visibilité et rassurent vos contacts lors du partage de votre carte.
          </p>

          <div className="flex items-center gap-2 pt-0.5 text-[11px] font-medium text-gray-500">
            <Camera className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>
              {count === 1 ? (
                <>Profil prêt à compléter : <strong className="text-gray-900">{firstProfile.name}</strong></>
              ) : (
                <>{count} profils en attente de visuels</>
              )}
            </span>
          </div>
        </div>

        {/* Bouton d'action pilule style premium Ofika */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={() => handleAction(firstProfile.id)}
            className="rounded-full bg-gray-900 hover:bg-orange-600 text-white font-medium px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95"
          >
            <span>Compléter mes visuels</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
