import { LoginForm } from "@/components/core/auth/LoginForm"
import { Suspense } from "react"

export const metadata = {
  title: "Connexion | OFIKA",
  description: "Connectez-vous à votre espace OFIKA pour gérer vos cartes NFC, vos profils numériques et vos commandes.",
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
