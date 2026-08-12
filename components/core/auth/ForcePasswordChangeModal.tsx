"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ForcePasswordChangeModal({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  const isOpen = user?.user_metadata?.force_password_reset === true || user?.user_metadata?.force_password_reset === 'true'

  useEffect(() => {
    if (isOpen) {
      const saved = sessionStorage.getItem('temp_current_password')
      if (saved) {
        setCurrentPassword(saved)
      }
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit faire au moins 6 caractères")
      return
    }

    setIsLoading(true)

    try {
      // 1. Vérifier l'ancien mot de passe
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        toast.error("Le mot de passe actuel est incorrect")
        setIsLoading(false)
        return
      }

      // 2. Mettre à jour avec le nouveau mot de passe et retirer le flag
      const { error: updateError } = await (supabase.auth.updateUser as any)({
        password: newPassword,
        current_password: currentPassword, // Requis par les nouvelles sécurités Supabase
        data: { force_password_reset: false }
      })

      if (updateError) {
        throw updateError
      }

      sessionStorage.removeItem('temp_current_password')
      toast.success("Votre mot de passe a été mis à jour avec succès !")
      
      // Rafraîchir la page pour appliquer les changements (le layout relira la session)
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Une erreur s'est produite lors de la mise à jour")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Mise à jour obligatoire</DialogTitle>
          <DialogDescription>
            Votre mot de passe a été réinitialisé par un administrateur. Pour des raisons de sécurité, veuillez définir votre propre mot de passe personnel avant de continuer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="current">Mot de passe actuel</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="current"
                type="password"
                placeholder="Mot de passe actuel"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 bg-gray-100 text-gray-500 cursor-not-allowed select-none opacity-100"
                required
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new">Nouveau mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="new"
                type="password"
                placeholder="Votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !currentPassword || !newPassword}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmer et continuer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
