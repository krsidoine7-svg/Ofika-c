"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/core/ui/dialog"
import { Button } from "@/components/core/ui/button"
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
      <DialogContent className="max-w-md rounded-3xl border border-neutral-100 bg-white p-6 shadow-2xl overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <DialogHeader className="space-y-3">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <ImageIcon className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-neutral-900 tracking-tight leading-snug">
            Optimisez l'impact visuel de votre profil !
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-xs font-semibold text-center leading-relaxed">
            Ajoutez une photo de profil et de couverture pour capter instantanément l'attention de vos visiteurs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border border-blue-100/50 rounded-2xl p-4 flex gap-3.5 items-start">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-blue-900">Pourquoi est-ce important ?</h4>
              <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                Les profils Ofika dotés d'une photo de profil et d'une image de couverture professionnelle obtiennent en moyenne <strong>3x plus d'engagement</strong> et de clics !
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {profiles.map((profile) => (
              <Button
                key={profile.id}
                onClick={() => handleCompleteProfile(profile.id)}
                className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold rounded-2xl h-12 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <Upload className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
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
