import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export async function POST(request: NextRequest) {
  try {
    const { contactId, activityType, metadata } = await request.json()

    if (!contactId || !activityType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.rpc('log_contact_activity', {
      p_contact_id: contactId,
      p_activity_type: activityType,
      p_metadata: metadata || {}
    })

    if (error) {
      console.error('Error logging contact activity:', error)
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in contact-activity route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
