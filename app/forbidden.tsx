import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>

        <div className="space-y-2">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-3">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-5xl font-black text-gray-900 tracking-tight">403</span>
          <h1 className="text-2xl font-bold text-gray-900">Accès restreint</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vous ne disposez pas des autorisations requises pour accéder à cet espace ou à cette ressource.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Espace Client
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Changer de compte
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
