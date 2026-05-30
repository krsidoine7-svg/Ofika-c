import { createAdminClient } from '@/lib/supabase/service-role'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'


export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier si l'utilisateur est admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caractères' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Erreur reset password:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé' })
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
