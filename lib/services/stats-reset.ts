// =====================================================
// SERVICE DE RÉINITIALISATION AUTOMATIQUE DES STATS
// =====================================================
// Gère le cycle de réinitialisation tous les 40 jours

import { createClient } from '@/lib/supabase/client'

const getSupabase = () => createClient()

// Constantes
const RESET_INTERVAL_DAYS = 40
const RESET_INTERVAL_MS = RESET_INTERVAL_DAYS * 24 * 60 * 60 * 1000

export interface StatsResetStatus {
  needsReset: boolean
  lastResetAt: string | null
  daysSinceReset: number
  daysUntilNextReset: number
}

export interface StatsResetResult {
  success: boolean
  deletedCount?: number
  message: string
  error?: string
}

/**
 * Vérifie si les stats d'un utilisateur doivent être réinitialisées
 */
export async function checkStatsResetStatus(userId: string): Promise<{
  success: boolean
  data?: StatsResetStatus
  error?: string
}> {
  try {
    // Appeler notre route API sécurisée au lieu du RPC direct (qui est désormais bloqué pour le public)
    const response = await fetch('/api/analytics/stats-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check', userId })
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('Error checking stats reset status:', errorText)
      return { success: false, error: `Erreur serveur (${response.status})` }
    }

    const result = await response.json()

    if (!result.success) {
      console.error('Error checking stats reset status:', result.error)
      return { success: false, error: result.error }
    }
    
    const needsReset = typeof result.data === 'boolean' ? result.data : (result.data?.needsReset ?? false)
    const lastResetAt = typeof result.data === 'object' && result.data?.lastResetAt ? result.data.lastResetAt : null

    const lastResetDate = lastResetAt ? new Date(lastResetAt) : null
    const now = new Date()

    let daysSinceReset = 0
    let daysUntilNextReset = RESET_INTERVAL_DAYS

    if (lastResetDate) {
      const diffMs = now.getTime() - lastResetDate.getTime()
      daysSinceReset = Math.floor(diffMs / (24 * 60 * 60 * 1000))
      daysUntilNextReset = Math.max(0, RESET_INTERVAL_DAYS - daysSinceReset)
    }

    return {
      success: true,
      data: {
        needsReset,
        lastResetAt,
        daysSinceReset,
        daysUntilNextReset
      }
    }
  } catch (error) {
    console.error('Error in checkStatsResetStatus:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Réinitialise les stats d'un utilisateur
 * Cette fonction supprime tous les événements analytics depuis le dernier reset
 */
export async function resetUserStats(userId: string): Promise<StatsResetResult> {
  try {
    console.log(`🔄 Réinitialisation des stats pour l'utilisateur ${userId}...`)

    // Appeler la route API pour réinitialiser
    const response = await fetch('/api/analytics/stats-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset', userId })
    })

    const result = await response.json()

    if (!result.success) {
      console.error('❌ Erreur lors du reset des stats:', result.error)
      return {
        success: false,
        message: 'Erreur lors de la réinitialisation',
        error: result.error
      }
    }

    const data = result.data
    // La fonction RPC retourne un tableau avec un seul élément ou un objet
    const resultObj = Array.isArray(data) ? data[0] : data

    if (resultObj && resultObj.success) {
      console.log(`✅ Stats réinitialisées avec succès. ${resultObj.deleted_count} événements supprimés.`)
      return {
        success: true,
        deletedCount: resultObj.deleted_count,
        message: resultObj.message
      }
    } else {
      console.error('❌ Échec du reset:', resultObj?.message)
      return {
        success: false,
        message: resultObj?.message || 'Échec de la réinitialisation'
      }
    }
  } catch (error) {
    console.error('❌ Erreur critique dans resetUserStats:', error)
    return {
      success: false,
      message: 'Erreur critique lors de la réinitialisation',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Vérifie et réinitialise automatiquement les stats si nécessaire
 * À appeler au chargement du dashboard
 */
export async function autoResetStatsIfNeeded(userId: string): Promise<{
  success: boolean
  resetPerformed: boolean
  message: string
  error?: string
}> {
  try {
    // Vérifier si un reset est nécessaire
    const statusResult = await checkStatsResetStatus(userId)

    if (!statusResult.success) {
      return {
        success: false,
        resetPerformed: false,
        message: 'Erreur lors de la vérification du statut',
        error: statusResult.error
      }
    }

    // Si pas besoin de reset, retourner
    if (!statusResult.data?.needsReset) {
      return {
        success: true,
        resetPerformed: false,
        message: `Stats OK. Prochain reset dans ${statusResult.data?.daysUntilNextReset} jours.`
      }
    }

    // Effectuer le reset
    console.log(`⚠️ Reset nécessaire détecté (${statusResult.data.daysSinceReset} jours écoulés)`)
    const resetResult = await resetUserStats(userId)

    if (resetResult.success) {
      return {
        success: true,
        resetPerformed: true,
        message: `Stats réinitialisées automatiquement. ${resetResult.deletedCount} événements archivés.`
      }
    } else {
      return {
        success: false,
        resetPerformed: false,
        message: 'Échec de la réinitialisation automatique',
        error: resetResult.error
      }
    }
  } catch (error) {
    console.error('❌ Erreur dans autoResetStatsIfNeeded:', error)
    return {
      success: false,
      resetPerformed: false,
      message: 'Erreur lors du reset automatique',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Récupère le statut de reset pour l'affichage dans le dashboard
 */
export async function getStatsResetInfo(userId: string): Promise<{
  success: boolean
  data?: {
    lastResetDate: string
    daysSinceReset: number
    daysUntilNextReset: number
    nextResetDate: string
    resetCycleProgress: number // 0-100%
  }
  error?: string
}> {
  try {
    const statusResult = await checkStatsResetStatus(userId)

    if (!statusResult.success || !statusResult.data) {
      return { success: false, error: statusResult.error }
    }

    const { lastResetAt, daysSinceReset, daysUntilNextReset } = statusResult.data

    // Calculer la date du prochain reset
    const lastReset = lastResetAt ? new Date(lastResetAt) : new Date()
    const nextReset = new Date(lastReset.getTime() + RESET_INTERVAL_MS)

    // Calculer le pourcentage de progression du cycle
    const progress = Math.min(100, Math.round((daysSinceReset / RESET_INTERVAL_DAYS) * 100))

    return {
      success: true,
      data: {
        lastResetDate: lastReset.toISOString(),
        daysSinceReset,
        daysUntilNextReset,
        nextResetDate: nextReset.toISOString(),
        resetCycleProgress: progress
      }
    }
  } catch (error) {
    console.error('Error in getStatsResetInfo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}
