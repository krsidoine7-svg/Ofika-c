import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth/require-staff'
import { createAdminClient } from '@/lib/supabase/service-role'
import { AuditService } from '@/lib/services/audit-service'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
    try {
        // Réservé à l'équipe Ofika (ADMIN / TECH)
        const staff = await requireStaff()
        if (!staff.ok) return staff.response

        const supabase = createAdminClient()
        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')

        const { data, error } = key 
            ? await supabase.from('system_config').select('*').eq('key', key).single()
            : await supabase.from('system_config').select('*')
        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        // Réservé à l'équipe Ofika (ADMIN / TECH)
        const staff = await requireStaff()
        if (!staff.ok) return staff.response

        const supabase = createAdminClient()
        const { key, value } = await request.json()

        if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 })

        const { data, error } = await supabase
            .from('system_config')
            .upsert({ key, value, updated_at: new Date().toISOString() })
            .select()

        if (error) throw error

        await AuditService.log({
            action: 'SYSTEM_CONFIG_UPDATE',
            targetType: 'system',
            targetId: key,
            details: { key, value: 'HIDDEN_FOR_SECURITY' }
        })

        return NextResponse.json({ success: true, data: data[0] })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
