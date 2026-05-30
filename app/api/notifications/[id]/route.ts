import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'


// Interface pour la réponse
interface NotificationUpdateResponse {
  success: boolean
  error?: string
}

// PUT - Marquer une notification comme lue
export async function PUT(request: NextRequest): Promise<NextResponse<NotificationUpdateResponse>> {
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

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Marquer toutes les notifications comme lues
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Erreur lors du marquage de toutes les notifications:', error)
        return NextResponse.json(
          { success: false, error: 'Erreur lors du marquage des notifications' },
          { status: 500 }
        )
      }
    } else if (notificationId) {
      // Marquer une notification spécifique comme lue
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erreur lors du marquage de la notification:', error)
        return NextResponse.json(
          { success: false, error: 'Erreur lors du marquage de la notification' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'notificationId ou markAllAsRead requis' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur dans l\'API notifications PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une notification
export async function DELETE(request: NextRequest): Promise<NextResponse<NotificationUpdateResponse>> {
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

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'ID de notification requis' },
        { status: 400 }
      )
    }

    // Supprimer la notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erreur lors de la suppression de la notification:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de la notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur dans l\'API notifications DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
