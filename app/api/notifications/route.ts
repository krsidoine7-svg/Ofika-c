import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Interface pour les données de requête
interface NotificationRequest {
    type: 'order_confirmed' | 'payment_success' | 'production_started' | 'shipped' | 'delivered' | 'payment_failed'
    title: string
    message: string
    orderId?: string
    actionUrl?: string
}

// Interface pour la réponse
interface NotificationResponse {
    success: boolean
    notification?: {
        id: string
        type: string
        title: string
        message: string
        timestamp: string
        read: boolean
        orderId?: string
        actionUrl?: string
    }
    error?: string
}

// GET - Récupérer les notifications d'un utilisateur
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const supabase = await createClient()

        // Vérifier l'authentification
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Récupérer les notifications de l'utilisateur
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Erreur lors de la récupération des notifications:', error)
            return NextResponse.json(
                { success: false, error: 'Erreur lors de la récupération des notifications' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            notifications: notifications || [],
            unreadCount: notifications?.filter(n => !n.read).length || 0
        })

    } catch (error) {
        console.error('Erreur dans l\'API notifications GET:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur interne du serveur' },
            { status: 500 }
        )
    }
}

// POST - Créer une nouvelle notification
export async function POST(request: NextRequest): Promise<NextResponse<NotificationResponse>> {
    try {
        const supabase = await createClient()

        // Vérifier l'authentification (admin ou soi-même, ici on accepte l'utilisateur lui-même pour simplification mais normalement c'est déclenché par le système)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const body = await request.json() as NotificationRequest
        const { type, title, message, orderId, actionUrl } = body

        // Validation des données
        if (!type || !title || !message) {
            return NextResponse.json(
                { success: false, error: 'Type, titre et message sont requis' },
                { status: 400 }
            )
        }

        // Créer la notification
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                type,
                title,
                message,
                order_id: orderId,
                action_url: actionUrl,
                read: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Erreur lors de la création de la notification:', error)
            return NextResponse.json(
                { success: false, error: 'Erreur lors de la création de la notification' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            notification: {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                timestamp: notification.created_at,
                read: notification.read,
                orderId: notification.order_id,
                actionUrl: notification.action_url
            }
        })

    } catch (error) {
        console.error('Erreur dans l\'API notifications POST:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur interne du serveur' },
            { status: 500 }
        )
    }
}

// PUT - Marquer comme lu
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { notificationId, markAllAsRead } = body

        if (markAllAsRead) {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false)
            if (error) throw error
        } else if (notificationId) {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId)
                .eq('user_id', user.id)
            if (error) throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// DELETE - Supprimer
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
