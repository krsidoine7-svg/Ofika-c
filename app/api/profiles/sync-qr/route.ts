import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  console.log('[Sync-QR] API Called')
  
  try {
    const supabase = await createClient()
    
    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('[Sync-QR] Auth failed:', authError)
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const { profileId, newSlug, oldSlug, name } = await request.json()
    console.log(`[Sync-QR] Processing sync for user ${user.id}`, { profileId, newSlug, oldSlug, name })

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')
    const newTargetUrl = `${appUrl}/${newSlug}`

    // 1. Fetch all redirects for this user
    const { data: redirects, error: fetchError } = await adminClient
      .from('qr_redirects')
      .select('id, nfc_link, title, description')
      .eq('user_id', user.id)

    if (fetchError) {
        console.error('[Sync-QR] Fetch error:', fetchError)
        throw fetchError
    }

    console.log(`[Sync-QR] Found ${redirects?.length || 0} redirects to check`)

    let updatedCount = 0

    if (redirects && redirects.length > 0) {
      for (const redir of redirects) {
        const url = (redir.nfc_link || '').toLowerCase()
        
        // Conditions match
        const isOldSlugMatch = oldSlug ? url.endsWith(`/${oldSlug.toLowerCase()}`) : false
        const isIdMatch = url.includes(`/card/${profileId}`) || url.includes(`/${profileId}`)
        const isNameMatch = name ? (
            (redir.title || '').toLowerCase().includes(name.toLowerCase()) ||
            (redir.description || '').toLowerCase().includes(name.toLowerCase())
        ) : false

        if ((isOldSlugMatch || isIdMatch || isNameMatch) && redir.nfc_link !== newTargetUrl) {
          console.log(`[Sync-QR] Updating redirect ${redir.id} from ${redir.nfc_link} to ${newTargetUrl}`)
          
          const { error: updateError } = await adminClient
            .from('qr_redirects')
            .update({ 
              nfc_link: newTargetUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', redir.id)

          if (updateError) {
              console.error(`[Sync-QR] Update error for ${redir.id}:`, updateError)
          } else {
              updatedCount++
          }
        }
      }
    }

    console.log(`[Sync-QR] Sync completed for redirects. Updated ${updatedCount}. Moving to digital_nfc_cards...`)

    // 3. Update digital_nfc_cards table
    console.log(`[Sync-QR] Updating digital_nfc_cards for profile ${profileId}`)
    const { error: cardUpdateError } = await adminClient
      .from('digital_nfc_cards')
      .update({
        nfc_link: newTargetUrl,
        custom_url: newSlug,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', profileId)
      .eq('user_id', user.id)

    if (cardUpdateError) {
      console.error('[Sync-QR] Card update error:', cardUpdateError)
    } else {
      console.log('[Sync-QR] digital_nfc_cards updated successfully')
    }

    return NextResponse.json({ success: true, updatedCount })

  } catch (error: any) {
    console.error('[Sync-QR] Exception:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur interne de synchronisation' 
    }, { status: 500 })
  }
}
