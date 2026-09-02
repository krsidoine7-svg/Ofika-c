import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const featured = searchParams.get('is_featured')
    const ticketId = searchParams.get('ticket_id')

    if (ticketId) {
      const { data: messages, error: msgErr } = await adminSupabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (msgErr) {
        console.error('❌ Error fetching ticket messages via API:', msgErr)
        return NextResponse.json({ error: msgErr.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, data: messages || [] })
    }

    let query = adminSupabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    } else if (featured === 'false') {
      query = query.eq('is_featured', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching admin tickets via API:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    console.error('❌ Admin Tickets API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    const body = await request.json()
    const { id, is_featured, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing ticket ID' }, { status: 400 })
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (typeof is_featured === 'boolean') updates.is_featured = is_featured
    if (status) updates.status = status

    const { data, error } = await adminSupabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    const body = await request.json()
    const { ticket_id, message } = body

    if (!ticket_id || !message) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const { data: msg, error: msgError } = await adminSupabase
      .from('ticket_messages')
      .insert({
        ticket_id,
        is_admin_reply: true,
        message
      })
      .select()
      .single()

    if (msgError) throw msgError

    // Mettre à jour le statut du ticket à in_progress
    await adminSupabase
      .from('support_tickets')
      .update({
        updated_at: new Date().toISOString(),
        status: 'in_progress'
      })
      .eq('id', ticket_id)

    // Notifier le client de la réponse
    const { data: ticket } = await adminSupabase
      .from('support_tickets')
      .select('user_id, ticket_number')
      .eq('id', ticket_id)
      .single()

    if (ticket?.user_id) {
      try {
        await adminSupabase.from('notifications').insert({
          user_id: ticket.user_id,
          type: 'support_reply',
          title: `Nouveau message de l'équipe Ofika (${ticket.ticket_number})`,
          message: message.substring(0, 100) + '...',
          reference_id: ticket.ticket_number
        })
      } catch (_) {}
    }

    return NextResponse.json({ success: true, data: msg })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
