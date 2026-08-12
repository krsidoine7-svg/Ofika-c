import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  first_name: z.string().max(100, 'Le prénom ne peut pas dépasser 100 caractères').optional(),
  last_name: z.string().max(100, 'Le nom de famille ne peut pas dépasser 100 caractères').optional(),
  profile_type: z.enum(['professional', 'personal', 'event']),
  bio: z.string().max(2048, 'La bio ne peut pas dépasser 2048 caractères').optional(),
  company: z.string().max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères').optional(),
  job_title: z.string().max(100, 'Le poste ne peut pas dépasser 100 caractères').optional(),
  image_url: z.union([z.string().url('URL invalide'), z.literal('')]).optional(),
  cover_image_url: z.union([z.string().url('URL invalide'), z.literal('')]).optional(),
  custom_url: z.string()
    .min(3, 'L\'URL personnalisée doit contenir au moins 3 caractères')
    .max(50, 'L\'URL personnalisée ne peut pas dépasser 50 caractères')
    .regex(/^[a-z0-9-]+$/, 'L\'URL personnalisée ne peut contenir que des lettres minuscules, chiffres et tirets')
    .optional(),
  username: z.string().min(3, 'Nom d\'utilisateur trop court').max(50, 'Nom d\'utilisateur trop long').optional(),
  // Contact
  email: z.union([z.string().email('Email invalide'), z.literal('')]).optional(),
  phone: z.union([z.string().min(10, 'Numéro de téléphone invalide').max(20, 'Numéro de téléphone trop long'), z.literal('')]).optional(),
  location: z.string().max(100, 'La localisation ne peut pas dépasser 100 caractères').optional(),
  // Réseaux sociaux (anciens champs pour compatibilité)
  whatsapp: z.union([z.string().url('URL WhatsApp invalide'), z.literal('')]).optional(),
  facebook: z.union([z.string().url('URL Facebook invalide'), z.literal('')]).optional(),
  instagram: z.union([z.string().url('URL Instagram invalide'), z.literal('')]).optional(),
  twitter: z.union([z.string().url('URL Twitter invalide'), z.literal('')]).optional(),
  youtube: z.union([z.string().url('URL YouTube invalide'), z.literal('')]).optional(),
  tiktok: z.union([z.string().url('URL TikTok invalide'), z.literal('')]).optional(),
  website: z.union([z.string().url('URL du site web invalide'), z.literal('')]).optional(),
  // Nouveaux réseaux sociaux avec liste déroulante
  social_links: z.array(z.object({
    platform: z.enum(['whatsapp', 'facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'linkedin', 'snapchat', 'telegram', 'website', 'github', 'shop', 'other']),
    url: z.string().url('URL invalide')
  })).optional().default([]),
  // Liens personnalisés
  custom_links: z.array(z.object({
    title: z.string().min(1, 'Le titre est requis').max(30, 'Le titre ne peut pas dépasser 30 caractères'),
    url: z.string().url('URL invalide'),
    type: z.enum(['website', 'shop', 'other', 'portfolio', 'appointment', 'contact'])
  })).optional().default([]),
  // Design
  design_choice: z.enum([
    'design1', 
    'design2', 
    'design3', 
    'design4', 
    'design7',
    'classic',
    'influencer',
    'ecommerce',
    'freelance'
  ]).default('design1'),
  color_theme: z.string().default('default'),
  is_public: z.boolean().default(true),
  display_reviews: z.boolean().default(false),
  instagram_followers: z.coerce.number().nullable().optional(),
  instagram_posts: z.coerce.number().nullable().optional(),
  instagram_verified: z.boolean().default(false).optional(),
  ig_show_followers: z.boolean().default(true).optional(),
  ig_show_posts: z.boolean().default(true).optional(),
  ig_show_verified: z.boolean().default(true).optional(),
  
  // TikTok
  tiktok_followers: z.coerce.number().nullable().optional(),
  tiktok_posts: z.coerce.number().nullable().optional(),
  tiktok_verified: z.boolean().default(false).optional(),
  tt_show_followers: z.boolean().default(true).optional(),
  tt_show_posts: z.boolean().default(true).optional(),
  tt_show_verified: z.boolean().default(true).optional(),

  // YouTube
  youtube_subscribers: z.coerce.number().nullable().optional(),
  youtube_videos: z.coerce.number().nullable().optional(),
  youtube_verified: z.boolean().default(false).optional(),
  yt_show_subscribers: z.boolean().default(true).optional(),
  yt_show_videos: z.boolean().default(true).optional(),
  yt_show_verified: z.boolean().default(true).optional(),

  // Twitter/X
  twitter_followers: z.coerce.number().nullable().optional(),
  twitter_posts: z.coerce.number().nullable().optional(),
  twitter_verified: z.boolean().default(false).optional(),
  tw_show_followers: z.boolean().default(true).optional(),
  tw_show_posts: z.boolean().default(true).optional(),
  tw_show_verified: z.boolean().default(true).optional(),

  // Facebook
  facebook_followers: z.coerce.number().nullable().optional(),
  facebook_verified: z.boolean().default(false).optional(),
  fb_show_followers: z.boolean().default(true).optional(),
  fb_show_verified: z.boolean().default(true).optional()
})

