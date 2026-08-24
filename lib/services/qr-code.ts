// =====================================================
// SERVICE POUR LA GÉNÉRATION DE CODES QR DYNAMIQUES
// =====================================================

import { createClient } from '@/lib/supabase/client'
import { getQRCodeURL, getRedirectURL } from './qr-redirect-client'

export interface QRCodeData {
  url: string
  size?: number
  format?: 'png' | 'svg'
}

export interface QRCodeResponse {
  success: boolean
  data?: {
    qr_code_url: string
    qr_code_data: string
    short_code?: string
    redirect_id?: string
  }
  error?: string
}

/**
 * Génère un code QR DYNAMIQUE pour une carte NFC
 * Le QR code pointe vers /qr/[shortCode] qui redirige vers la vraie URL
 */
export async function generateQRCode(
  nfcLink: string, 
  size: number = 200, 
  customSupabaseClient?: any
): Promise<QRCodeResponse> {
  try {
    // 1. Tenter de créer une redirection dynamique (pour les stats)
    try {
      const supabase = customSupabaseClient || createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let shortCode = ''
        for (let i = 0; i < 8; i++) {
          shortCode += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        const { data: redirectData, error: redirectError } = await supabase
          .from('qr_redirects')
          .insert({
            user_id: user.id,
            short_code: shortCode,
            target_url: nfcLink,
            nfc_link: nfcLink,
            type: 'nfc_card',
            redirect_type: 'nfc_card',
            title: 'Carte NFC',
            description: 'Redirection vers le profil NFC',
            is_active: true
          })
          .select()
          .single()

        if (!redirectError && redirectData) {
          const redirectUrl = getRedirectURL(shortCode)
          const qrCodeUrl = getQRCodeURL(shortCode, size)

          return {
            success: true,
            data: {
              qr_code_url: qrCodeUrl,
              qr_code_data: redirectUrl,
              short_code: shortCode,
              redirect_id: redirectData.id
            }
          }
        }
      }
    } catch (redirectErr) {
      console.warn('⚠️ Échec redirection dynamique, passage au mode statique:', redirectErr)
    }

    // 2. Fallback : Générer un QR code statique simple si le dynamique échoue
    const staticQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(nfcLink)}`
    
    return {
      success: true,
      data: {
        qr_code_url: staticQrUrl,
        qr_code_data: nfcLink
      }
    }
  } catch (error) {
    console.error('Error generating QR code:', error)
    return {
      success: false,
      error: 'Erreur lors de la génération du QR code'
    }
  }
}

/**
 * Met à jour le QR code d'une carte NFC
 */
export async function updateNFCCardQRCode(cardId: string, nfcLink: string): Promise<QRCodeResponse> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    // Générer le QR code
    const qrResult = await generateQRCode(nfcLink)
    
    if (!qrResult.success || !qrResult.data) {
      return qrResult
    }

    // Mettre à jour la carte NFC avec le QR code
    const { error } = await supabase
      .from('digital_nfc_cards')
      .update({
        qr_code_url: qrResult.data.qr_code_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating NFC card QR code:', error)
      return { success: false, error: error.message }
    }

    return qrResult
  } catch (error) {
    console.error('Error in updateNFCCardQRCode:', error)
    return { success: false, error: 'Erreur lors de la mise à jour du QR code' }
  }
}

/**
 * Génère un QR code pour partage
 */
export function generateShareableQRCode(data: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`
}
