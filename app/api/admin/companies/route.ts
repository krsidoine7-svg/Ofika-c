import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérification admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('API Companies Error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      companies: companies || []
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('companies')
      .insert([body])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, company: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
