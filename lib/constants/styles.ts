/**
 * Constantes de style centralisées pour l'application
 * Élimine la duplication des classes CSS
 */

export const GRADIENTS = {
  // Gradient principal de l'application
  primary: "bg-gradient-to-br from-orange-50 via-white to-pink-50",
  
  // Gradient pour les boutons et éléments actifs
  button: "bg-gradient-to-r from-orange-500 to-pink-500",
  buttonHover: "from-orange-600 to-pink-600",
  
  // Gradient pour le logo
  logo: "bg-gradient-to-br from-orange-500 to-pink-500",
  
  // Autres gradients utiles
  card: "bg-gradient-to-br from-white to-orange-50",
  success: "bg-gradient-to-br from-green-50 to-emerald-50",
  warning: "bg-gradient-to-br from-yellow-50 to-orange-50",
  error: "bg-gradient-to-br from-red-50 to-pink-50"
} as const

export const LAYOUTS = {
  // Layout centré avec hauteur pleine
  centered: "min-h-screen flex items-center justify-center",
  
  // Layout avec gradient de fond
  centeredWithGradient: "min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50",
  
  // Container responsive
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  
  // Container étroit (pour formulaires, etc.)
  containerNarrow: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8",
  
  // Padding standard
  padding: "p-4 sm:p-6 lg:p-8",
  paddingX: "px-4 sm:px-6 lg:px-8",
  paddingY: "py-4 sm:py-6 lg:py-8"
} as const

export const COLORS = {
  // Couleurs principales
  primary: {
    text: "text-orange-600",
    bg: "bg-orange-500",
    hover: "hover:bg-orange-600",
    border: "border-orange-500"
  },
  
  secondary: {
    text: "text-pink-600",
    bg: "bg-pink-500",
    hover: "hover:bg-pink-600",
    border: "border-pink-500"
  },
  
  // États
  success: {
    text: "text-green-600",
    bg: "bg-green-500",
    hover: "hover:bg-green-600",
    border: "border-green-500"
  },
  
  error: {
    text: "text-red-600",
    bg: "bg-red-500",
    hover: "hover:bg-red-600",
    border: "border-red-500"
  },
  
  warning: {
    text: "text-yellow-600",
    bg: "bg-yellow-500",
    hover: "hover:bg-yellow-600",
    border: "border-yellow-500"
  }
} as const

export const ANIMATIONS = {
  // Animations de chargement
  spin: "animate-spin",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  
  // Transitions
  transition: "transition-all duration-200",
  transitionSlow: "transition-all duration-300",
  transitionFast: "transition-all duration-150"
} as const

export const SHADOWS = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  card: "shadow-xl hover:shadow-2xl transition-shadow"
} as const

/**
 * Helper pour combiner facilement les classes
 * 
 * @example
 * <div className={combineClasses(LAYOUTS.centered, GRADIENTS.primary, 'p-4')}>
 */
export function combineClasses(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
