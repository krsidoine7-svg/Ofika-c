"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Label } from "@/components/core/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Logo } from "@/components/core/ui/logo"

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Vérifier si l'utilisateur a bien une session valide via le token de récupération
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("Lien de réinitialisation invalide ou expiré")
        router.push("/auth/login")
      } else {
        setIsCheckingSession(false)
      }
    }
    
    // Supabase intercepte le hash dans l'URL et crée la session localement
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsCheckingSession(false)
      }
    })

    checkSession()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (error) {
        throw error
      }

      toast.success("Votre mot de passe a été réinitialisé avec succès !")
      router.push("/dashboard")
      
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la réinitialisation")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4">
        <Logo size="md" variant="color" className="mb-8" />
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-gray-600">Vérification de votre lien sécurisé...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="md" variant="color" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="text-gray-600">Veuillez entrer votre nouveau mot de passe ci-dessous</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Création du mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    {...register('newPassword')}
                    placeholder="Votre nouveau mot de passe"
                    className="pl-10 pr-10"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isSubmitting}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirmer le nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register('confirmPassword')}
                    placeholder="Confirmez votre nouveau mot de passe"
                    className="pl-10 pr-10"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour le mot de passe'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
