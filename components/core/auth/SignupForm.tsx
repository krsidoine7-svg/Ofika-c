"use client"

import * as React from "react"
import { Mail, Lock, ArrowRight, User } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { LAYOUTS } from "@/lib/constants/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 15.01 1 12 1 7.24 1 3.2 3.74 1.24 7.74l3.97 3.08C6.18 7.39 8.84 5.04 12 5.04z"
    />
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-1.99 3.41-4.91 3.41-8.6z"
    />
    <path
      fill="#FBBC05"
      d="M5.21 10.82c-.25-.74-.39-1.53-.39-2.35s.14-1.61.39-2.35L1.24 3.04C.45 4.63 0 6.42 0 8.3c0 1.88.45 3.67 1.24 5.26l3.97-3.08z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.12.75-2.54 1.19-4.26 1.19-3.16 0-5.82-2.35-6.79-5.49L1.24 16c1.96 4 6 6.74 10.76 6.74z"
    />
  </svg>
)

interface SignupFormData {
  first_name: string
  last_name: string
  email: string
  password: string
  acceptTerms: boolean
}

export function SignupForm() {
  const [formData, setFormData] = React.useState<SignupFormData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    acceptTerms: false
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Récupérer le callbackUrl depuis les query params
  const callbackUrl = searchParams.get('callbackUrl')

  // Log pour debugging
  React.useEffect(() => {
    console.log('📝 SignupForm - callbackUrl détecté:', callbackUrl || 'aucun')
  }, [callbackUrl])

  // Rediriger vers le dashboard si l'utilisateur est déjà connecté
  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase])

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError("Veuillez renseigner votre prénom et votre nom")
      return false
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return false
    }
    if (!formData.acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            preferred_language: 'fr'
          }
        }
      })

      if (error) throw error

      if (data.user && !data.user.email_confirmed_at) {
        toast.success("Compte créé! Vérifiez votre email pour confirmer votre compte.")
        // Sauvegarder le callbackUrl pour après la vérification email
        if (callbackUrl) {
          sessionStorage.setItem('postVerificationCallbackUrl', callbackUrl)
        }
        router.push("/auth/verify-email")
      } else {
        toast.success("Compte créé avec succès!")
        console.log('✅ Signup réussi - Redirection vers:', callbackUrl || '/dashboard')
        // Rediriger vers le callbackUrl si présent, sinon dashboard
        router.push(callbackUrl || "/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la création du compte")
      toast.error("Erreur lors de la création du compte")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion avec Google")
      toast.error("Erreur de connexion Google")
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!formData.email) {
      setError("Veuillez entrer votre adresse email")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      toast.success("Lien magique envoyé! Vérifiez votre email.")
      router.push("/auth/verify-email")
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi du lien magique")
      toast.error("Erreur lors de l'envoi du lien magique")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`${LAYOUTS.centeredWithGradient} p-4 overflow-x-hidden`}>
      <div className="w-full max-w-md space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Rejoignez Ofika</h1>
        </div>

        {/* Signup Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardDescription className="text-center">
              Remplissez les informations ci-dessous pour créer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center h-11"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  Google
                </Button>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continuer avec email
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="Prénom"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Nom"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <Label htmlFor="terms" className="text-sm">
                  J'accepte les{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="p-0 h-auto text-sm text-orange-600 hover:text-orange-700 underline underline-offset-4 font-bold"
                  >
                    Conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="p-0 h-auto text-sm text-orange-600 hover:text-orange-700 underline underline-offset-4 font-bold"
                  >
                    Politique de confidentialité
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Création du compte...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Créer mon compte
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link
                href="/auth/login"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Connectez-vous
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
