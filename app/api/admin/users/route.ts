import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AuditService } from '@/lib/services/audit-service'

export const dynamic = 'force-dynamic'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Gestion des actions critiques sur les utilisateurs :
 * - Toggle Admin Status
 * - Suppression d'utilisateur
 * - Mise à jour de Plan (Subscription Tier)
 */
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { userId, action, tier } = body
        
        if (!userId) throw new Error('UserId manquant')
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        if (action === 'TOGGLE_ADMIN') {
            const { isAdmin, email, name } = body
            
            if (isAdmin) {
                // Devenir Admin
                const { error } = await supabase
                    .from('admin_users')
                    .insert({ id: userId, email, name, role: 'admin' })
                if (error) throw error
            } else {
                // Retirer l'admin
                const { error } = await supabase
                    .from('admin_users')
                    .delete()
                    .eq('id', userId)
                if (error) throw error
            }

            await AuditService.log({
                action: 'USER_ROLE_UPDATE',
                targetType: 'user',
                targetId: userId,
                details: { isAdmin: !!isAdmin, email }
            })

            return NextResponse.json({ success: true })
        }

        if (action === 'UPDATE_PLAN') {
            const { previousTier } = body
            const { error } = await supabase
                .from('users')
                .update({ subscription_tier: tier })
                .eq('id', userId)
            
            if (error) throw error

            await AuditService.log({
                action: 'USER_ROLE_UPDATE', // Ou on peut ajouter USER_PLAN_UPDATE
                targetType: 'user',
                targetId: userId,
                details: { previousTier, newTier: tier }
            })

            return NextResponse.json({ success: true })
        }

        throw new Error('Action non reconnue')
    } catch (error: any) {
        console.error('API User PATCH error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('id')
        if (!userId) throw new Error('ID manquant')

        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        
        // Avant de supprimer, on récupère l'email pour le log
        const { data: userData } = await supabase.from('users').select('email').eq('id', userId).single()

        const { error } = await supabase.from('users').delete().eq('id', userId)
        if (error) throw error

        await AuditService.log({
            action: 'USER_DELETE',
            targetType: 'user',
            targetId: userId,
            details: { email: userData?.email }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
