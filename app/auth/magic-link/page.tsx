"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Mail, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export default function MagicLinkPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      setIsEmailSent(true)
      toast.success("Lien magique envoyé!")
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite")
      toast.error("Erreur lors de l'envoi du lien magique")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Logo size="md" variant="color" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Lien magique envoyé</h1>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center space-y-1 pb-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Vérifiez votre email</CardTitle>
              <CardDescription>
                Nous avons envoyé un lien magique à{" "}
                <span className="font-medium text-orange-600">{email}</span>
                <br />
                <span className="text-sm text-gray-500 mt-2 block">
                  Cliquez sur le lien pour vous connecter instantanément
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-sm text-gray-600">
                <p>Le lien magique vous permet de vous connecter sans mot de passe.</p>
                <p className="mt-2">Vous ne recevez pas l'email? Vérifiez votre dossier spam.</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsEmailSent(false)
                    setEmail("")
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer un autre lien
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="md" variant="color" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Connexion par lien magique</h1>
          <p className="text-gray-600">Entrez votre email pour recevoir un lien de connexion instantané</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Lien magique</CardTitle>
            <CardDescription className="text-center">
              Pas besoin de mot de passe, nous vous enverrons un lien sécurisé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le lien magique
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <Link
                href="/auth/login"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Retour à la connexion classique
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
