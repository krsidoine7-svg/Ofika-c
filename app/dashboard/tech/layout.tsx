import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/roles'

import { TechClientLayout } from './TechClientLayout'

export const dynamic = 'force-dynamic'

export default async function TechLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login?callbackUrl=/dashboard/tech')
  }

  const { data: userData, error: dbError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = normalizeRole(userData?.role || user.app_metadata?.role)

  // Strictement réservé au rôle TECH
  if (dbError || role !== 'TECH') {
    redirect(role === 'ADMIN' ? '/dashboard/admin' : '/dashboard')
  }

  return (
    <TechClientLayout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Espace Technique & Supervision
              </h1>
              <p className="text-sm text-slate-400">Console d&apos;administration technique et observabilité système</p>
            </div>
            <div className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
              {user.email} (TECH)
            </div>
          </header>
          <main>{children}</main>
        </div>
      </div>
    </TechClientLayout>
  )
}
