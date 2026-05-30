import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check admin authentication with standard client
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    // Verify admin status
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 })
    }

    // Use Service Role for data fetching to bypass RLS
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all qr redirects
    const { data: redirects, error } = await adminClient
      .from('qr_redirects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error details:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Fetch users for joining
    const { data: users, error: usersError } = await adminClient
      .from('users')
      .select('id, name, email')

    if (usersError) {
      console.error('Database users error details:', usersError)
    }

    const usersMap = new Map((users || []).map(u => [u.id, u]))

    const enhancedRedirects = (redirects || []).map(redirect => ({
      ...redirect,
      user: usersMap.get(redirect.user_id) || { name: 'Utilisateur Inconnu', email: 'N/A' }
    }))

    return NextResponse.json({ success: true, data: enhancedRedirects })
  } catch (error: any) {
    console.error('Exception fetching qr redirects:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
