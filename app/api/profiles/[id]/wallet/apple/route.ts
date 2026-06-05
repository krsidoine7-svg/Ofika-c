import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateApplePass } from '@/lib/services/wallet-service'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profileId = id
    const supabase = await createClient()

    // 1. Verify user auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // 2. Fetch target profile ensuring it belongs to the authenticated user
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // 3. Generate standard pkpass binary using wallet service
    const pkpassBuffer = await generateApplePass(profile)

    // 4. Return the file response with correct pkpass mime types and headers
    return new NextResponse(new Uint8Array(pkpassBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${profile.username || 'profile'}.pkpass"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/profiles/[id]/wallet/apple:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
