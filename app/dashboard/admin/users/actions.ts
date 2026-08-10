'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export async function fetchUsersAdmin() {
    // 1. Vérification de sécurité (seul un admin peut exécuter cette action)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error("Non autorisé")
    }

    // Récupérer le rôle réel dans la table users (pour être sûr à 100%)
    const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (roleError || !userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
        throw new Error("Privilèges administrateur requis")
    }

    // 2. Fetch des données avec le compte Service Role pour contourner les RLS limitantes
    const adminSupabase = createAdminClient()

    const { data: usersData, error: usersError } = await adminSupabase
        .from('users')
        .select('id, email, name, subscription_tier, created_at, last_login, role')
        .order('created_at', { ascending: false })

    if (usersError) throw usersError

    const { data: profilesData } = await adminSupabase.from('profiles').select('user_id')
    const { data: cardsData } = await adminSupabase.from('digital_nfc_cards').select('user_id')

    const profilesMap: Record<string, number> = {}
    profilesData?.forEach(p => {
        if (p.user_id) profilesMap[p.user_id] = (profilesMap[p.user_id] || 0) + 1
    })

    const cardsMap: Record<string, number> = {}
    cardsData?.forEach(c => {
        if (c.user_id) cardsMap[c.user_id] = (cardsMap[c.user_id] || 0) + 1
    })

    const mergedUsers = (usersData || []).map(u => ({
        ...u,
        is_admin: u.role === 'admin' || u.role === 'super_admin',
        admin_role: u.role,
        profileCount: profilesMap[u.id] || 0,
        cardCount: cardsMap[u.id] || 0
    }))

    return mergedUsers
}