export const linkSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(30, 'Le titre ne peut pas dépasser 30 caractères'),
  url: z.string().url('URL invalide'),
  position: z.enum(['1', '2']),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type LinkFormData = z.infer<typeof linkSchema>

// AJOUTER LA VALIDATION SERVEUR
export const serverLoginSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string().min(6).max(100),
})

export const serverRegisterSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères'),
  name: z.string().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Le nom contient des caractères invalides'),
})

// =====================================================
// SCHEMAS POUR API ENDPOINTS
// =====================================================

// Onboarding - Save Temp
export const onboardingSaveTempSchema = z.object({
  session_id: z.string().min(1, 'Session ID requis'),
  flow_type: z.enum(['public_page', 'nfc_card']),
  step: z.number().int().min(1),
  data: z.record(z.any()),
  user_email: z.string().email().optional(),
})

// Onboarding - Finalize
export const onboardingFinalizeSchema = z.object({
  session_id: z.string().min(1, 'Session ID requis'),
  flow_type: z.enum(['public_page', 'nfc_card']),
})

// Orders - Create
export const createOrderSchema = z.object({
  nfc_card_id: z.string().uuid('ID de carte NFC invalide').optional(),
  product_type: z.enum(['nfc_card', 'premium_subscription', 'custom']),
  quantity: z.number().int().min(1).max(100, 'Quantité maximale : 100'),
  shipping_address: z.object({
    full_name: z.string().min(2, 'Nom complet requis'),
    address_line1: z.string().min(5, 'Adresse requise'),
    address_line2: z.string().optional(),
    city: z.string().min(2, 'Ville requise'),
    state: z.string().optional(),
    postal_code: z.string().min(2, 'Code postal requis'),
    country: z.string().min(2, 'Pays requis'),
    phone: z.string().min(8, 'Numéro de téléphone requis'),
  }).optional(),
  metadata: z.record(z.any()).optional(),
  promo_code: z.string().optional(),
})

// QR Code - Create
export const createQRCodeSchema = z.object({
  nfc_link: z.string().url('URL cible invalide'),
  redirect_type: z.enum(['nfc_card', 'profile', 'custom']),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})

// QR Code - Update
export const updateQRCodeSchema = z.object({
  nfc_link: z.string().url('URL cible invalide').optional(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
})

// Profile - Create/Update (Server-side with stricter validation)
export const serverProfileSchema = profileSchema.extend({
  social_links: z.array(z.object({
    platform: z.enum(['whatsapp', 'facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'linkedin', 'snapchat', 'telegram', 'website', 'github', 'shop', 'other']),
    url: z.string().url('URL invalide')
  })).max(4, 'Maximum 4 réseaux sociaux autorisés').optional(),
  custom_links: z.array(z.object({
    title: z.string().min(1).max(30),
    url: z.string().url('URL invalide'),
    type: z.enum(['website', 'shop', 'other', 'portfolio', 'appointment', 'contact'])
  })).max(4, 'Maximum 4 liens personnalisés autorisés').optional(),
})

// NFC Card - Create
export const createNFCCardSchema = z.object({
  name: z.string().min(2).max(100),
  design: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide'),
  profile_data: z.record(z.any()),
})

// NFC Card - Update
export const updateNFCCardSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  design: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  profile_data: z.record(z.any()).optional(),
  status: z.enum(['pending', 'ordered', 'shipped', 'delivered', 'active', 'inactive']).optional(),
})

// Contact Form
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères').max(200),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères').max(1000),
})

// Newsletter Subscription
export const newsletterSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2).max(100).optional(),
  interests: z.array(z.string()).optional(),
})

// Type exports
export type OnboardingSaveTempData = z.infer<typeof onboardingSaveTempSchema>
export type OnboardingFinalizeData = z.infer<typeof onboardingFinalizeSchema>
export type CreateOrderData = z.infer<typeof createOrderSchema>
export type CreateQRCodeData = z.infer<typeof createQRCodeSchema>
export type UpdateQRCodeData = z.infer<typeof updateQRCodeSchema>
export type ServerProfileData = z.infer<typeof serverProfileSchema>
export type CreateNFCCardData = z.infer<typeof createNFCCardSchema>
export type UpdateNFCCardData = z.infer<typeof updateNFCCardSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
export type NewsletterData = z.infer<typeof newsletterSchema>
