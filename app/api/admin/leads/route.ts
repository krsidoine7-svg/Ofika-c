import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérification admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

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
