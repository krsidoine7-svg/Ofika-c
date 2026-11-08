import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isStaffRole, normalizeRole } from '@/lib/roles'
import { AdminClientLayout } from './AdminClientLayout'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // 1ère barrière serveur : utilisateur authentifié
  if (userError || !user) {
    redirect('/login?callbackUrl=/dashboard/admin')
  }

  // 2ème barrière serveur : rôle vérifié directement en base de données
  const { data: userData, error: dbError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = normalizeRole(userData?.role || user.app_metadata?.role)

  if (dbError || !isStaffRole(role)) {
    redirect('/dashboard')
  }

  return <AdminClientLayout>{children}</AdminClientLayout>
}
