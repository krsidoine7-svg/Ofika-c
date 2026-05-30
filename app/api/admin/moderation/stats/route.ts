import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        
        // Fetch recent moderation actions from audit logs
        const { data: logs, error: lError } = await supabase
            .from('admin_audit_logs')
            .select('*')
            .in('action', ['MODERATION_BAN', 'MODERATION_UNBAN'])
            .order('created_at', { ascending: false })
            .limit(5)

        if (lError) console.error('❌ Audit logs error:', lError)

        // Enrich logs with admin info from profiles manually to avoid join issues
        let enrichedLogs = []
        if (logs && logs.length > 0) {
            const adminIds = logs.map(l => l.admin_id).filter(Boolean)
            const { data: adminProfiles } = await supabase
                .from('profiles')
                .select('id, name, email, user_id')
                .in('user_id', adminIds)
            
            enrichedLogs = logs.map(log => ({
                ...log,
                admin: adminProfiles?.find(p => p.user_id === log.admin_id) || { name: 'Admin', email: 'admin' }
            }))
        }

        // Basic stats
        // 1. Total links (all sources)
        const { count: linksCount, error: linksCountError } = await supabase.from('links').select('id', { count: 'exact', head: true })
        if (linksCountError) console.error('❌ Database error (links count):', linksCountError)

        const { count: qrCount, error: qrCountError } = await supabase.from('qr_redirects').select('id', { count: 'exact', head: true })
        if (qrCountError) console.error('❌ Database error (qr count):', qrCountError)
        
        return NextResponse.json({
            success: true,
            recentLogs: enrichedLogs,
            stats: {
                totalStructuredLinks: linksCount || 0,
                totalQRRedirects: qrCount || 0
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
