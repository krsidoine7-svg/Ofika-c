import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        if (!id) {
            return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        
        // 1. Récupérer la carte NFC
        const { data: card, error: fetchError } = await supabaseAdmin
            .from('digital_nfc_cards')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !card) {
            return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 })
        }

        let nfcLink = card.nfc_link || (card.preview_data as any)?.nfc_link

        if (!nfcLink) {
            return NextResponse.json({ error: 'Lien NFC manquant sur la carte' }, { status: 400 })
        }

        // SMART STORAGE: Si le lien contient notre domaine, on ne garde que le slug
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')
        if (nfcLink.includes(appUrl)) {
            // Extrait ce qui vient après le domaine (ex: "errison")
            const parts = nfcLink.split(appUrl)
            if (parts.length > 1) {
                nfcLink = parts[1].replace(/^\//, '') // retire le slash initial si présent
                console.log('🔗 Slug extrait de l\'URL interne:', nfcLink)
            }
        }

        // 2 & 3. Gérer la redirection QR (Mise à jour si existe, sinon création)
        let redirectId = card.qr_redirect_id || (card.preview_data as any)?.redirect_id;
        let shortCode = (card.preview_data as any)?.short_code;
        let redirect;

        if (redirectId) {
            console.log('🔄 Mise à jour de la redirection existante:', redirectId);
            const { data: updatedRedirect, error: updateError } = await supabaseAdmin
                .from('qr_redirects')
                .update({
                    nfc_link: nfcLink,
                    title: `QR Régénéré - ${card.profile_name || 'Sans titre'}`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', redirectId)
                .select()
                .single();
            
            if (!updateError) {
                redirect = updatedRedirect;
                shortCode = redirect.short_code;
            }
        }

        // Si pas de redirection existante ou erreur de mise à jour, on en crée une nouvelle
        if (!redirect) {
            console.log('✨ Création d\'une nouvelle redirection QR');
            shortCode = await generateUniqueShortCode(supabaseAdmin);
            const { data: newRedirect, error: insertError } = await supabaseAdmin
                .from('qr_redirects')
                .insert({
                    user_id: card.user_id,
                    short_code: shortCode,
                    nfc_link: nfcLink,
                    redirect_type: 'nfc_card',
                    title: `QR Régénéré - ${card.profile_name || 'Sans titre'}`,
                    is_active: true,
                    scan_count: 0
                })
                .select()
                .single();

            if (insertError) {
                console.error('Erreur lors de la création du redirect QR:', insertError);
                return NextResponse.json({ error: 'Erreur lors de la création de la redirection QR' }, { status: 500 });
            }
            redirect = newRedirect;
        }

        // 4. Mettre à jour la carte avec le nouveau QR
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
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
            return NextResponse.json({ error: 'Erreur lors de la mise à jour de la carte' }, { status: 500 })
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
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
