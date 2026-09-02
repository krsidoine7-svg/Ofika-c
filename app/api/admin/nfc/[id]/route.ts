import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/service-role'
import { normalizeToFullUrl } from '@/lib/utils/qr-validation'

export const dynamic = 'force-dynamic'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
        }

        const supabaseAdmin = createAdminClient()

        // 1. Récupérer la carte pour obtenir le qr_redirect_id et le lien NFC
        const { data: card } = await supabaseAdmin
            .from('digital_nfc_cards')
            .select('qr_redirect_id, nfc_link, preview_data, user_id')
            .eq('id', id)
            .maybeSingle()

        const qrRedirectId = card?.qr_redirect_id || (card?.preview_data as any)?.redirect_id || (card?.preview_data as any)?.qr_redirect_id

        // 2. Supprimer/Désactiver le QR code associé dans qr_redirects
        if (qrRedirectId) {
            await supabaseAdmin
                .from('qr_redirects')
                .update({ 
                    deleted_at: new Date().toISOString(),
                    is_active: false
                })
                .eq('id', qrRedirectId)
        } else if (card?.nfc_link && card?.user_id) {
            await supabaseAdmin
                .from('qr_redirects')
                .update({ 
                    deleted_at: new Date().toISOString(),
                    is_active: false
                })
                .eq('user_id', card.user_id)
                .eq('target_url', card.nfc_link)
        }

        // 3. Supprimer la carte NFC
        const { error } = await supabaseAdmin
            .from('digital_nfc_cards')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Erreur Supabase lors de la suppression NFC:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Carte et QR code associé supprimés avec succès' })
    } catch (error: any) {
        console.error('Erreur API suppression NFC:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const supabaseAdmin = createAdminClient()

        // Mettre à jour la carte
        const { data: updatedCard, error } = await supabaseAdmin
            .from('digital_nfc_cards')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erreur mise à jour NFC:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Si la carte a un QR dynamique associé et que le lien a changé, on le met à jour
        if (body.nfc_link) {
            const qrRedirectId = updatedCard.qr_redirect_id || (updatedCard.preview_data as any)?.redirect_id;
            if (qrRedirectId) {
                const fullTargetUrl = normalizeToFullUrl(body.nfc_link);

                await supabaseAdmin
                    .from('qr_redirects')
                    .update({ 
                        target_url: fullTargetUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', qrRedirectId);
            }
        }

        return NextResponse.json({ success: true, message: 'Carte mise à jour avec succès' })
    } catch (error: any) {
        console.error('Erreur API mise à jour NFC:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
