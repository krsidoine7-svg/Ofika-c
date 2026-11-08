// =====================================================
// QR CODES DYNAMIQUES — côté serveur
// Seul l'enregistrement des scans vit ici (utilisé par /qr/[shortCode]).
// Création, modification, statistiques : voir lib/services/qr-redirect-client.ts
// =====================================================

/**
 * Enregistre un scan de QR code
 */
export async function trackQRScan(
  shortCode: string,
  scanData: {
    userAgent?: string
    referrer?: string
    ipAddress?: string
    country?: string
    city?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/service-role')
    const { parseUserAgent } = await import('@/lib/utils/analytics-parser')
    const adminSupabase = createAdminClient()
    
    // Récupérer la redirection via adminSupabase
    const { data: redirect } = await adminSupabase
      .from('qr_redirects')
      .select('id, user_id, target_url')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single()

    if (!redirect) {
      return { success: false, error: 'Redirection non trouvée' }
    }
    
    const parsedUA = parseUserAgent(scanData.userAgent)
    const country = scanData.country || "Côte d'Ivoire"
    const city = scanData.city || "Abidjan"

    // Enregistrer le scan dans qr_scans
    const { error: scanError } = await adminSupabase
      .from('qr_scans')
      .insert({
        qr_redirect_id: redirect.id,
        user_agent: scanData.userAgent || null,
        ip_address: scanData.ipAddress || null,
        device_type: parsedUA.deviceType,
        os: parsedUA.os,
        browser: parsedUA.browser,
        country: country,
        city: city,
        referrer: scanData.referrer || 'Direct Scan',
        scanned_at: new Date().toISOString()
      })

    if (scanError) {
      console.error('❌ Erreur enregistrement scan QR:', scanError)
    } else {
      console.log(`✅ Scan enregistré avec succès pour QR "${shortCode}" (${parsedUA.deviceType}, ${parsedUA.os}, ${city})`)
    }

    // Synchroniser avec analytics_events si le lien pointe vers un profil
    try {
      const targetUrl = redirect.target_url || ''
      const urlParts = targetUrl.split('/').filter(Boolean)
      const lastSlug = urlParts[urlParts.length - 1]

      if (lastSlug) {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('id')
          .or(`custom_url.eq.${lastSlug},username.eq.${lastSlug}`)
          .maybeSingle()

        if (profile) {
          await adminSupabase.from('analytics_events').insert({
            profile_id: profile.id,
            user_id: redirect.user_id,
            event_type: 'qr_scanned',
            event_data: {
              ip: scanData.ipAddress || null,
              city,
              country,
              browser: parsedUA.browser,
              os: parsedUA.os,
              referrer: scanData.referrer || 'QR Scan'
            },
            user_agent: scanData.userAgent || '',
            device_type: parsedUA.deviceType.toLowerCase() as any
          })
          console.log(`✅ Event qr_scanned synchronisé pour le profil ${profile.id}`)
        }
      }
    } catch (syncErr) {
      console.warn('⚠️ Échec de la synchronisation de l\'événement analytics_events:', syncErr)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in trackQRScan:', error)
    return { success: false, error: error.message }
  }
}
