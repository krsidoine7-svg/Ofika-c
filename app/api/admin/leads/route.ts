import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { requireStaffAuth } from '@/lib/auth/admin-guard'
import { AuditService } from '@/lib/services/audit-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireStaffAuth()
    if (authCheck.error) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status })
    }

    const supabase = createAdminClient()

    const { data: leads, error } = await supabase
      .from('captured_contacts')
      .select(`
        *,
        profiles (
          id,
          name,
          username
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      leads: leads || []
    })

  } catch (error: any) {
    console.error('Erreur GET /api/admin/leads:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireStaffAuth()
    if (authCheck.error) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Identifiant du lead requis' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('captured_contacts')
      .delete()
      .eq('id', id)

    if (error) throw error

    await AuditService.log({
      action: 'LEAD_DELETE',
      targetType: 'contact',
      targetId: id,
      actorId: authCheck.user?.id,
      actorEmail: authCheck.user?.email,
      severity: 'info',
      details: { deletedLeadId: id }
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Contact supprimé avec succès' })
  } catch (error: any) {
    console.error('Erreur DELETE /api/admin/leads:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
