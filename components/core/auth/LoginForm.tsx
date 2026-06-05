"use client"

import * as React from "react"
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserPlus } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { LAYOUTS } from "@/lib/constants/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export function LoginForm() {
  const [formData, setFormData] = React.useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

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

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      // Attendre un peu pour que la session se synchronise
      await new Promise(resolve => setTimeout(resolve, 100))

      toast.success("Connexion réussie!")

      // Forcer un refresh de la page pour synchroniser l'état
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la connexion")
      toast.error("Erreur de connexion")
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
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur Ofika</h1>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Se connecter</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Login Form */}
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

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 flex items-center justify-center h-11"
                  onClick={handleMagicLink}
                  disabled={isLoading}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Recevoir un lien magique
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Se souvenir de moi
                  </Label>
                </div>
                <div className="flex flex-col space-y-1">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-orange-600 hover:text-orange-700"
                    onClick={() => router.push("/auth/forgot-password")}
                  >
                    Mot de passe oublié?
                  </Button>
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
                    Connexion...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Se connecter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Pas encore de compte?{" "}
              <Link
                href="/auth/signup"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Créer un compte
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          En vous connectant, vous acceptez nos{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-xs text-orange-600 hover:text-orange-700"
          >
            Conditions d'utilisation
          </Button>{" "}
          et notre{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-xs text-orange-600 hover:text-orange-700"
          >
            Politique de confidentialité
          </Button>
        </div>
      </div>
    </div>
  )
}
