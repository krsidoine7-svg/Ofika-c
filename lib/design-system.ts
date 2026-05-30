/**
 * 🎨 OFIKA DESIGN SYSTEM
 * 
 * Ce fichier centralise tous les éléments de design du projet Ofika :
 * - Palette de couleurs (mode clair/sombre)
 * - Polices et typographie
 * - Tailles et espacements
 * - Classes utilitaires personnalisées
 * - Animations et transitions
 * 
 * @version 1.0.0
 * @author Ofika Team
 */

// ============================================================================
// 🎨 PALETTE DE COULEURS
// ============================================================================

export const colors = {
  // Couleurs principales (mode clair)
  background: 'oklch(1 0 0)', // Blanc pur
  foreground: 'oklch(0.145 0 0)', // Noir profond
  primary: 'oklch(0.145 0 0)', // Noir
  primaryForeground: 'oklch(0.985 0 0)', // Blanc cassé
  
  // Couleurs secondaires
  secondary: 'oklch(0.97 0 0)', // Gris très clair
  secondaryForeground: 'oklch(0.145 0 0)', // Noir
  muted: 'oklch(0.97 0 0)', // Gris très clair
  mutedForeground: 'oklch(0.45 0 0)', // Gris moyen
  accent: 'oklch(0.97 0 0)', // Gris très clair
  accentForeground: 'oklch(0.145 0 0)', // Noir
  
  // Couleurs d'interface
  border: 'oklch(0.922 0 0)', // Gris clair
  input: 'oklch(0.922 0 0)', // Gris clair
  ring: 'oklch(0.145 0 0)', // Noir
  
  // Couleurs d'état
  destructive: 'oklch(0.577 0.245 27.325)', // Rouge orangé
  destructiveForeground: 'oklch(0.985 0 0)', // Blanc cassé
  
  // Couleurs de marque Ofika ��💗
  ofika: {
    orange: 'oklch(0.7 0.15 45)', // Orange vif
    pink: 'oklch(0.75 0.12 350)', // Rose vif
    orangeHex: '#d2691e',
    pinkHex: '#b91c7c',
    gradient: 'linear-gradient(135deg, #d2691e, #cc5500, #b91c7c)',
  },
  
  // Couleurs de graphiques
  chart: {
    '1': 'oklch(0.646 0.222 41.116)', // Orange
    '2': 'oklch(0.6 0.118 184.704)', // Bleu
    '3': 'oklch(0.398 0.07 227.392)', // Bleu foncé
    '4': 'oklch(0.828 0.189 84.429)', // Vert
    '5': 'oklch(0.769 0.188 70.08)', // Vert clair
  },
  
  // Couleurs sidebar
  sidebar: {
    background: 'oklch(0.985 0 0)', // Blanc cassé
    foreground: 'oklch(0.145 0 0)', // Noir
    primary: 'oklch(0.205 0 0)', // Gris foncé
    primaryForeground: 'oklch(0.985 0 0)', // Blanc cassé
    accent: 'oklch(0.97 0 0)', // Gris très clair
    accentForeground: 'oklch(0.145 0 0)', // Noir
    border: 'oklch(0.922 0 0)', // Gris clair
    ring: 'oklch(0.145 0 0)', // Noir
  },
} as const;

// ============================================================================
// 🔤 POLICES ET TYPOGRAPHIE
// ============================================================================

export const typography = {
  // Polices principales
  fontFamily: {
    sans: 'var(--font-inter), Inter, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
  
  // Tailles de police
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },
  
  // Hauteurs de ligne
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Poids de police
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Classes typographiques responsives
  responsive: {
    text: 'text-sm sm:text-base lg:text-lg',
    heading: 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl',
    subheading: 'text-lg sm:text-xl lg:text-2xl',
    caption: 'text-xs sm:text-sm',
  },
} as const;

// ============================================================================
// 📏 TAILLES ET ESPACEMENTS
// ============================================================================

export const spacing = {
  // Rayons de bordure
  radius: {
    none: '0',
    sm: 'calc(var(--radius) - 4px)', // 6px
    md: 'calc(var(--radius) - 2px)', // 8px
    lg: 'var(--radius)', // 10px
    xl: 'calc(var(--radius) + 4px)', // 14px
    '2xl': 'calc(var(--radius) + 8px)', // 18px
    '3xl': 'calc(var(--radius) + 12px)', // 22px
    full: '9999px',
  },
  
  // Espacements (padding/margin)
  space: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
  },
  
  // Classes d'espacement responsives
  responsive: {
    padding: 'p-4 sm:p-6 lg:p-8',
    margin: 'm-4 sm:m-6 lg:m-8',
    paddingX: 'px-4 sm:px-6 lg:px-8',
    paddingY: 'py-4 sm:py-6 lg:py-8',
    marginX: 'mx-4 sm:mx-6 lg:mx-8',
    marginY: 'my-4 sm:my-6 lg:my-8',
  },
} as const;

