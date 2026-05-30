"use client"

import { useEffect, useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinnerWithLogo } from '@/components/core/ui/loading-spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}


export const ProtectedRoute = memo(function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true)
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo, isRedirecting])

  // Éviter le rendu pendant la redirection
  if (isRedirecting || loading) {
    return <LoadingSpinnerWithLogo text="Chargement..." />
  }

  if (!user) {
    return null
  }

  return <>{children}</>
})
