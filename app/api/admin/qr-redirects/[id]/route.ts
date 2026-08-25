import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { normalizeToFullUrl } from '@/lib/utils/qr-validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check admin authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'super_admin')) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validUpdates = ['target_url', 'is_active', 'title', 'description', 'short_code']
    
    const updates: any = {}
    validUpdates.forEach(key => {
        if (body[key] !== undefined) {
            if (key === 'target_url') {
                updates[key] = normalizeToFullUrl(body[key])
            } else {
                updates[key] = body[key]
            }
        }
    })

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ success: false, error: 'Aucune donnée à mettre à jour' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    // Use Service Role for operations to bypass RLS
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await adminClient
      .from('qr_redirects')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Exception updating qr redirect:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check admin authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'super_admin')) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 })
    }

    // Use Service Role for operations to bypass RLS
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminClient
      .from('qr_redirects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database delete error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Exception deleting qr redirect:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
