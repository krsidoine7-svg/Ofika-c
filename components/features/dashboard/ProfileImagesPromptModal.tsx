"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload, Sparkles } from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"
import { useRouter } from "next/navigation"

interface ProfileImagesPromptModalProps {
  isOpen: boolean
  onClose: () => void
  profiles: ProfileWithLinks[]
}

export function ProfileImagesPromptModal({
  isOpen,
  onClose,
  profiles
}: ProfileImagesPromptModalProps) {
  const router = useRouter()

  const handleCompleteProfile = (profileId: string) => {
    onClose()
    router.push(`/dashboard/profiles/${profileId}/add-images`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] max-w-[320px] sm:max-w-md rounded-2xl sm:rounded-3xl border border-neutral-100 bg-white p-3 sm:p-6 shadow-2xl overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <DialogHeader className="space-y-1 sm:space-y-3">
          <div className="mx-auto flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <ImageIcon className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <DialogTitle className="text-base sm:text-xl font-bold text-center text-neutral-900 tracking-tight leading-snug">
            Optimisez l'impact visuel de votre profil !
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-[10px] sm:text-xs font-semibold text-center leading-relaxed px-1 sm:px-2">
            Ajoutez une photo de profil et de couverture pour capter instantanément l'attention de vos visiteurs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 sm:space-y-4 pt-1 sm:pt-4">
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border border-blue-100/50 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex gap-2 sm:gap-2.5 items-start">
            <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 sm:space-y-1">
              <h4 className="text-[10px] sm:text-xs font-bold text-blue-900">Pourquoi est-ce important ?</h4>
              <p className="text-[9px] sm:text-[11px] text-blue-700 font-medium leading-relaxed">
                Les profils Ofika dotés d'une photo de profil et d'une image de couverture professionnelle obtiennent en moyenne <strong>3x plus d'engagement</strong> et de clics !
              </p>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {profiles.map((profile) => (
              <Button
                key={profile.id}
                onClick={() => handleCompleteProfile(profile.id)}
                className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold rounded-xl sm:rounded-2xl h-9 sm:h-12 text-[11px] sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 group"
              >
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 group-hover:text-white transition-colors" />
                <span>Compléter {profile.name}</span>
              </Button>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={onClose}
              className="text-xs text-neutral-400 font-bold hover:text-neutral-600 hover:underline transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
