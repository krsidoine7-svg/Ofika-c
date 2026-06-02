import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params
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

    // 3. Build Google Wallet Pass URL (Mode Développeur Hybride / fallback)
    // In production, you would construct a JWT signed by your Google Pay Service Account key.
    // In development mode, we construct a fully qualified redirect to mock standard Google Wallet save behavior.
    const walletData = {
      profileId: profile.id,
      name: profile.name,
      job: profile.job_title || "",
      company: profile.company || "",
      qrCodeUrl: `https://ofika.ci/${profile.username || profile.custom_url || profile.id}`
    }

    // Standard Google Pay save format
    // https://pay.google.com/gp/v/save/{jwt}
    // We provide a simulated save landing URL for development tests
    const simulatedUrl = `https://pay.google.com/gp/v/save/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.simulated-ofika-wallet-card-for-${profile.id}`

    return NextResponse.json({
      success: true,
      url: simulatedUrl,
      debugData: walletData
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/profiles/[profileId]/wallet/google:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
