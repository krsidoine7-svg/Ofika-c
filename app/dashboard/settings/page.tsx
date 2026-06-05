"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { UserProfileForm } from '@/components/features/users/UserProfileForm'
import { ChangePasswordForm } from '@/components/features/users/ChangePasswordForm'
import { DeleteAccountButton } from '@/components/features/users/DeleteAccountButton'
import { Loader2, Settings, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-600">Gérez votre compte et vos préférences</p>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="space-y-6">
          {/* Informations personnelles */}
          <UserProfileForm />

          {/* Sécurité */}
          <ChangePasswordForm />

          {/* Zone dangereuse */}
          <DeleteAccountButton />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Besoin d'aide ? Contactez-nous à krisidoine7@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
