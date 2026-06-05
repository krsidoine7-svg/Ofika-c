"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Récupérer l'email de l'utilisateur depuis la session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
      }
    }
    getUser()
  }, [supabase.auth])

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) throw error

      alert("Email de vérification renvoyé!")
    } catch (error) {
      console.error("Erreur lors du renvoi de l'email:", error)
      alert("Erreur lors du renvoi de l'email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="md" variant="color" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vérifiez votre email</h1>
        </div>

        {/* Verification Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center space-y-1 pb-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl font-semibold">Email de vérification envoyé</CardTitle>
            <CardDescription>
              Nous avons envoyé un lien de vérification à{" "}
              <span className="font-medium text-orange-600">{email}</span>
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Cliquez sur le lien pour activer votre compte ou vous connecter
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-sm text-gray-600">
              <p>Cliquez sur le lien dans l'email pour activer votre compte.</p>
              <p className="mt-2">Vous ne recevez pas l'email? Vérifiez votre dossier spam.</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Renvoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Renvoyer l'email
                  </div>
                )}
              </Button>

              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>L'email peut prendre quelques minutes à arriver.</p>
          <p>Si vous ne le recevez pas, contactez notre support.</p>
        </div>
      </div>
    </div>
  )
}
