import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>

        <div className="space-y-2">
          <span className="text-6xl font-black text-orange-500 tracking-tighter">404</span>
          <h1 className="text-2xl font-bold text-gray-900">Page introuvable</h1>
          <p className="text-sm text-gray-600">
            La page que vous recherchez n&apos;existe pas, a été déplacée ou son lien est expiré.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Mon tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
