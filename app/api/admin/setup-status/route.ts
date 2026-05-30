import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/setup-status
 * Vérifie si un administrateur est déjà configuré dans le système
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Compter le nombre de lignes dans la table 'admin_users'
    const { data: admins, error, count } = await supabase
      .from('admin_users')
      .select('id', { count: 'exact' })
    
    console.log('DEBUG ADMIN STATUS:', { 
        count: count, 
        rows: admins?.length, 
        error: error ? error.message : 'none' 
    })

    if (error) {
      console.error('Erreur SQL setup-status:', error)
      return NextResponse.json({ success: true, adminExists: false })
    }

    const exists = (count || 0) > 0 || (admins?.length || 0) > 0

    return NextResponse.json({
      success: true,
      adminExists: exists,
      count: count || admins?.length || 0
    })

  } catch (error) {
    console.error('Erreur interne setup-status:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
