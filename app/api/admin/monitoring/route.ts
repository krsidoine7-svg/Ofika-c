import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient()

        // 1. Fetch Audit Logs (Recent actions)
        const { data: auditLogs, error: auditError } = await supabase
            .from('admin_audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30)

        // 2. Fetch Errors
        const { data: systemErrors } = await supabase
            .from('admin_audit_logs')
            .select('*')
            .eq('severity', 'error')
            .order('created_at', { ascending: false })
            .limit(10)

        // 3. System Status Mock
        const status = {
            database: { status: 'healthy', latency: '45ms' },
            auth: { status: 'healthy', latency: '12ms' },
            storage: { status: 'healthy', latency: '89ms' },
            api: { status: 'healthy', latency: '10ms' },
            memory_usage: '42%',
            cpu_load: '12%'
        }

        // 4. Security Alerts
        const { data: alerts } = await supabase
            .from('admin_audit_logs')
            .select('*')
            .or('action.ilike.%failed%,action.ilike.%suspicious%,action.ilike.%unauthorized%,severity.eq.error')
            .order('created_at', { ascending: false })
            .limit(10)

        return NextResponse.json({
            success: true,
            logs: auditLogs || [],
            errors: systemErrors || [],
            status,
            security_alerts: alerts || []
        })

    } catch (error: any) {
        console.error('Monitoring API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
