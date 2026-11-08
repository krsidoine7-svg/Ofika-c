import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireStaffAuth()
    if (authCheck.error) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status })
    }

    const supabase = await createClient()

    const { data: leads, error } = await supabase
      .from('captured_contacts')
      .select(`
        *,
        profiles (
          name,
          username
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      leads: leads || []
    })

  } catch (error: any) {
    console.error('Leads API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
