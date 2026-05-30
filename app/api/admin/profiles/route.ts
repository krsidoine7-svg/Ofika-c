import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Récupérer tous les profils
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (profilesError) {
            console.error('Erreur Supabase profils:', profilesError)
            return NextResponse.json({ error: profilesError.message }, { status: 500 })
        }

        // 2. Récupérer tous les utilisateurs pour faire la jointure manuellement
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')

        if (usersError) {
            console.error('Erreur Supabase users:', usersError)
            // On continue quand même sans les noms si possible, ou on throw
        }

        const usersMap = new Map((users || []).map(u => [u.id, u]))

        // 3. Fusionner
        const profilesWithUser = profiles.map(p => ({
            ...p,
            user: usersMap.get(p.user_id) || { name: 'Utilisateur Inconnu', email: 'N/A' }
        }))

        // Récupérer le nombre de vues totales (statistiques basiques) via les clicks de liens,
        // ou simplement renvoyer les profils. Pour l'instant on se contente des profils avec les liens
        const { data: linksData } = await supabase
            .from('links')
            .select('profile_id, click_count')

        const statsByProfile = (linksData || []).reduce((acc: any, link: any) => {
            if (!acc[link.profile_id]) acc[link.profile_id] = 0
            acc[link.profile_id] += (link.click_count || 0)
            return acc
        }, {})

        // Mapper avec les stats
        const enrichedProfiles = profilesWithUser.map(p => ({
            ...p,
            total_clicks: statsByProfile[p.id] || 0
        }))

        return NextResponse.json({ success: true, profiles: enrichedProfiles })
    } catch (error: any) {
        console.error('Erreur API Get Profiles:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