// ============================================================================
// 📱 BREAKPOINTS RESPONSIVES
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// 🎯 CIBLES TACTILES
// ============================================================================

export const touchTargets = {
  min: 'min-h-[44px] min-w-[44px]',
  sm: 'min-h-[32px] min-w-[32px]',
  md: 'min-h-[44px] min-w-[44px]',
  lg: 'min-h-[56px] min-w-[56px]',
} as const;

// ============================================================================
// 🎭 CLASSES UTILITAIRES PERSONNALISÉES
// ============================================================================

export const customClasses = {
  // Gradients Ofika
  gradients: {
    ofika: 'bg-gradient-to-br from-orange-600 via-orange-500 to-pink-600',
    ofikaText: 'bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent',
    ofikaHover: 'hover:from-orange-700 hover:via-orange-600 hover:to-pink-700',
  },
  
  // Animations
  animations: {
    fadeInUp: 'animate-fadeInUp',
    pulseGlow: 'animate-pulse-glow',
    bounceIn: 'animate-bounce-in',
    slideInDown: 'animate-slideInDown',
    slideInUp: 'animate-slideInUp',
  },
  
  // Transitions
  transitions: {
    smooth: 'transition-all duration-300 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out',
    bounce: 'transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Responsive utilities
  responsive: {
    mobileOnly: 'block sm:hidden',
    tabletOnly: 'hidden sm:block lg:hidden',
    desktopOnly: 'hidden lg:block',
    mobileTablet: 'block lg:hidden',
    tabletDesktop: 'hidden sm:block',
  },
  
  // Grilles responsives
  grids: {
    responsive: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    responsive2: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6',
    responsive3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  },
  
  // Flex responsives
  flex: {
    responsive: 'flex-col sm:flex-row',
    responsiveReverse: 'flex-col-reverse sm:flex-row',
    responsiveWrap: 'flex-wrap sm:flex-nowrap',
  },
} as const;

// ============================================================================
// 🎨 THÈMES CSS CUSTOM PROPERTIES
// ============================================================================

export const cssVariables = {
  light: {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
    '--destructive': colors.destructive,
    '--destructive-foreground': colors.destructiveForeground,
    '--radius': '0.625rem',
  },
  dark: {
    '--background': 'oklch(0.09 0 0)', // Noir profond
    '--foreground': 'oklch(0.98 0 0)', // Blanc cassé
    '--primary': 'oklch(0.98 0 0)', // Blanc cassé
    '--primary-foreground': 'oklch(0.09 0 0)', // Noir profond
    '--secondary': 'oklch(0.15 0 0)', // Gris très foncé
    '--secondary-foreground': 'oklch(0.98 0 0)', // Blanc cassé
    '--muted': 'oklch(0.15 0 0)', // Gris très foncé
    '--muted-foreground': 'oklch(0.65 0 0)', // Gris moyen
    '--accent': 'oklch(0.15 0 0)', // Gris très foncé
    '--accent-foreground': 'oklch(0.98 0 0)', // Blanc cassé
    '--border': 'oklch(0.15 0 0)', // Gris très foncé
    '--input': 'oklch(0.15 0 0)', // Gris très foncé
    '--ring': 'oklch(0.98 0 0)', // Blanc cassé
    '--destructive': 'oklch(0.577 0.245 27.325)', // Rouge orangé
    '--destructive-foreground': 'oklch(0.98 0 0)', // Blanc cassé
    '--radius': '0.625rem',
  },
} as const;

// ============================================================================
// 🎯 TYPES TYPESCRIPT
// ============================================================================

export type ColorKey = keyof typeof colors;
export type TypographyKey = keyof typeof typography;
export type SpacingKey = keyof typeof spacing;
export type BreakpointKey = keyof typeof breakpoints;
export type CustomClassKey = keyof typeof customClasses;

// ============================================================================
// 🛠️ FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Génère une classe CSS avec le préfixe Ofika
 */
export const ofikaClass = (className: string): string => `ofika-${className}`;

/**
 * Génère une classe responsive
 */
export const responsiveClass = (base: string, sm?: string, lg?: string): string => {
  const classes = [base];
  if (sm) classes.push(`sm:${sm}`);
  if (lg) classes.push(`lg:${lg}`);
  return classes.join(' ');
};

/**
 * Génère une classe de gradient Ofika
 */
export const ofikaGradient = (direction: 'to-r' | 'to-br' | 'to-tr' = 'to-br'): string => 
  `bg-gradient-${direction} from-orange-600 via-orange-500 to-pink-600`;

/**
 * Génère une classe de texte avec gradient Ofika
 */
export const ofikaTextGradient = (): string => 
  'bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent';

// ============================================================================
// 📋 EXPORT PAR DÉFAUT
// ============================================================================

export default {
  colors,
  typography,
  spacing,
  breakpoints,
  touchTargets,
  customClasses,
  cssVariables,
  ofikaClass,
  responsiveClass,
  ofikaGradient,
  ofikaTextGradient,
};
