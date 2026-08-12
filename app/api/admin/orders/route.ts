import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { AuditService } from '@/lib/services/audit-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient()

        // 1. Récupérer toutes les commandes
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (ordersError) throw ordersError

        // 2. Récupérer les informations des utilisateurs associés
        const userIds = Array.from(new Set((ordersData || []).map(o => o.user_id).filter(Boolean)))

        let usersMap = new Map()
        if (userIds.length > 0) {
            const { data: usersData } = await supabase
                .from('users')
                .select('id, name, email')
                .in('id', userIds)

            usersMap = new Map(usersData?.map(u => [u.id, u]) || [])
        }

        const mergedOrders = (ordersData || []).map(order => ({
            ...order,
            user: usersMap.get(order.user_id) || { name: 'Client Inconnu', email: 'N/A' }
        }))

        return NextResponse.json({ success: true, orders: mergedOrders })
    } catch (error: any) {
        console.error('Erreur GET /api/admin/orders:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        const { id, payment_status, shipping_status, status, paid_at, shipped_at, delivered_at } = await request.json()

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID de commande requis' }, { status: 400 })
        }

        const updateData: Record<string, any> = {
            updated_at: new Date().toISOString()
        }

        if (payment_status !== undefined) updateData.payment_status = payment_status
        if (shipping_status !== undefined) updateData.shipping_status = shipping_status
        if (status !== undefined) updateData.status = status
        if (paid_at !== undefined) updateData.paid_at = paid_at
        if (shipped_at !== undefined) updateData.shipped_at = shipped_at
        if (delivered_at !== undefined) updateData.delivered_at = delivered_at

        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single()

        if (error) {
            console.error('Erreur mise à jour commande Supabase:', error)
            throw error
        }

        // Tenter d'insérer une notification directe pour l'utilisateur
        if (updatedOrder?.user_id) {
            try {
                let notifTitle = ''
                let notifMsg = ''
                let notifType = ''

                if (payment_status === 'succeeded' || payment_status === 'paid' || status === 'paid') {
                    notifType = 'payment_success'
                    notifTitle = 'Paiement confirmé !'
                    notifMsg = 'Votre paiement a été validé. Nous préparons votre carte.'
                } else if (payment_status === 'failed' || status === 'failed') {
                    notifType = 'payment_failed'
                    notifTitle = 'Paiement refusé'
                    notifMsg = "Votre reçu de paiement n'est pas valide. Veuillez en soumettre un nouveau."
                } else if (status === 'preparing') {
                    notifType = 'production_started'
                    notifTitle = 'En production'
                    notifMsg = 'Votre carte NFC personnalisée est en cours de fabrication.'
                } else if (shipping_status === 'shipped' || status === 'shipped') {
                    notifType = 'shipped'
                    notifTitle = 'Commande expédiée !'
                    notifMsg = 'Bonne nouvelle ! Votre carte est en route vers l\'adresse indiquée.'
                } else if (shipping_status === 'delivered' || status === 'delivered') {
                    notifType = 'delivered'
                    notifTitle = 'Commande livrée'
                    notifMsg = 'Votre carte Ofika a été livrée. Profitez bien de votre nouveau réseau !'
                }

                if (notifType) {
                    await supabase.from('notifications').insert({
                        user_id: updatedOrder.user_id,
                        type: notifType,
                        title: notifTitle,
                        message: notifMsg,
                        reference_id: id,
                        link: '/dashboard/orders'
                    })
                }
            } catch (notifErr) {
                console.log('Notification optionnelle ignorée:', notifErr)
            }
        }

        await AuditService.log({
            action: 'ORDER_STATUS_UPDATE',
            targetType: 'order',
            targetId: id,
            details: updateData
        })

        return NextResponse.json({ success: true, order: updatedOrder })
    } catch (error: any) {
        console.error('Erreur PATCH /api/admin/orders:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
