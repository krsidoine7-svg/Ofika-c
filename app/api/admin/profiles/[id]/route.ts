import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AuditService } from '@/lib/services/audit-service'

export const dynamic = 'force-dynamic'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
        }

        const body = await request.json()

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { error } = await supabase
            .from('profiles')
            .update({
                is_active: body.is_active,
                suspension_reason: body.is_active ? null : body.suspension_reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) {
            console.error('Erreur Supabase lors de la mise à jour profile:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Auditer l'action
        await AuditService.log({
            action: 'PROFILE_STATUS_UPDATE',
            targetType: 'profile',
            targetId: id,
            details: {
                is_active: body.is_active,
                reason: body.suspension_reason || 'N/A'
            }
        }).catch(err => console.error('Erreur log audit:', err))

        return NextResponse.json({ success: true, message: 'Profil mis à jour avec succès' })
    } catch (error: any) {
        console.error('Erreur API mise à jour profile:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
