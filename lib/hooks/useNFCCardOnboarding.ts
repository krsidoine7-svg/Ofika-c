'use client'

import { useReducer, useCallback, useEffect } from 'react'
import { 
  OnboardingState, 
  OnboardingAction, 
  NFCCardFormData, 
  CardDesign, 
  ColorOption,
  CARD_DESIGNS,
  COLOR_OPTIONS,
  ONBOARDING_STEPS
} from '@/lib/types/nfc-card-onboarding'

// État initial
const initialState: OnboardingState = {
  currentStep: ONBOARDING_STEPS.INTRO,
  totalSteps: 6,
  formData: {
    fullName: '',
    company: '',
    jobTitle: '',
    bio: '',
    phone: '',
    email: '',
    instagram: '',
    tiktok: '',
    linkedin: '',
    otherLinks: '',
    location: '',
    profileName: '',
    username: '',
    customUrl: '',
    logoFile: undefined,
    logoUrl: undefined,
    consentEssential: true, // Par défaut à true car requis pour l'onboarding
    consentDataProcessing: false,
    consentTerms: false
  },
  selectedDesign: null,
  selectedColor: null,
  isLoading: false,
  error: null
}

// Reducer pour gérer l'état
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
        error: null
      }
    
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
        error: null
      }
    
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
        error: null
      }
    
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload
        },
        error: null
      }
    
    case 'SET_DESIGN':
      return {
        ...state,
        selectedDesign: action.payload,
        error: null
      }
    
    case 'SET_COLOR':
      return {
        ...state,
        selectedColor: action.payload,
        error: null
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    
    case 'RESET':
      return {
        ...initialState,
        totalSteps: 6 // S'assurer que le total est correct après reset
      }

    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.payload,
        formData: {
          ...state.formData,
          ...(action.payload?.formData || {})
        }
      }
    
    default:
      return state
  }
}

export function useNFCCardOnboarding() {
  const [state, dispatch] = useReducer(onboardingReducer, initialState)

  // Charger l'état sauvegardé au montage (Client-side uniquement)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nfc_card_onboarding_state')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          dispatch({ type: 'RESTORE_STATE', payload: parsed })
        } catch (e) {
          console.error("Erreur de chargement de l'état onboarding:", e)
        }
      }
    }
  }, [])

  // Sauvegarder l'état à chaque modification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        currentStep: state.currentStep,
        formData: state.formData,
        selectedDesign: state.selectedDesign,
        selectedColor: state.selectedColor
      }
      localStorage.setItem('nfc_card_onboarding_state', JSON.stringify(stateToSave))
    }
  }, [state.currentStep, state.formData, state.selectedDesign, state.selectedColor])

  // Actions
  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' })
  }, [])

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' })
  }, [])

  const updateFormData = useCallback((data: Partial<NFCCardFormData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: data })
  }, [])

  const setDesign = useCallback((design: CardDesign) => {
    dispatch({ type: 'SET_DESIGN', payload: design })
  }, [])

  const setColor = useCallback((color: ColorOption) => {
    dispatch({ type: 'SET_COLOR', payload: color })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const reset = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nfc_card_onboarding_state')
    }
    dispatch({ type: 'RESET' })
  }, [])

  // Validation des étapes
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case ONBOARDING_STEPS.INTRO:
        return true
      
      case ONBOARDING_STEPS.FORM:
        return !!(
          state.formData.fullName &&
          state.formData.phone &&
          state.formData.email &&
          state.formData.consentTerms
        )
      
      case ONBOARDING_STEPS.SIGNUP:
        return true // La validation se fait dans le composant Signup
      
      case ONBOARDING_STEPS.DESIGN:
        return !!(state.selectedDesign && state.selectedColor)
      
      case ONBOARDING_STEPS.PROFILE_SELECTION:
        return true
      
      case ONBOARDING_STEPS.SUCCESS:
        return true
      
      default:
        return false
    }
  }, [state.formData, state.selectedDesign, state.selectedColor])

  // Navigation avec validation
  const goToNextStep = useCallback(() => {
    if (validateStep(state.currentStep)) {
      nextStep()
    } else {
      setError('Veuillez remplir tous les champs obligatoires')
    }
  }, [state.currentStep, validateStep, nextStep, setError])

  const goToPrevStep = useCallback(() => {
    prevStep()
  }, [prevStep])

  // Helpers
  const canGoNext = useCallback(() => {
    return validateStep(state.currentStep) && state.currentStep < state.totalSteps
  }, [state.currentStep, state.totalSteps, validateStep])

  const canGoPrev = useCallback(() => {
    return state.currentStep > 1
  }, [state.currentStep])

  const isLastStep = useCallback(() => {
    return state.currentStep === state.totalSteps
  }, [state.currentStep, state.totalSteps])

  const isFirstStep = useCallback(() => {
    return state.currentStep === 1
  }, [state.currentStep])

  // Progression
  const progress = useCallback(() => {
    return (state.currentStep / state.totalSteps) * 100
  }, [state.currentStep, state.totalSteps])

  // Données complètes pour la création
  const getCompleteData = useCallback(() => {
    return {
      formData: state.formData,
      selectedDesign: state.selectedDesign,
      selectedColor: state.selectedColor
    }
  }, [state.formData, state.selectedDesign, state.selectedColor])

  return {
    // État
    ...state,
    
    // Actions
    setStep,
    nextStep,
    prevStep,
    updateFormData,
    setDesign,
    setColor,
    setLoading,
    setError,
    reset,
    
    // Navigation
    goToNextStep,
    goToPrevStep,
    
    // Validation
    validateStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    isFirstStep,
    
    // Helpers
    progress,
    getCompleteData
  }
}
