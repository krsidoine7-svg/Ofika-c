"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Logo } from '@/components/ui/logo'
import { normalizeRole, sanitizeRedirectUrl } from '@/lib/roles'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const rawNext = params.get('next') || params.get('callbackUrl')

        if (code) {
          console.log('🔄 Échange du code d\'authentification...')
          await supabase.auth.exchangeCodeForSession(code)
        }

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Erreur lors de la connexion')
          router.push('/login')
          return
        }

        if (session) {
          toast.success('Connexion réussie!')
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

          const role = normalizeRole(userData?.role)
          const destination = sanitizeRedirectUrl(rawNext, role)
          router.push(destination)
        } else {
          console.warn('Aucune session trouvée après callback')
          router.push('/login')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        toast.error('Erreur lors de la connexion')
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="text-center space-y-4">
        <div className="mx-auto">
          <Logo size="md" variant="color" />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Connexion en cours...</span>
        </div>
      </div>
    </div>
  )
}
