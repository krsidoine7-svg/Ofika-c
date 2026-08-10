import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export async function POST(request: NextRequest) {
  try {
    const { action, userId } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    if (action === 'check') {
      const { data: needsReset, error } = await adminSupabase.rpc('should_reset_user_stats', { user_uuid: userId })
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      const { data: userData } = await adminSupabase
        .from('users')
        .select('stats_last_reset_at')
        .eq('id', userId)
        .maybeSingle()

      return NextResponse.json({
        success: true,
        data: {
          needsReset: needsReset === true,
          lastResetAt: userData?.stats_last_reset_at || null
        }
      })
    } 
    
    if (action === 'reset') {
      const { data, error } = await adminSupabase.rpc('reset_user_stats', { user_uuid: userId })
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

  } catch (error: any) {
    console.error('Erreur dans stats-reset route:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
