// =====================================================
// TYPES: Système de Templates Dynamiques
// =====================================================

/**
 * Types de champs supportés dans les templates
 */
export type TemplateFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'url'
  | 'email'
  | 'select'
  | 'social_account'

/**
 * Sources d'import OAuth pour les métriques sociales
 */
export type SocialImportSource = 
  | 'instagram_oauth'
  | 'tiktok_oauth'
  | 'youtube_oauth'
  | 'twitter_oauth'
  | 'linkedin_oauth'

/**
 * Définition d'un champ de template
 */
export interface TemplateField {
  /** Nom du champ (utilisé comme clé dans les données) */
  name: string
  
  /** Type du champ */
  type: TemplateFieldType
  
  /** Label affiché à l'utilisateur */
  label: string
  
  /** Placeholder pour le champ */
  placeholder?: string
  
  /** Si le champ est requis */
  required?: boolean
  
  /** Regex de validation (pour text/textarea) */
  validation?: string
  
  /** Message d'erreur personnalisé */
  errorMessage?: string
  
  /** Valeur minimale (pour number) */
  min?: number
  
  /** Valeur maximale (pour number/text/textarea) */
  max?: number
  
  /** Options pour les selects */
  options?: string[]
  
  /** Source d'import OAuth si disponible */
  import_source?: SocialImportSource
  
  /** Description/aide pour l'utilisateur */
  helpText?: string
  
  /** Icône à afficher (optionnel) */
  icon?: string
}

/**
 * Schéma JSON d'un template
 */
export interface TemplateSchemaJson {
  /** Liste des champs du template */
  fields: TemplateField[]
  
  /** Configuration optionnelle */
  config?: {
    /** Permet l'auto-save */
    autoSave?: boolean
    
    /** Affiche un récapitulatif avant soumission */
    showSummary?: boolean
  }
}

/**
 * Template complet avec métadonnées
 */
export interface TemplateSchema {
  id: string
  name: string
  slug: string
  description?: string
  schema: TemplateSchemaJson
  version: number
  is_active: boolean
  
  /** Catégorie du template */
  category?: string
  
  /** Icône du template */
  icon?: string
  
  /** Label de priorité (ex: "Premium", "Populaire") */
  priority_label?: string
  
  /** Audience cible */
  target_audience?: string
  
  /** Fonctionnalités principales */
  features?: string[]
  
  /** Statistiques d'utilisation */
  stats?: {
    users?: string
    satisfaction?: string
    conversion?: string
  }
  
  created_at: string
  updated_at: string
}

/**
 * Données de template pour un profil spécifique
 */
export interface ProfileTemplateData {
  id: string
  profile_id: string
  template_id: string
  
  /** Valeurs des champs du template */
  fields: Record<string, any>
  
  /** Métadonnées additionnelles */
  metadata?: {
    /** Dernière modification */
    last_modified_field?: string
    
    /** Champs importés via OAuth */
    imported_fields?: string[]
    
    /** Timestamp du dernier import */
    last_import_at?: string
  }
  
  created_at: string
  updated_at: string
}

/**
 * Profil enrichi avec données de template
 */
export interface ProfileWithTemplate {
  // Champs de base du profil
  id: string
  user_id: string
  name: string
  bio?: string
  image_url?: string
  custom_url?: string
  username?: string
  email?: string
  phone?: string
  
  // Réseaux sociaux (nouveau système dynamique)
  social_links?: Array<{
    type: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin' | 'github' | 'website' | 'other'
    url: string
    label?: string
  }>
  
  // Template
  design_choice: string
  template?: TemplateSchema
  template_data?: ProfileTemplateData
  
  // Métadonnées
  is_public: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Payload pour créer un profil avec template
 */
export interface CreateProfileWithTemplatePayload {
  /** Champs de base (universels) */
  baseFields: {
    name: string
    bio?: string
    image_url?: string
    email?: string
    phone?: string
    custom_url: string
    is_public?: boolean
    
    // Réseaux sociaux de base
    whatsapp?: string
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    tiktok?: string
    website?: string
  }
  
  /** ID du template sélectionné */
  templateId: string
  
  /** Champs spécifiques au template */
  templateFields?: Record<string, any>
}

/**
 * Payload pour mettre à jour un profil
 */
export interface UpdateProfileWithTemplatePayload {
  /** Champs de base à mettre à jour */
  baseFields?: Partial<CreateProfileWithTemplatePayload['baseFields']>
  
  /** Champs de template à mettre à jour */
  templateFields?: Record<string, any>
}

/**
 * Résultat de validation d'un champ
 */
export interface FieldValidationResult {
  valid: boolean
  error?: string
  value?: any
}

/**
 * Configuration OAuth pour import social
 */
export interface SocialOAuthConfig {
  provider: SocialImportSource
  clientId: string
  redirectUri: string
  scope: string[]
  authUrl: string
}

/**
 * Résultat d'import OAuth
 */
export interface SocialImportResult {
  success: boolean
  provider: SocialImportSource
  data?: Record<string, any>
  error?: string
}

/**
 * Event analytics pour le tracking
 */
export type TemplateAnalyticsEvent =
  | { name: 'onboarding_started'; properties?: Record<string, any> }
  | { name: 'onboarding_base_form_completed'; properties: { has_image: boolean; has_bio: boolean } }
  | { name: 'template_selected'; properties: { template_name: string; template_id: string; template_category: string } }
  | { name: 'template_form_completed'; properties: { template_name: string; field_count: number; filled_fields: number } }
  | { name: 'profile_created'; properties: { template_name: string; has_template_fields: boolean; total_fields: number } }
  | { name: 'profile_edit_started'; properties: { template_name: string } }
  | { name: 'profile_edit_base_updated'; properties: { fields_changed: string[] } }
  | { name: 'profile_edit_template_updated'; properties: { template_name: string; fields_changed: string[] } }
  | { name: 'social_import_initiated'; properties: { platform: SocialImportSource } }
  | { name: 'social_import_completed'; properties: { platform: SocialImportSource; imported_fields: string[] } }
  | { name: 'social_import_failed'; properties: { platform: SocialImportSource; error: string } }

/**
 * Options pour le rendu d'un formulaire dynamique
 */
export interface DynamicFormOptions {
  /** Afficher les labels */
  showLabels?: boolean
  
  /** Afficher les textes d'aide */
  showHelpText?: boolean
  
  /** Afficher les indicateurs de champs requis */
  showRequiredIndicators?: boolean
  
  /** Mode compact */
  compact?: boolean
  
  /** Désactiver tous les champs */
  disabled?: boolean
  
  /** Callback pour import social */
  onSocialImport?: (field: TemplateField) => Promise<void>
}

/**
 * Type guard pour vérifier si un objet est un TemplateField valide
 */
export function isTemplateField(obj: any): obj is TemplateField {
  return (
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.label === 'string'
  )
}

/**
 * Type guard pour vérifier si un objet est un TemplateSchema valide
 */
export function isTemplateSchema(obj: any): obj is TemplateSchema {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.schema === 'object' &&
    Array.isArray(obj.schema.fields)
  )
}
