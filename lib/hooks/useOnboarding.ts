/**
 * Hook personnalisé pour gérer l'état et la logique d'onboarding
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  OnboardingFlowType,
  PendingCreation,
  PublicPagePayload,
  NFCCardPayload,
  OnboardingProgress,
  WizardStep
} from '@/lib/types/onboarding'

// Générer un session_id unique côté client
function generateSessionId(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ofika_session_id')
    if (stored) return stored
    
    const newId = crypto.randomUUID()
    localStorage.setItem('ofika_session_id', newId)
    return newId
  }
  return crypto.randomUUID()
}

export function useOnboarding(flowType: OnboardingFlowType, totalSteps: number = 4) {
  const [sessionId] = useState<string>(generateSessionId)
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [payload, setPayload] = useState<PublicPagePayload | NFCCardPayload>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingCreationId, setPendingCreationId] = useState<string | null>(null)

  const supabase = createClient()

  // Charger une création en attente existante
  useEffect(() => {
    loadPendingCreation()
  }, [sessionId, flowType])

  const loadPendingCreation = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('pending_creations')
        .select('*')
        .eq('session_id', sessionId)
        .eq('type', flowType)
        .single()

      if (data && !error) {
        setPendingCreationId(data.id)
        setPayload(data.payload)
        setCurrentStep(data.step_completed + 1)
        
        // Reconstruire la liste des étapes complétées
        const completed = Array.from({ length: data.step_completed }, (_, i) => i + 1)
        setCompletedSteps(completed)
      }
    } catch (err) {
      console.log('No pending creation found, starting fresh')
    } finally {
      setLoading(false)
    }
  }

  // Sauvegarder automatiquement (debounced)
  const saveProgress = useCallback(async (
    data: Partial<PublicPagePayload | NFCCardPayload>,
    step?: number
  ) => {
    setSaving(true)
    setError(null)

    try {
      const updatedPayload = { ...payload, ...data }
      const stepCompleted = step || currentStep

      if (pendingCreationId) {
        // Mettre à jour
        const { error } = await supabase
          .from('pending_creations')
          .update({
            payload: updatedPayload,
            step_completed: stepCompleted
          })
          .eq('id', pendingCreationId)

        if (error) throw error
      } else {
        // Créer
        const { data: newCreation, error } = await supabase
          .from('pending_creations')
          .insert({
            session_id: sessionId,
            type: flowType,
            payload: updatedPayload,
            step_completed: stepCompleted
          })
          .select()
          .single()

        if (error) throw error
        if (newCreation) {
          setPendingCreationId(newCreation.id)
        }
      }

      setPayload(updatedPayload)
      
      // Sauvegarder aussi dans localStorage comme backup
      localStorage.setItem(`ofika_onboarding_${flowType}`, JSON.stringify(updatedPayload))
    } catch (err: any) {
      console.error('Error saving progress:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [sessionId, flowType, payload, pendingCreationId, currentStep, supabase])

  // Passer à l'étape suivante
  const nextStep = useCallback(async (data?: Partial<PublicPagePayload | NFCCardPayload>) => {
    if (currentStep < totalSteps) {
      if (data) {
        await saveProgress(data, currentStep)
      }
      
      setCompletedSteps(prev => [...new Set([...prev, currentStep])])
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps, saveProgress])

  // Revenir à l'étape précédente
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // Aller à une étape spécifique
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
    }
  }, [totalSteps])

  // Finaliser et créer le profil/carte
  const finalize = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          type: flowType,
          user_id: userId
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la finalisation')
      }

      // Nettoyer localStorage
      localStorage.removeItem(`ofika_onboarding_${flowType}`)
      
      return result
    } catch (err: any) {
      console.error('Error finalizing:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sessionId, flowType])

  // Calculer la progression
  const progress: OnboardingProgress = {
    currentStep,
    totalSteps,
    completedSteps,
    percentComplete: Math.round((completedSteps.length / totalSteps) * 100)
  }

  // Générer les étapes pour le UI
  const steps: WizardStep[] = Array.from({ length: totalSteps }, (_, i) => ({
    number: i + 1,
    title: `Étape ${i + 1}`,
    description: '',
    isCompleted: completedSteps.includes(i + 1),
    isActive: currentStep === i + 1
  }))

  return {
    // État
    sessionId,
    currentStep,
    completedSteps,
    payload,
    loading,
    saving,
    error,
    progress,
    steps,
    
    // Actions
    saveProgress,
    nextStep,
    previousStep,
    goToStep,
    finalize,
    setPayload,
    setError
  }
}
