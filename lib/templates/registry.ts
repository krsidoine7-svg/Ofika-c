// =====================================================
// Registre des templates de page publique
// Source unique : liste des templates, noms affichés, et correspondance
// des anciens identifiants (11 anciens templates) vers les 8 nouveaux.
// =====================================================

export type TemplateId =
  | 'editorial'
  | 'carte'
  | 'bento'
  | 'noir_luxe'
  | 'immersif'
  | 'boutique'
  | 'organique'
  | 'suisse'

export interface TemplateInfo {
  id: TemplateId
  label: string
  description: string
  audience: string
}

/** Les 8 templates, dans l'ordre d'affichage des sélecteurs. */
export const TEMPLATES: TemplateInfo[] = [
  { id: 'editorial', label: 'Éditorial', description: 'Grande photo façon magazine, nom en serif, liens numérotés', audience: 'Architectes, artistes, consultants' },
  { id: 'carte', label: 'Carte de visite', description: 'Une vraie carte de visite premium et 4 actions rapides', audience: 'Cadres, entreprises, commerciaux' },
  { id: 'bento', label: 'Bento', description: 'Grille de tuiles de tailles différentes, moderne et colorée', audience: 'Créatifs, startups, développeurs' },
  { id: 'noir_luxe', label: 'Noir Luxe', description: 'Fond noir, portrait en arche cerclé d’or, capitales espacées', audience: 'Luxe, joaillerie, événementiel' },
  { id: 'immersif', label: 'Immersif', description: 'Photo plein écran et boutons en verre dépoli posés dessus', audience: 'Influenceurs, artistes, créateurs' },
  { id: 'boutique', label: 'Boutique', description: 'Bandeau de marque, vitrine de liens et bouton Commander', audience: 'Commerçants, e-commerce' },
  { id: 'organique', label: 'Organique', description: 'Tons naturels, portrait en arche et bouton Réserver', audience: 'Beauté, bien-être, santé' },
  { id: 'suisse', label: 'Suisse', description: 'Typographie géante, liste numérotée, un point de couleur', audience: 'Freelances, consultants' },
]

export const DEFAULT_TEMPLATE: TemplateId = 'editorial'

const TEMPLATE_IDS = new Set<string>(TEMPLATES.map((t) => t.id))

/** Anciens identifiants de design → nouveau template le plus proche. */
export const LEGACY_DESIGN_MAP: Record<string, TemplateId> = {
  design1: 'editorial',
  'design-modern': 'editorial',
  design2: 'bento',
  'design-glass': 'bento',
  design3: 'bento',
  'design-neo': 'bento',
  design4: 'organique',
  'design-minimal': 'organique',
  premium: 'organique',
  'design-premium': 'organique',
  design7: 'noir_luxe',
  'design-bento': 'noir_luxe',
  prestige: 'noir_luxe',
  cjcd: 'noir_luxe',
  influencer: 'immersif',
  'design-influencer': 'immersif',
  social_creator: 'immersif',
  'social-creator': 'immersif',
  'design-social': 'immersif',
  ecommerce: 'boutique',
  'design-ecommerce': 'boutique',
  freelance: 'suisse',
  'design-freelance': 'suisse',
  // Noms utilisés par l'ancien onboarding des cartes NFC
  classic: 'editorial',
  grid: 'bento',
  creative: 'bento',
  showcase: 'organique',
  nature: 'organique',
  dark: 'noir_luxe',
}

/** true si l'identifiant est un des 8 templates actuels. */
export function isCurrentTemplate(designId?: string | null): designId is TemplateId {
  return !!designId && TEMPLATE_IDS.has(designId)
}

/** Template à afficher pour n'importe quel identifiant (actuel, ancien ou vide). */
export function resolveTemplateId(designId?: string | null): TemplateId {
  if (isCurrentTemplate(designId)) return designId
  return (designId && LEGACY_DESIGN_MAP[designId]) || DEFAULT_TEMPLATE
}

/** Nom affiché du template (gère aussi les anciens identifiants). */
export function getTemplateLabel(designId?: string | null): string {
  const id = resolveTemplateId(designId)
  return TEMPLATES.find((t) => t.id === id)?.label || 'Éditorial'
}
