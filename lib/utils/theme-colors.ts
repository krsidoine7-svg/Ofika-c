// Utilitaires de couleurs pour les templates de page publique.
import { resolveTemplateId, type TemplateId } from '@/lib/templates/registry'

// Lit profile.theme_settings (primary_color = fond, secondary_color = accent)
// et calcule des couleurs de texte lisibles selon le fond choisi.

const HEX_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/** Retourne la couleur si c'est un code hexa valide (#abc ou #aabbcc), sinon la valeur par défaut. */
export function safeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX_REGEX.test(value.trim()) ? value.trim() : fallback
}

function toRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Luminance relative (norme WCAG), entre 0 (noir) et 1 (blanc). */
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** true si la couleur est sombre (un texte blanc sera plus lisible dessus). */
export function isDarkColor(hex: string): boolean {
  const l = luminance(hex)
  // Contraste avec blanc vs contraste avec noir : on garde le meilleur
  return (1.05 / (l + 0.05)) > ((l + 0.05) / 0.05)
}

/** Couleur de texte lisible (blanc ou quasi-noir) à poser sur le fond donné. */
export function readableTextOn(hex: string): string {
  return isDarkColor(hex) ? '#ffffff' : '#111827'
}

export interface TemplateColorDefaults {
  /** Couleur d'origine de primary_color pour ce template */
  primary: string
  /** Couleur d'origine de secondary_color pour ce template */
  secondary: string
  /** Libellés affichés à l'utilisateur */
  primaryLabel: string
  secondaryLabel: string
}

/**
 * Couleurs d'origine de chaque template (identiques aux valeurs codées dans les templates).
 * Sert à afficher la vraie couleur actuelle dans le sélecteur quand l'utilisateur n'a rien choisi.
 */
const TEMPLATE_COLOR_DEFAULTS: Record<TemplateId, TemplateColorDefaults> = {
  editorial: { primary: '#f6f3ee', secondary: '#9a5b34', primaryLabel: 'Fond de la page', secondaryLabel: 'Accent (nom, numéros)' },
  carte: { primary: '#0e1a2b', secondary: '#c9a45c', primaryLabel: 'Couleur de la carte', secondaryLabel: 'Accent (bouton, détails)' },
  bento: { primary: '#f2f2ef', secondary: '#c8f169', primaryLabel: 'Fond de la page', secondaryLabel: 'Couleur vive (bouton principal)' },
  noir_luxe: { primary: '#0a0a0a', secondary: '#c9a96e', primaryLabel: 'Fond de la page', secondaryLabel: 'Or (filets, bouton)' },
  immersif: { primary: '#0d0b09', secondary: '#ffd166', primaryLabel: 'Couleur sous la photo', secondaryLabel: 'Accent (étiquette)' },
  boutique: { primary: '#c2562d', secondary: '#1f7a45', primaryLabel: 'Couleur de la marque', secondaryLabel: 'Bouton Commander' },
  organique: { primary: '#efe6da', secondary: '#8a5a44', primaryLabel: 'Fond de la page', secondaryLabel: 'Bouton Réserver et détails' },
  suisse: { primary: '#ffffff', secondary: '#d6371f', primaryLabel: 'Fond de la page', secondaryLabel: 'Point de couleur et bouton' },
}

/** Couleurs d'origine et libellés du template donné (gère aussi les anciens identifiants). */
export function getTemplateColorDefaults(designId?: string | null): TemplateColorDefaults {
  return TEMPLATE_COLOR_DEFAULTS[resolveTemplateId(designId)]
}

export interface ThemeColors {
  /** Couleur de fond de la page */
  bg: string
  /** Couleur d'accent (boutons, badges, détails) */
  accent: string
  /** Texte principal lisible sur le fond */
  onBg: string
  /** Texte secondaire (plus discret) lisible sur le fond */
  onBgMuted: string
  /** Texte lisible sur la couleur d'accent */
  onAccent: string
  isDarkBg: boolean
}

/**
 * Calcule les couleurs d'un template à partir de profile.theme_settings.
 * Sans réglage, les valeurs par défaut du template sont utilisées (rendu inchangé).
 */
export function getThemeColors(
  profile: { theme_settings?: any } | null | undefined,
  defaults: { bg: string; accent: string }
): ThemeColors {
  const settings = profile?.theme_settings || {}
  const bg = safeHex(settings.primary_color, defaults.bg)
  const accent = safeHex(settings.secondary_color, defaults.accent)
  const isDarkBg = isDarkColor(bg)
  return {
    bg,
    accent,
    onBg: isDarkBg ? '#ffffff' : '#111827',
    onBgMuted: isDarkBg ? 'rgba(255,255,255,0.65)' : 'rgba(17,24,39,0.6)',
    onAccent: readableTextOn(accent),
    isDarkBg,
  }
}
