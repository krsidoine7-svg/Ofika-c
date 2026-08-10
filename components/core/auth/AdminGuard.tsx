'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface AdminGuardProps {
    children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function checkAdmin() {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    router.push('/admin/auth')
                    return
                }

                const { data: adminData, error: adminError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (adminError || !adminData || (adminData.role !== 'admin' && adminData.role !== 'super_admin')) {
                    console.error('Accès admin refusé:', adminError || 'Rôle insuffisant')
                    router.push('/dashboard')
                    return
                }

                setIsAdmin(true)
            } catch (error) {
                console.error('Erreur check admin:', error)
                router.push('/dashboard')
            }
        }

        checkAdmin()
    }, [router, supabase])

    if (isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Vérification des accès administrateur...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
