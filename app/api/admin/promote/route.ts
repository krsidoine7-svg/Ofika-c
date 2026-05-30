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
      .from('admin_users')
      .select('*', { count: 'exact', head: true })

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

    // 3. Insertion dans admin_users
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
         id: userId,
         email: authUser.email || '',
         name: authUser.user_metadata?.displayName || authUser.user_metadata?.name || 'SuperAdmin',
         role: 'superadmin',
         permissions: ["all"]
      })

    if (insertError) {
      console.error('Erreur insertion admin_users:', insertError)
      return NextResponse.json({ success: false, error: 'Erreur SQL lors de la création de l\'admin' }, { status: 500 })
    }

    // 3. Promouvoir l'utilisateur existant
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
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
