// =====================================================
// SERVICE API POUR BILLETERIE, AVIS & SUPPORT OFIKA
// =====================================================

import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/service-role'

export interface SupportTicket {
  id: string
  user_id: string
  ticket_number: string
  category: 'review' | 'suggestion' | 'bug' | 'support'
  subject: string
  description: string
  rating?: number
  author_name?: string
  author_role?: string
  author_location?: string
  author_avatar_url?: string
  is_verified: boolean
  is_featured: boolean
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id?: string
  is_admin_reply: boolean
  message: string
  attachments?: string[]
  created_at: string
}

function getSupabase() {
  return createClient()
}

/**
  Génère un numéro unique de ticket (#OFK-XXXX)
 */
function generateTicketNumber(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `#OFK-${randomNum}`
}

/**
  Créer un nouveau ticket / avis / suggestion
 */
export async function createSupportTicket(input: {
  category: 'review' | 'suggestion' | 'bug' | 'support'
  subject: string
  description: string
  rating?: number
  author_name?: string
  author_role?: string
  author_location?: string
  author_avatar_url?: string
}): Promise<{ success: boolean; data?: SupportTicket; error?: string }> {
  try {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Vous devez être connecté pour soumettre une demande.' }
    }

    const ticketNumber = generateTicketNumber()

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        ticket_number: ticketNumber,
        category: input.category,
        subject: input.subject,
        description: input.description,
        rating: input.rating || null,
        author_name: input.author_name || user.user_metadata?.name || user.email?.split('@')[0],
        author_role: input.author_role || null,
        author_location: input.author_location || "Abidjan, Côte d'Ivoire",
        author_avatar_url: input.author_avatar_url || user.user_metadata?.avatar_url || null,
        is_verified: true,
        is_featured: input.category === 'review',
        status: 'open',
        priority: 'medium'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating support ticket:', error)
      return { success: false, error: error.message }
    }

    // Créer le premier message initial
    await supabase.from('ticket_messages').insert({
      ticket_id: data.id,
      sender_id: user.id,
      is_admin_reply: false,
      message: input.description
    })

    // Insérer une notification système pour l'admin
    try {
      const adminSupabase = createAdminClient()
      const categoryLabel = input.category === 'review' ? 'Avis Client ⭐' : input.category === 'suggestion' ? 'Suggestion 💡' : 'Ticket Support ❓'
      await adminSupabase.from('notifications').insert({
        user_id: user.id, // Utilisateur concerné
        type: 'new_ticket',
        title: `Nouveau ${categoryLabel} (${ticketNumber})`,
        message: `${input.author_name || user.email}: "${input.subject}"`,
        reference_id: ticketNumber,
        action_url: '/dashboard/admin/tickets'
      })
    } catch (_) {}

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in createSupportTicket:', error)
    return { success: false, error: error.message }
  }
}

/**
  Récupérer les tickets de l'utilisateur connecté
 */
export async function getUserSupportTickets(): Promise<{
  success: boolean
  data?: SupportTicket[]
  error?: string
}> {
  try {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user tickets:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
  Récupérer les messages d'un ticket spécifique
 */
export async function getTicketMessages(ticketId: string): Promise<{
  success: boolean
  data?: TicketMessage[]
  error?: string
}> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/admin/tickets?ticket_id=${ticketId}`)
      const json = await res.json()
      if (json.success && json.data) {
        return json
      }
    }

    const supabase = typeof window === 'undefined' ? createAdminClient() : getSupabase()

    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching ticket messages:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
  Envoyer un message de réponse dans un ticket
 */
export async function replyToTicket(
  ticketId: string,
  message: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; data?: TicketMessage; error?: string }> {
  try {
    if (isAdmin && typeof window !== 'undefined') {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, message })
      })
      return await res.json()
    }

    const supabase = typeof window === 'undefined' || isAdmin ? createAdminClient() : getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: msg, error: msgError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: user?.id || null,
        is_admin_reply: isAdmin,
        message: message
      })
      .select()
      .single()

    if (msgError) throw msgError

    // Mettre à jour le statut et l'horodatage du ticket
    await supabase
      .from('support_tickets')
      .update({
        updated_at: new Date().toISOString(),
        status: isAdmin ? 'in_progress' : 'open'
      })
      .eq('id', ticketId)

    // Si la réponse est de l'admin, envoyer une notification au client
    if (isAdmin) {
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select('user_id, ticket_number')
        .eq('id', ticketId)
        .single()

      if (ticket) {
        try {
          await supabase.from('notifications').insert({
            user_id: ticket.user_id,
            type: 'support_reply',
            title: `Nouveau message de l'équipe Ofika (${ticket.ticket_number})`,
            message: message.substring(0, 100) + '...',
            reference_id: ticket.ticket_number,
            action_url: '/dashboard/tickets'
          })
        } catch (_) {}
      }
    } else {
      // Si la réponse vient d'un client, notifier l'équipe d'administration
      try {
        const adminSupabase = createAdminClient()
        const { data: ticket } = await adminSupabase
          .from('support_tickets')
          .select('ticket_number, author_name, user_id')
          .eq('id', ticketId)
          .single()

        if (ticket) {
          await adminSupabase.from('notifications').insert({
            user_id: ticket.user_id,
            type: 'support_message',
            title: `Nouveau message client (${ticket.ticket_number})`,
            message: `${ticket.author_name || 'Client'}: "${message.substring(0, 100)}..."`,
            reference_id: ticket.ticket_number,
            action_url: '/dashboard/admin/tickets'
          })
        }
      } catch (_) {}
    }

    return { success: true, data: msg }
  } catch (error: any) {
    console.error('Error in replyToTicket:', error)
    return { success: false, error: error.message }
  }
}

/**
  Récupérer tous les tickets pour l'administrateur
 */
export async function getAllSupportTicketsForAdmin(filters?: {
  category?: string
  status?: string
  is_featured?: boolean
}): Promise<{ success: boolean; data?: SupportTicket[]; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.status) params.append('status', filters.status)
      if (typeof filters?.is_featured === 'boolean') params.append('is_featured', String(filters.is_featured))

      const res = await fetch(`/api/admin/tickets?${params.toString()}`)
      const json = await res.json()
      return json
    }

    const adminSupabase = createAdminClient()
    let query = adminSupabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (typeof filters?.is_featured === 'boolean') {
      query = query.eq('is_featured', filters.is_featured)
    }

    const { data, error } = await query
    if (error) return { success: false, error: error.message }
    return { success: true, data: data || [] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
  Basculer la mise en avant d'un avis sur la Landing Page (Admin)
 */
export async function toggleTicketFeatured(
  ticketId: string,
  isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, is_featured: isFeatured })
      })
      return await res.json()
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('support_tickets')
      .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
  Mettre à jour le statut d'un ticket (Admin)
 */
export async function updateTicketStatus(
  ticketId: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, status })
      })
      return await res.json()
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('support_tickets')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
  Récupérer les avis publics mis en avant pour la Landing Page
 */
export async function getFeaturedPublicReviews(): Promise<{
  success: boolean
  data?: SupportTicket[]
  error?: string
}> {
  try {
    const supabase = typeof window === 'undefined' ? createAdminClient() : getSupabase()

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('is_featured', true)
      .eq('category', 'review')
      .order('rating', { ascending: false })

    if (error) {
      console.error('Error fetching public reviews:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
