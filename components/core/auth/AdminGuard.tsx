'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isStaffRole, normalizeRole } from '@/lib/roles'
import { useAuth } from '@/lib/hooks/useAuth'

interface AdminGuardProps {
    children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        let isMounted = true

        async function verifyAdminSession() {
            try {
                // 1. Vérification rapide si l'utilisateur est déjà en session client ou cookie
                if (user) {
                    const role = normalizeRole(user.app_metadata?.role || (user.user_metadata as any)?.role)
                    if (isStaffRole(role)) {
                        return
                    }
                }

                const cookieRole = typeof document !== 'undefined' ? document.cookie.match(/ofika_role=([^;]+)/)?.[1] : null
                if (cookieRole && isStaffRole(normalizeRole(cookieRole))) {
                    return
                }

                // 2. Vérification de la session locale Supabase
                const { data: { session } } = await supabase.auth.getSession()
                if (!session?.user) {
                    if (!authLoading && !user && isMounted) {
                        router.push('/login?callbackUrl=/dashboard/admin')
                    }
                    return
                }

                const sessionRole = normalizeRole(session.user.app_metadata?.role)
                if (isStaffRole(sessionRole)) {
                    return
                }

                // 3. Vérification de sécurité en base si le rôle n'était pas dans le token
                const { data: adminData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                const role = normalizeRole(adminData?.role || session.user.app_metadata?.role)

                if (!isStaffRole(role) && isMounted) {
                    console.error('Accès staff refusé: rôle insuffisant')
                    router.push('/dashboard')
                }
            } catch (error) {
                console.error('Erreur vérification admin:', error)
            }
        }

        verifyAdminSession()

        return () => {
            isMounted = false
        }
    }, [router, supabase, user, authLoading])

    // Le layout serveur (app/dashboard/admin/layout.tsx) garantit déjà strictement l'accès avant le rendu.
    // L'affichage est donc instantané côté client, sans écran blanc de blocage.
    return <>{children}</>
}

