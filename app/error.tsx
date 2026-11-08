'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Journalisation sécurisée sans exposer les détails sensibles à l'utilisateur
    console.error('Erreur applicative interceptée:', error.digest || error.message)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>

        <div className="space-y-2">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-3">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Une erreur inattendue est survenue</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Notre équipe technique a été automatiquement informée. Veuillez rafraîchir la page ou réessayer dans quelques instants.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Réessayer
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
