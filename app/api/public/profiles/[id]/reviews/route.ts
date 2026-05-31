import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: profileId } = await params

    // 1. Get Profile to check display_reviews and get user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, display_reviews')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if reviews should be displayed
    // Note: If display_reviews is false, we return empty list
    if (!profile.display_reviews) {
      return NextResponse.json({ data: [] })
    }

    // 2. Get review links associated with this user
    // Reviews are linked to review_links, which are linked to users.
    const { data: links, error: linksError } = await supabase
      .from('review_links')
      .select('id')
      .eq('user_id', profile.user_id)

    if (linksError) {
      console.error('Error fetching review links:', linksError)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    if (!links || links.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const linkIds = links.map(l => l.id)

    // 3. Get approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating, comment, client_name, created_at, media_url, media_type, link_id')
      .in('link_id', linkIds)
      .eq('moderation_status', 'approved')
      // Optional: check individual review privacy if it exists, assume consistent with admin view
      // .eq('is_public', true) // If this column exists and is used
      .order('created_at', { ascending: false })
      .limit(20)

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    return NextResponse.json({ data: reviews })

  } catch (error) {
    console.error('Error in public reviews API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
