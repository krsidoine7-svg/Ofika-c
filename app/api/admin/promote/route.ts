import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/setup/promote
 * Promeut le tout premier utilisateur en tant qu'administrateur
 * Cette API ne fonctionne QUE si aucun administrateur n'est présent dans la base de données.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'UserId est requis' },
        { status: 400 }
      )
    }

    // 1. Vérifier si un administrateur existe déjà
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'super_admin'])

    if ((count || 0) > 0) {
      return NextResponse.json(
        { success: false, error: 'Un administrateur existe déjà.' },
        { status: 403 }
      )
    }

    // 2. Récupérer les données de l'utilisateur auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (authError || !authUser) {
       return NextResponse.json({ success: false, error: 'Compte Auth non trouvé' }, { status: 404 })
    }

    // 3. Promouvoir l'utilisateur existant
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'super_admin' })
      .eq('id', userId)

    if (updateError) {
      console.error('Erreur mise à jour rôle admin:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du rôle' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur promu administrateur avec succès'
    })

  } catch (error) {
    console.error('Erreur interne promote:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
