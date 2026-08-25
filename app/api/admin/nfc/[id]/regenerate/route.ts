import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/service-role'
import { normalizeToFullUrl } from '@/lib/utils/qr-validation'

export const dynamic = 'force-dynamic'

/**
 * Génère un code court unique
 */
async function generateUniqueShortCode(supabase: any): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    let code = ''
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const { data } = await supabase
      .from('qr_redirects')
      .select('id')
      .eq('short_code', code)
      .maybeSingle()

    if (!data) {
      return code
    }

    attempts++
  }

  throw new Error('Impossible de générer un code unique')
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
        }

        const supabaseAdmin = createAdminClient()
        
        // 1. Récupérer la carte NFC
        const { data: card, error: fetchError } = await supabaseAdmin
            .from('digital_nfc_cards')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !card) {
            return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 })
        }

        let body: any = {}
        try {
            body = await request.json()
        } catch {
            // body optionnel
        }

        const rawNfcLink = body.nfc_link || card.nfc_link || (card.preview_data as any)?.nfc_link || `https://ofika.ci/card/${card.id}`
        const nfcLink = normalizeToFullUrl(rawNfcLink)

        // 2 & 3. Gérer la redirection QR (Mise à jour si existe, sinon création)
        let redirectId = card.qr_redirect_id || (card.preview_data as any)?.redirect_id;
        let shortCode = (card.preview_data as any)?.short_code;
        let redirect;

        if (redirectId) {
            console.log('🔄 Mise à jour de la redirection existante:', redirectId);
            const { data: updatedRedirect, error: updateError } = await supabaseAdmin
                .from('qr_redirects')
                .update({
                    target_url: nfcLink,
                    title: `QR Régénéré - ${card.profile_name || 'Sans titre'}`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', redirectId)
                .select()
                .maybeSingle();
            
            if (!updateError && updatedRedirect) {
                redirect = updatedRedirect;
                shortCode = redirect.short_code;
            }
        }

        // Si pas de redirection existante ou erreur de mise à jour, on en crée une nouvelle
        if (!redirect) {
            console.log('✨ Création d\'une nouvelle redirection QR');
            shortCode = await generateUniqueShortCode(supabaseAdmin);

            // Gérer le user_id pour respecter la contrainte FK (qr_redirects_user_id_users_id_fk)
            let validUserId: string | null = null
            if (card.user_id) {
                const { data: userCheck } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('id', card.user_id)
                    .maybeSingle()
                
                if (userCheck) {
                    validUserId = userCheck.id
                }
            }

            if (!validUserId && card.email) {
                const { data: userByEmail } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('email', card.email)
                    .maybeSingle()
                
                if (userByEmail) {
                    validUserId = userByEmail.id
                }
            }

            if (!validUserId) {
                const { data: fallbackUser } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .limit(1)
                    .maybeSingle()
                
                if (fallbackUser) {
                    validUserId = fallbackUser.id
                }
            }

            if (!validUserId) {
                return NextResponse.json({ error: 'Aucun utilisateur valide trouvé dans la base de données' }, { status: 500 })
            }

            const insertPayload: Record<string, any> = {
                user_id: validUserId,
                short_code: shortCode,
                target_url: nfcLink,
                type: 'nfc_card',
                title: `QR Régénéré - ${card.profile_name || 'Sans titre'}`,
                is_active: true
            }

            const { data: newRedirect, error: insertError } = await supabaseAdmin
                .from('qr_redirects')
                .insert(insertPayload)
                .select()
                .single();

            if (insertError) {
                console.error('Erreur lors de la création du redirect QR:', insertError);
                return NextResponse.json({ 
                    error: 'Erreur lors de la création de la redirection QR', 
                    details: insertError.message 
                }, { status: 500 });
            }
            redirect = newRedirect;
        }

        // 4. Mettre à jour la carte avec le nouveau QR
        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
        const redirectUrl = `${baseUrl}/qr/${shortCode}`
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(redirectUrl)}`

        const updatedPreviewData = {
            ...(card.preview_data || {}),
            qr_code_url: qrCodeUrl,
            nfc_link: nfcLink,
            short_code: shortCode,
            redirect_id: redirect.id
        }

        const { error: updateError } = await supabaseAdmin
            .from('digital_nfc_cards')
            .update({
                qr_redirect_id: redirect.id,
                qr_code_url: qrCodeUrl, 
                preview_data: updatedPreviewData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (updateError) {
            console.error('Erreur lors de la mise à jour de la carte:', updateError)
            return NextResponse.json({ error: 'Erreur lors de la mise à jour de la carte', details: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            message: 'QR Code régénéré avec succès',
            data: {
                short_code: shortCode,
                qr_code_url: qrCodeUrl
            }
        })

    } catch (error: any) {
        console.error('Erreur API régénération QR:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur', details: error.message }, { status: 500 })
    }
}
