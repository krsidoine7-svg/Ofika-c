// =====================================================
// SERVICE DE GESTION DES CAMPAGNES QR
// CRUD complet pour organiser les QR codes
// =====================================================

import { createClient } from '@/lib/supabase/client'

/**
 * Types pour les campagnes
 */
export interface QRCampaign {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  total_qr_codes: number
  total_scans: number
  created_at: string
  updated_at: string
}

export interface CreateCampaignInput {
  name: string
  description?: string
  color?: string
}

export interface UpdateCampaignInput {
  name?: string
  description?: string
  color?: string
}

/**
 * Récupère toutes les campagnes de l'utilisateur
 */
export async function getUserCampaigns(): Promise<{
  success: boolean
  data?: QRCampaign[]
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const { data, error } = await supabase
      .from('qr_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getUserCampaigns:', error)
    return { success: false, error: 'Erreur lors de la récupération des campagnes' }
  }
}

/**
 * Récupère une campagne par son ID
 */
export async function getCampaignById(id: string): Promise<{
  success: boolean
  data?: QRCampaign
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const { data, error } = await supabase
      .from('qr_campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching campaign:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getCampaignById:', error)
    return { success: false, error: 'Erreur lors de la récupération de la campagne' }
  }
}

/**
 * Crée une nouvelle campagne
 */
export async function createCampaign(
  input: CreateCampaignInput
): Promise<{
  success: boolean
  data?: QRCampaign
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Validation
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: 'Le nom de la campagne est requis' }
    }

    if (input.name.length > 100) {
      return { success: false, error: 'Le nom ne doit pas dépasser 100 caractères' }
    }

    const { data, error } = await supabase
      .from('qr_campaigns')
      .insert({
        user_id: user.id,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        color: input.color || '#f97316'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createCampaign:', error)
    return { success: false, error: 'Erreur lors de la création de la campagne' }
  }
}

/**
 * Met à jour une campagne
 */
export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput
): Promise<{
  success: boolean
  data?: QRCampaign
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Validation
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        return { success: false, error: 'Le nom de la campagne est requis' }
      }
      if (input.name.length > 100) {
        return { success: false, error: 'Le nom ne doit pas dépasser 100 caractères' }
      }
    }

    const updateData: any = {}
    if (input.name !== undefined) updateData.name = input.name.trim()
    if (input.description !== undefined) updateData.description = input.description?.trim() || null
    if (input.color !== undefined) updateData.color = input.color

    const { data, error } = await supabase
      .from('qr_campaigns')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in updateCampaign:', error)
    return { success: false, error: 'Erreur lors de la mise à jour de la campagne' }
  }
}

/**
 * Supprime une campagne
 */
export async function deleteCampaign(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const { error } = await supabase
      .from('qr_campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting campaign:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteCampaign:', error)
    return { success: false, error: 'Erreur lors de la suppression de la campagne' }
  }
}

/**
 * Récupère les statistiques d'une campagne
 */
export async function getCampaignStats(campaignId: string): Promise<{
  success: boolean
  data?: {
    total_qr_codes: number
    total_scans: number
    active_qr_codes: number
    recent_scans: number
  }
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Récupérer la campagne
    const { data: campaign, error: campaignError } = await supabase
      .from('qr_campaigns')
      .select('total_qr_codes, total_scans')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (campaignError) {
      return { success: false, error: campaignError.message }
    }

    // Compter les QR codes actifs
    const { count: activeCount } = await supabase
      .from('qr_redirects')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('is_active', true)

    // Compter les scans récents (7 derniers jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // D'abord récupérer les IDs des QR de cette campagne
    const { data: qrIds } = await supabase
      .from('qr_redirects')
      .select('id')
      .eq('campaign_id', campaignId)

    const qrIdList = qrIds?.map(qr => qr.id) || []

    // Puis compter les scans récents
    const { count: recentScansCount } = await supabase
      .from('qr_scans')
      .select('*', { count: 'exact', head: true })
      .in('qr_redirect_id', qrIdList)
      .gte('scanned_at', sevenDaysAgo.toISOString())

    return {
      success: true,
      data: {
        total_qr_codes: campaign.total_qr_codes || 0,
        total_scans: campaign.total_scans || 0,
        active_qr_codes: activeCount || 0,
        recent_scans: recentScansCount || 0
      }
    }
  } catch (error) {
    console.error('Error in getCampaignStats:', error)
    return { success: false, error: 'Erreur lors de la récupération des statistiques' }
  }
}

/**
 * Couleurs prédéfinies pour les campagnes
 */
export const CAMPAIGN_COLORS = [
  { name: 'Orange', value: '#f97316' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Vert', value: '#10b981' },
  { name: 'Jaune', value: '#f59e0b' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Gris', value: '#6b7280' },
]
