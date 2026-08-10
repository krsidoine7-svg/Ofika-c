"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { UserProfileForm } from '@/components/features/users/UserProfileForm'
import { ChangePasswordForm } from '@/components/features/users/ChangePasswordForm'
import { DeleteAccountButton } from '@/components/features/users/DeleteAccountButton'
import { Loader2, ArrowLeft, User, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Tab = 'profile' | 'security' | 'danger'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Paramètres</h1>
          <p className="text-gray-500 mt-2 text-lg">Gérez vos informations personnelles et la sécurité de votre compte.</p>
        </div>

        {/* Split-pane Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Sidebar / Menu */}
          <aside className="md:col-span-3 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                  : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <User className={`h-4 w-4 ${activeTab === 'profile' ? 'text-gray-900' : 'text-gray-400'}`} />
              Profil
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'security'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                  : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <Shield className={`h-4 w-4 ${activeTab === 'security' ? 'text-gray-900' : 'text-gray-400'}`} />
              Sécurité
            </button>

            <button
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'danger'
                  ? 'bg-red-50 text-red-700 shadow-sm border border-red-100'
                  : 'text-gray-600 hover:bg-red-50 hover:text-red-700 border border-transparent'
              }`}
            >
              <AlertTriangle className={`h-4 w-4 ${activeTab === 'danger' ? 'text-red-600' : 'text-gray-400'}`} />
              Zone Danger
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-9">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Informations personnelles</h2>
                  <p className="text-sm text-gray-500 mb-6">Mettez à jour votre photo et vos coordonnées personnelles.</p>
                </div>
                <UserProfileForm />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Mot de passe</h2>
                  <p className="text-sm text-gray-500 mb-6">Gérez la sécurité de votre compte avec un mot de passe robuste.</p>
                </div>
                <ChangePasswordForm />
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Suppression du compte</h2>
                  <p className="text-sm text-gray-500 mb-6">Action irréversible. Toutes vos données seront perdues.</p>
                </div>
                <DeleteAccountButton />
              </div>
            )}
          </main>
          
        </div>
      </div>
    </div>
  )
}
