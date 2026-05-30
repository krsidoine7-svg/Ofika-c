import { z } from 'zod'

// Schema pour validation des contacts (protection XSS/injection)
export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom est trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom contient des caractères invalides'),
  
  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^[\d\s\+\-()]+$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  
  company: z.string()
    .max(100, 'Nom de société trop long')
    .optional()
    .or(z.literal('')),
  
  job_title: z.string()
    .max(100, 'Titre trop long')
    .optional()
    .or(z.literal('')),
  
  notes: z.string()
    .max(500, 'Notes trop longues (max 500 caractères)')
    .optional()
    .or(z.literal('')),
  
  emojis: z.array(z.string().regex(/^\p{Emoji}$/u, 'Emoji invalide'))
    .max(5, 'Maximum 5 emojis')
    .optional()
    .default([])
})

export type ContactInput = z.infer<typeof contactSchema>

// Schema pour consentement RGPD
export const consentSchema = z.object({
  consent_type: z.enum(['data_storage', 'push_notifications', 'analytics']),
  consent_given: z.boolean(),
  consent_version: z.string().default('1.0')
})

export type ConsentInput = z.infer<typeof consentSchema>

// Schema pour emojis
export const emojiSchema = z.object({
  emoji: z.string().regex(/^\p{Emoji}$/u, 'Emoji invalide'),
  label: z.string().optional(),
  category: z.enum(['positive', 'negative', 'neutral', 'professional']).optional()
})

export type EmojiInput = z.infer<typeof emojiSchema>

// Helper de sanitization (anti-XSS)
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/javascript:/gi, '') // Bloquer javascript:
    .replace(/on\w+=/gi, '') // Bloquer onload=, onclick=, etc.
    .trim()
}

// Validation stricte pour inputs utilisateur
export function validateAndSanitizeContact(data: unknown): ContactInput {
  const parsed = contactSchema.parse(data)
  
  return {
    ...parsed,
    name: sanitizeInput(parsed.name),
    email: parsed.email ? sanitizeInput(parsed.email) : undefined,
    phone: parsed.phone ? sanitizeInput(parsed.phone) : undefined,
    company: parsed.company ? sanitizeInput(parsed.company) : undefined,
    job_title: parsed.job_title ? sanitizeInput(parsed.job_title) : undefined,
    notes: parsed.notes ? sanitizeInput(parsed.notes) : undefined
  }
}
