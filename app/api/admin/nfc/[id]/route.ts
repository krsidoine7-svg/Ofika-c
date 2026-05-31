import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

        // On utilise le service role pour bypasser le RLS en tant qu'admin
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        const table = 'digital_nfc_cards'

        const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Erreur Supabase lors de la suppression NFC:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Carte supprimée avec succès' })
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
        const body = await request.json()
        const { id } = await params
        
        if (!id) {
            return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        const table = 'digital_nfc_cards'

        const { error } = await supabaseAdmin
            .from(table)
            .update(body)
            .eq('id', id)

        if (error) {
            console.error('Erreur Supabase lors de la mise à jour NFC:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Carte mise à jour avec succès' })
    } catch (error: any) {
        console.error('Erreur API mise à jour NFC:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
